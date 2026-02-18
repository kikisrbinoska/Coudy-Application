package mk.ukim.finki.timski.coudy.model.domain;
import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.SessionType;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "study_sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer durationMinutes;

    private Integer productivityRating;

    private String notes;

    private String location;

    @Enumerated(EnumType.STRING)
    private SessionType sessionType;
}
