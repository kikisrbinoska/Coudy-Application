package mk.ukim.finki.timski.coudy.model.domain;
import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.HabitCategory;
import mk.ukim.finki.timski.coudy.model.enumerations.TargetFrequency;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "habits")
public class Habit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String name;

    @Enumerated(EnumType.STRING)
    private HabitCategory category;

    @Enumerated(EnumType.STRING)
    private TargetFrequency targetFrequency;

    private LocalTime reminderTime;

    private Integer streakCurrent;
    private Integer streakLongest;

    private Integer totalCompletions;

    private LocalDateTime createdAt;
}
