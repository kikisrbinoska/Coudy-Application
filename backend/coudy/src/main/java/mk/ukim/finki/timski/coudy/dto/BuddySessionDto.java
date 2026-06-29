package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.domain.BuddySession;
import mk.ukim.finki.timski.coudy.model.enumerations.SessionStatus;

import java.time.LocalDateTime;

public record BuddySessionDto(
        Long id,
        Long buddyId,
        LocalDateTime scheduledTime,
        String location,
        Integer durationMinutes,
        Boolean attendedUser1,
        Boolean attendedUser2,
        Integer ratingUser1,
        Integer ratingUser2,
        String notes,
        SessionStatus status
) {
    public static BuddySessionDto from(BuddySession session) {
        return new BuddySessionDto(
                session.getId(),
                session.getStudyBuddy() != null ? session.getStudyBuddy().getId() : null,
                session.getScheduledTime(),
                session.getLocation(),
                session.getDurationMinutes(),
                session.getAttendedUser1(),
                session.getAttendedUser2(),
                session.getRatingUser1(),
                session.getRatingUser2(),
                session.getNotes(),
                session.getStatus()
        );
    }
}
