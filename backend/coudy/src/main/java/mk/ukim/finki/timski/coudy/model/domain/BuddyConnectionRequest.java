package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyRequestStatus;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "buddy_connection_requests")
public class BuddyConnectionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_username")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_username")
    private User receiver;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private BuddyRequestStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private LocalDateTime readAt;
}
