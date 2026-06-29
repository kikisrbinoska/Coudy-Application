package mk.ukim.finki.timski.coudy.service;

import com.fasterxml.jackson.core.type.TypeReference;          // ← TypeReference
import com.fasterxml.jackson.databind.ObjectMapper;            // ← ObjectMapper
import jakarta.annotation.PostConstruct;
import mk.ukim.finki.timski.coudy.model.domain.QuizTopic;
import mk.ukim.finki.timski.coudy.repository.QuizTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;     // ❌ беше: lombok.Value
import org.springframework.core.io.Resource;                   // ← Resource
import org.springframework.stereotype.Service;

import java.io.IOException;                                    // ← IOException
import java.util.List;                                         // ← List

@Service
public class DatasetLoaderService {

    @Autowired
    private QuizTopicRepository repository;

    @Value("classpath:quiz_dataset.json")
    private Resource datasetResource;

    private final ObjectMapper mapper = new ObjectMapper();

    // Се извршува при стартување на апликацијата
    @PostConstruct
    public void loadDataset() throws IOException {
        List<QuizTopic> topics = mapper.readValue(
                datasetResource.getInputStream(),
                new TypeReference<List<QuizTopic>>() {}
        );
        // Зачувај само нови (избегни дупликати)
        topics.forEach(t -> {
            if (!repository.existsByCourseAndTopic(t.getCourse(), t.getTopic())) {
                repository.save(t);
            }
        });
        System.out.println("Loaded " + topics.size() + " topics from dataset.");
    }
}