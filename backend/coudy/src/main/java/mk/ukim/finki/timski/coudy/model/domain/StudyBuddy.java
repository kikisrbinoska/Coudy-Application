package mk.ukim.finki.timski.coudy.model.domain;
import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyStatus;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "study_buddies")
public class StudyBuddy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user1_id")
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id")
    private User user2;

    private Integer matchScore;

    @Enumerated(EnumType.STRING)
    private BuddyStatus status;

    private LocalDateTime matchedAt;
    private Integer sessionCount;
}
