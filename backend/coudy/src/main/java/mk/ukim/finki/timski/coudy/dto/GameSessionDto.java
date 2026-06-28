package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.domain.Game;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.GameStatus;

import java.time.LocalDateTime;

public record GameSessionDto(
        Long id,
        Long gameId,
        Integer score,
        Integer currentQuestionIndex,
        GameStatus status
) {
}
