package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.SessionStatus;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "buddy_sessions")
public class BuddySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "buddy_id")
    private StudyBuddy studyBuddy;

    private LocalDateTime scheduledTime;
    private String location;
    private Integer durationMinutes;

    private Boolean attendedUser1;
    private Boolean attendedUser2;

    private Integer ratingUser1;
    private Integer ratingUser2;

    private String notes;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;
}