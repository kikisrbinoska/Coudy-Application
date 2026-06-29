package mk.ukim.finki.timski.coudy.dto;

import java.time.LocalDateTime;

public record CreateBuddySessionRequest(
        LocalDateTime scheduledTime,
        String location,
        Integer durationMinutes,
        String notes
) {
}
