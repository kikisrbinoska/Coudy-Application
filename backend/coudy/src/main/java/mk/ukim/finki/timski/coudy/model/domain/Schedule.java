package mk.ukim.finki.timski.coudy.model.domain;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "schedules")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDate weekStart;

    @Column(columnDefinition = "TEXT")
    private String scheduleJson;

    private Boolean wasFollowed;

    private Integer adherencePercentage;

    private LocalDateTime generatedAt;
}