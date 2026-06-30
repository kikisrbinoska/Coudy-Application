package mk.ukim.finki.timski.coudy.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.timski.coudy.model.domain.*;
import mk.ukim.finki.timski.coudy.repository.QuizSessionRepository;
import mk.ukim.finki.timski.coudy.repository.QuizTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizSessionService {

    @Autowired
    private QuizTopicRepository topicRepository;

    @Autowired
    private QuizSessionRepository sessionRepository;

    @Autowired
    private QuizGeneratorService generatorService;

    public QuizSession createSession(String course, String topic, int questionCount) {
        List<QuizQuestion> pool;

        if (topic != null) {
            QuizTopic t = topicRepository.findByCourseAndTopic(course, topic)
                    .orElseThrow(() -> new RuntimeException("Topic not found: " + topic));
            pool = getOrGenerate(t, questionCount);
        } else {
            List<QuizTopic> topics = topicRepository.findByCourse(course);
            pool = topics.stream()
                    .flatMap(t -> getOrGenerate(t, 5).stream())
                    .collect(Collectors.toList());
        }

        Collections.shuffle(pool);
        List<QuizQuestion> selected = pool.stream()
                .limit(questionCount)
                .collect(Collectors.toList());

        QuizSession session = new QuizSession(
                UUID.randomUUID().toString(), course, topic, selected
        );

        return sessionRepository.save(session);   // ← зачувај во база
    }

    public QuizResult evaluateSession(QuizSubmitRequest req) {
        QuizSession session = sessionRepository.findById(req.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found: " + req.getSessionId()));

        // Десериjализирај прашања од JSON
        List<QuizQuestion> questions =
                generatorService.deserializeQuestions(session.getQuestionsJson());

        List<QuizResult.QuestionResult> results = new ArrayList<>();
        int score = 0;

        for (int i = 0; i < questions.size(); i++) {
            QuizQuestion q = questions.get(i);
            int selected = req.getAnswers().getOrDefault(i, -1);
            boolean correct = selected == q.getCorrectIndex();
            if (correct) score++;

            results.add(new QuizResult.QuestionResult(
                    q.getQuestion(),
                    selected,
                    q.getCorrectIndex(),
                    correct,
                    q.getExplanation()
            ));
        }

        // Зачувај резултат
        session.setScore(score);
        session.setCompleted(true);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        int percentage = (int) Math.round((score * 100.0) / questions.size());
        return new QuizResult(session.getId(), score, questions.size(), percentage, results);
    }

    private List<QuizQuestion> getOrGenerate(QuizTopic topic, int count) {
        List<QuizQuestion> existing =
                generatorService.deserializeQuestions(topic.getGeneratedQuestionsJson());

        if (!existing.isEmpty()) {
            return existing;
        }

        try {
            return generatorService.generateQuestionsForTopic(topic.getId(), count);
        } catch (Exception e) {
            System.err.println("[QuizSessionService] AI generation failed for topic '"
                    + topic.getTopic() + "': " + e.getMessage() + ". Trying fallback generator.");
            List<QuizQuestion> fallback = generatorService.generateFallbackQuestions(topic, count);
            if (!fallback.isEmpty()) {
                System.out.println("[QuizSessionService] Fallback generated " + fallback.size()
                        + " questions for topic '" + topic.getTopic() + "'.");
                return fallback;
            }
            throw new RuntimeException("No questions could be generated for topic '" + topic.getTopic()
                    + "'. Please ensure course content (slides) has been uploaded.");
        }
    }
}