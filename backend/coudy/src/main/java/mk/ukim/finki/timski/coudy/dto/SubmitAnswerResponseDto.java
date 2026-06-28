package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.enumerations.GameStatus;

public record SubmitAnswerResponseDto(
        Boolean correct,
        Integer score,
        Integer nextQuestionIndex,
        GameStatus status,
        Boolean finished
) {
}

//todo za frontend-ot
// {
//  "correct": true,
//  "score": 40,
//  "nextQuestionIndex": 3,
//  "status": "IN_PROGRESS",
//  "finished": false
//  }