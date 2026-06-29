package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "buddy_messages")
public class BuddyMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "buddy_id")
    private StudyBuddy studyBuddy;

    @ManyToOne
    @JoinColumn(name = "sender_username")
    private User sender;

    private String content;
    private LocalDateTime sentAt;
}
