package mk.ukim.finki.timski.coudy.model.domain;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    private Integer score;
    private Integer totalQuestions;
    private Double percentage;

    private Integer timeTakenSeconds;

    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String answersJson;
}