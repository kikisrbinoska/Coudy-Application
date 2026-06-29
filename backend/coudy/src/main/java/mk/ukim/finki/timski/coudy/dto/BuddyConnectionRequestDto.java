package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.domain.BuddyConnectionRequest;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyRequestStatus;

import java.time.LocalDateTime;

public record BuddyConnectionRequestDto(
        Long id,
        String senderUsername,
        String senderName,
        String senderSurname,
        String receiverUsername,
        String receiverName,
        String receiverSurname,
        String message,
        BuddyRequestStatus status,
        LocalDateTime createdAt,
        LocalDateTime respondedAt,
        LocalDateTime readAt
) {
    public static BuddyConnectionRequestDto from(BuddyConnectionRequest request) {
        User sender = request.getSender();
        User receiver = request.getReceiver();
        return new BuddyConnectionRequestDto(
                request.getId(),
                sender != null ? sender.getUsername() : null,
                sender != null ? sender.getName() : null,
                sender != null ? sender.getSurname() : null,
                receiver != null ? receiver.getUsername() : null,
                receiver != null ? receiver.getName() : null,
                receiver != null ? receiver.getSurname() : null,
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getRespondedAt(),
                request.getReadAt()
        );
    }
}
