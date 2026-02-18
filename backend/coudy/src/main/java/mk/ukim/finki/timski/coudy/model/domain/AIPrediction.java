package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.PredictionType;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ai_predictions")
public class AIPrediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "deadline_id")
    private Deadline deadline;

    @Enumerated(EnumType.STRING)
    private PredictionType predictionType;

    private Double confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String suggestedActionsJson;

    private LocalDateTime createdAt;
}