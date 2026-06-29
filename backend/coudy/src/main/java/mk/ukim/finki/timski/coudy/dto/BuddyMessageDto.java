package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.domain.BuddyMessage;

import java.time.LocalDateTime;

public record BuddyMessageDto(
        Long id,
        Long buddyId,
        String senderUsername,
        String senderName,
        String senderSurname,
        String content,
        LocalDateTime sentAt,
        LocalDateTime readAt
) {
    public static BuddyMessageDto from(BuddyMessage message) {
        return new BuddyMessageDto(
                message.getId(),
                message.getStudyBuddy() != null ? message.getStudyBuddy().getId() : null,
                message.getSender() != null ? message.getSender().getUsername() : null,
                message.getSender() != null ? message.getSender().getName() : null,
                message.getSender() != null ? message.getSender().getSurname() : null,
                message.getContent(),
                message.getSentAt(),
                message.getReadAt()
        );
    }
}
