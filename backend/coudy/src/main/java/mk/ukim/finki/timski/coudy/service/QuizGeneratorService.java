package mk.ukim.finki.timski.coudy.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.timski.coudy.model.domain.QuizQuestion;
import mk.ukim.finki.timski.coudy.model.domain.QuizTopic;
import mk.ukim.finki.timski.coudy.model.domain.SlideContent;
import mk.ukim.finki.timski.coudy.repository.QuizTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class QuizGeneratorService {

    @Value("${azure.ai.endpoint:}")
    private String endpoint;

    @Value("${azure.ai.api-key:}")
    private String apiKey;

    @Value("${azure.ai.model:}")
    private String model;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private QuizTopicRepository repository;

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public List<QuizQuestion> generateQuestionsForTopic(Long topicId, int count) { // ← Long
        QuizTopic topic = repository.findById(topicId).orElseThrow();

        // ✅ Десериjализирај од JSON string → List<SlideContent>
        List<SlideContent> slides = deserializeSlides(topic.getSlidesJson());

        String combinedContent = slides.stream()
                .map(s -> s.getTitle() + ": " + s.getContent())
                .collect(Collectors.joining("\n\n"));

        // keep under ~4000 chars to stay well within the 8000 token limit
        if (combinedContent.length() > 4000) {
            combinedContent = combinedContent.substring(0, 4000);
        }

        String prompt = buildPrompt(topic.getTopic(), combinedContent, count);
        List<QuizQuestion> questions = callClaudeAPI(prompt);

        // ✅ Сериjализирај List<QuizQuestion> → JSON string пред зачувување
        topic.setGeneratedQuestionsJson(serializeQuestions(questions));
        topic.setLastGenerated(LocalDateTime.now());
        repository.save(topic);

        return questions;
    }

    // ✅ Помошни методи за конверзија
    public List<SlideContent> deserializeSlides(String json) {
        try {
            if (json == null || json.isBlank()) return new ArrayList<>();
            return mapper.readValue(json, new TypeReference<List<SlideContent>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize slides", e);
        }
    }

    public List<QuizQuestion> deserializeQuestions(String json) {
        try {
            if (json == null || json.isBlank()) return new ArrayList<>();
            return mapper.readValue(json, new TypeReference<List<QuizQuestion>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize questions", e);
        }
    }

    public String serializeQuestions(List<QuizQuestion> questions) {
        try {
            return mapper.writeValueAsString(questions);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize questions", e);
        }
    }

    private String buildPrompt(String topic, String content, int count) {
        return String.format("""
            Generate exactly %d multiple-choice questions for a university quiz.
            Topic: %s
            Content: %s
            
            Return ONLY a JSON array. Each item must have:
            - "question": string
            - "options": array of exactly 4 strings
            - "correctIndex": integer 0-3
            - "explanation": string (why this answer is correct)
            
            Pure JSON only, no markdown, no extra text.
            """, count, topic, content);
    }

    public List<QuizQuestion> generateFallbackQuestions(QuizTopic topic, int count) {
        List<SlideContent> slides = deserializeSlides(topic.getSlidesJson());

        // Prefer slides with meaningful (non-Macedonian-header) titles
        List<SlideContent> goodSlides = slides.stream()
                .filter(s -> hasMeaningfulTitle(s.getTitle())
                          && s.getContent() != null && !s.getContent().isBlank())
                .collect(Collectors.toList());

        if (goodSlides.size() < 2) {
            goodSlides = slides.stream()
                    .filter(s -> s.getContent() != null && cleanSlideContent(s.getContent()).length() > 30)
                    .collect(Collectors.toList());
        }

        if (goodSlides.size() < 2) return new ArrayList<>();

        List<String> allLabels = goodSlides.stream()
                .map(s -> hasMeaningfulTitle(s.getTitle())
                        ? s.getTitle().replace("\t", " ").trim()
                        : extractFirstConcept(s.getContent()))
                .filter(l -> !l.isBlank())
                .distinct()
                .collect(Collectors.toList());

        if (allLabels.size() < 2) return new ArrayList<>();

        Collections.shuffle(goodSlides);
        List<QuizQuestion> questions = new ArrayList<>();

        for (SlideContent slide : goodSlides) {
            if (questions.size() >= count) break;

            String concept = hasMeaningfulTitle(slide.getTitle())
                    ? slide.getTitle().replace("\t", " ").trim()
                    : extractFirstConcept(slide.getContent());
            if (concept.isBlank()) continue;

            String snippet = extractSnippet(slide.getContent(), 120);
            if (snippet.isBlank()) continue;

            List<String> wrongs = allLabels.stream()
                    .filter(l -> !l.equals(concept))
                    .limit(3)
                    .collect(Collectors.toList());
            while (wrongs.size() < 3) wrongs.add("None of the above");

            List<String> options = new ArrayList<>(wrongs.subList(0, 3));
            options.add(concept);
            Collections.shuffle(options);
            int correctIdx = options.indexOf(concept);

            QuizQuestion q = new QuizQuestion();
            q.setId(UUID.randomUUID().toString());
            q.setQuestion("Which concept in the \"" + topic.getTopic()
                    + "\" material is described as: \"" + snippet + "\"?");
            q.setOptions(options);
            q.setCorrectIndex(correctIdx);
            q.setExplanation("\"" + concept + "\" is described in the course slides as: " + snippet);
            questions.add(q);
        }

        return questions;
    }

    private boolean hasMeaningfulTitle(String title) {
        if (title == null || title.length() < 3) return false;
        String upper = title.toUpperCase();
        return !upper.contains("ФАКУЛТЕТ")
                && !upper.contains("КОМПЈУТЕРСКО")
                && !upper.contains("ИНФОРМАТИЧКИ")
                && !upper.contains("ФИНКИ")
                && !title.trim().matches("\\d+");
    }

    private String extractFirstConcept(String content) {
        String clean = cleanSlideContent(content);
        String[] parts = clean.split("[◼●•\\.\\n]", 2);
        String first = parts[0].trim();
        if (first.length() < 3) return "";
        return first.length() <= 60 ? first : first.substring(0, 55).trim() + "...";
    }

    private String cleanSlideContent(String content) {
        if (content == null) return "";
        return content
                .replaceAll("И КОМПЈУТЕРСКО ИНЖЕНЕРСТВО( ФИНКИ)?", "")
                .replaceAll("ФАКУЛТЕТ ЗА ИНФОРМАТИЧКИ НАУКИ( И КОМПЈУТЕРСКО ИНЖЕНЕРСТВО)?( ФИНКИ)?", "")
                .replaceAll("Copyright © \\d{4} [^.]+\\.", "")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    private String extractSnippet(String content, int maxLen) {
        String clean = cleanSlideContent(content);
        clean = clean.replaceAll("^[◼●•\\s]+", "").trim();
        if (clean.length() > maxLen) {
            int cut = clean.lastIndexOf(' ', maxLen);
            return (cut > 50 ? clean.substring(0, cut) : clean.substring(0, maxLen)).trim() + "...";
        }
        return clean;
    }

    private List<QuizQuestion> callClaudeAPI(String prompt) {
        if (endpoint.isBlank() || apiKey.isBlank() || model.isBlank()) {
            throw new IllegalStateException(
                    "Azure AI configuration is missing. Set AZURE_AI_ENDPOINT, AZURE_AI_API_KEY, and AZURE_AI_MODEL."
            );
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 4000,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                endpoint + "chat/completions", HttpMethod.POST,
                new HttpEntity<>(body, headers),
                (Class<Map<String, Object>>) (Class<?>) Map.class
        );

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String json = (String) message.get("content");
        json = json.replaceAll("```json|```", "").trim();

        try {
            List<QuizQuestion> questions = mapper.readValue(json,
                    new TypeReference<List<QuizQuestion>>() {});
            questions.forEach(q -> q.setId(UUID.randomUUID().toString()));
            return questions;
        } catch (Exception e) {
            System.err.println("=== Failed to parse AI response ===");
            System.err.println(json);
            System.err.println("===================================");
            throw new RuntimeException("Failed to parse Azure AI response: " + e.getMessage(), e);
        }
    }
}
