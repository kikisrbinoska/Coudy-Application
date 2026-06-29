package mk.ukim.finki.timski.coudy.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.timski.coudy.model.domain.QuizTopic;
import mk.ukim.finki.timski.coudy.repository.QuizTopicRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PdfTopicService {

    private final QuizTopicRepository quizTopicRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public PdfTopicService(QuizTopicRepository quizTopicRepository) {
        this.quizTopicRepository = quizTopicRepository;
    }

    public int processUploads(String courseName, List<MultipartFile> files) {
        int created = 0;
        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".pdf")) continue;

            String topicName = filename.replaceAll("(?i)\\.pdf$", "").trim();

            if (quizTopicRepository.existsByCourseAndTopic(courseName, topicName)) continue;

            try {
                byte[] bytes = file.getBytes();
                List<Map<String, Object>> slides = extractSlides(bytes);
                if (slides.isEmpty()) continue;

                QuizTopic topic = new QuizTopic();
                topic.setCourse(courseName);
                topic.setTopic(topicName);
                topic.setSourceFile(filename);
                topic.setTotalSlides(slides.size());
                topic.setSlidesJson(mapper.writeValueAsString(slides));
                quizTopicRepository.save(topic);
                created++;
            } catch (Exception e) {
                System.err.println("Failed to process " + filename + ": " + e.getMessage());
            }
        }
        return created;
    }

    private List<Map<String, Object>> extractSlides(byte[] pdfBytes) throws Exception {
        List<Map<String, Object>> slides = new ArrayList<>();
        try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
            int pages = Math.min(doc.getNumberOfPages(), 15);
            PDFTextStripper stripper = new PDFTextStripper();
            for (int p = 1; p <= pages; p++) {
                stripper.setStartPage(p);
                stripper.setEndPage(p);
                String text = stripper.getText(doc).trim();
                if (text.length() < 20) continue;

                String[] lines = text.split("\\r?\\n");
                String title = "";
                StringBuilder content = new StringBuilder();
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty()) continue;
                    if (title.isEmpty()) {
                        title = trimmed.length() > 80 ? trimmed.substring(0, 80) : trimmed;
                    } else if (content.length() < 600) {
                        content.append(trimmed).append(" ");
                    }
                }
                if (title.isEmpty()) continue;

                slides.add(Map.of(
                        "slide_index", p,
                        "title", title,
                        "content", content.toString().trim()
                ));
            }
        }
        return slides;
    }
}
