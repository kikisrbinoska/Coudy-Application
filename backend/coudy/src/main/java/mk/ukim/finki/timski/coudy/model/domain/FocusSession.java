package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "focus_sessions")
public class FocusSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;
    private Integer pointsEarned;
}
