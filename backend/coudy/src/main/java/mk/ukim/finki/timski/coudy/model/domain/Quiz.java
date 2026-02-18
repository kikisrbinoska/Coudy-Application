package mk.ukim.finki.timski.coudy.model.domain;
import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.Difficulty;

@Data
@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private String topic;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @Column(columnDefinition = "TEXT")
    private String questionsJson;

    private Integer unlockCostSP;

    private Integer timesTaken;

    private Double averageScore;
}
