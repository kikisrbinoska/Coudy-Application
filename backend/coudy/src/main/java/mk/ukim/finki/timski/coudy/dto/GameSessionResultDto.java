package mk.ukim.finki.timski.coudy.dto;

import java.time.LocalDateTime;

public record GameSessionResultDto(
        Long gameId,
        String gameName,
        Integer score,
        Integer maxScore,
        LocalDateTime endTime
) {}
