package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.enumerations.BuddyNotificationType;

import java.time.LocalDateTime;

public record BuddyNotificationDto(
        BuddyNotificationType type,
        Long requestId,
        Long buddyId,
        Long sessionId,
        String senderUsername,
        String senderName,
        String senderSurname,
        String title,
        String preview,
        LocalDateTime createdAt
) {
}
