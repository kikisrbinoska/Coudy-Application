package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.enumerations.GameStatus;

public record GameSessionStartDto(
        Long sessionId,
        GameStatus status,
        Integer firstQuestionIndex) {

}
