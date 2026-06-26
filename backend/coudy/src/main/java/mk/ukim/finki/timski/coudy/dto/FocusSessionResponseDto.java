package mk.ukim.finki.timski.coudy.dto;

import java.time.LocalDateTime;

public record FocusSessionResponseDto(
        Long id,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        Integer durationSeconds,
        Integer pointsEarned,
        Integer newTotalPoints
) {}
