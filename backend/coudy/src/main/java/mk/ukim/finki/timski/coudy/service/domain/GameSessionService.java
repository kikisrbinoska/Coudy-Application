package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.QuestionDto;
import mk.ukim.finki.timski.coudy.dto.SubmitAnswerResponseDto;
import mk.ukim.finki.timski.coudy.model.domain.GameSession;
import mk.ukim.finki.timski.coudy.model.domain.Question;

public interface GameSessionService {

    GameSession startSession(Long gameId, String username);

    SubmitAnswerResponseDto answer (Long sessionId, String answer);

    SubmitAnswerResponseDto finish (Long sessionId);
    QuestionDto getCurrentQuestion(Long sessionId);
}
