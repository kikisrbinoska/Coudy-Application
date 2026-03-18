package mk.ukim.finki.timski.coudy.model.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quiz_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSession {

    @Id
    private String id;

    private String course;
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String questionsJson;

    private int totalQuestions;
    private int score;
    private boolean completed;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;


    public QuizSession(String id, String course, String topic, List<QuizQuestion> questions) {
        this.id = id;
        this.course = course;
        this.topic = topic;
        this.totalQuestions = questions.size();
        this.score = 0;
        this.completed = false;
        this.createdAt = LocalDateTime.now();


        try {
            ObjectMapper mapper = new ObjectMapper();
            this.questionsJson = mapper.writeValueAsString(questions);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize questions", e);
        }
    }
}
