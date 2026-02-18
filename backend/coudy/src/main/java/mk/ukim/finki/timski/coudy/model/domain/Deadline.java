package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.model.enumerations.Priority;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "deadlines")
public class Deadline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private String title;
    private String description;

    private LocalDateTime dueDate;

    private Integer estimatedHours;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private Integer completionPercentage;  // 0-100

    @Enumerated(EnumType.STRING)
    private DeadlineStatus status;

    private LocalDateTime createdAt;
}
