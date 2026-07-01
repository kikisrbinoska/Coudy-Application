package mk.ukim.finki.timski.coudy.service.domain.impl;

import lombok.AllArgsConstructor;
import mk.ukim.finki.timski.coudy.dto.GameSessionResultDto;
import mk.ukim.finki.timski.coudy.dto.QuestionDto;
import mk.ukim.finki.timski.coudy.dto.SubmitAnswerResponseDto;
import mk.ukim.finki.timski.coudy.model.domain.Game;
import mk.ukim.finki.timski.coudy.model.domain.GameSession;
import mk.ukim.finki.timski.coudy.model.domain.Question;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.GameStatus;
import mk.ukim.finki.timski.coudy.repository.GameRepository;
import mk.ukim.finki.timski.coudy.repository.GameSessionRepository;
import mk.ukim.finki.timski.coudy.repository.QuestionRepository;
import mk.ukim.finki.timski.coudy.repository.UserRepository;
import mk.ukim.finki.timski.coudy.service.domain.GameSessionService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class GameSessionServiceImpl implements GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final GameRepository gameRepo;
    private final UserRepository userRepo;
    private final QuestionRepository questionRepo;

    @Override
    public GameSession startSession(Long gameId, String username) {

        Game game = gameRepo.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        User user = userRepo.findById(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession session = new GameSession();
        session.setGame(game);
        session.setUser(user);
        session.setScore(0);
        session.setCurrentQuestionIndex(0);
        session.setStatus(GameStatus.STARTED);
        session.setStartTime(LocalDateTime.now());

        return gameSessionRepository.save(session);
    }

    @Override
    public SubmitAnswerResponseDto answer(Long sessionId, String answer) {

        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Question> questions =
                questionRepo.findAllByGameId(session.getGame().getId());

        int index = session.getCurrentQuestionIndex();

        // game finished check
        if (index >= questions.size()) {
            session.setStatus(GameStatus.FINISHED);
            session.setEndTime(LocalDateTime.now());

            gameSessionRepository.save(session);

            return new SubmitAnswerResponseDto(
                    false,
                    session.getScore(),
                    session.getCurrentQuestionIndex(),
                    session.getStatus(),
                    true
            );
        }

        Question current = questions.get(index);

        boolean correct =
                current.getCorrectAnswer().equalsIgnoreCase(answer);

        if (correct) {
            session.setScore(
                    session.getScore() + session.getGame().getPoints()
            );
        }

        session.setCurrentQuestionIndex(index + 1);

        if (session.getCurrentQuestionIndex() >= questions.size()) {
            session.setStatus(GameStatus.FINISHED);
            session.setEndTime(LocalDateTime.now());
        } else {
            session.setStatus(GameStatus.IN_PROGRESS);
        }

        gameSessionRepository.save(session);

        return new SubmitAnswerResponseDto(
                correct,
                session.getScore(),
                session.getCurrentQuestionIndex(),
                session.getStatus(),
                session.getStatus() == GameStatus.FINISHED
        );
    }

    @Override
    public SubmitAnswerResponseDto finish(Long sessionId) {

        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(GameStatus.FINISHED);
        session.setEndTime(LocalDateTime.now());

        gameSessionRepository.save(session);

        return new SubmitAnswerResponseDto(
                false,
                session.getScore(),
                session.getCurrentQuestionIndex(),
                session.getStatus(),
                true
        );
    }

    @Override
    public QuestionDto getCurrentQuestion(Long sessionId) {

        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Question> questions =
                questionRepo.findAllByGameId(session.getGame().getId());

        int index = session.getCurrentQuestionIndex();

        if (index >= questions.size()) {
            return null;
        }

        Question q = questions.get(index);

        return new QuestionDto(
                q.getId(),
                q.getText(),
                q.getOptions(),
                q.getQuestionType()
        );
    }

    @Override
    public List<GameSessionResultDto> getResultsByUser(String username) {
        return gameSessionRepository
                .findByUserUsernameAndStatus(username, GameStatus.FINISHED)
                .stream()
                .map(s -> {
                    int maxScore = questionRepo.findAllByGameId(s.getGame().getId()).size()
                            * s.getGame().getPoints();
                    return new GameSessionResultDto(
                            s.getGame().getId(),
                            s.getGame().getName(),
                            s.getScore(),
                            maxScore,
                            s.getEndTime()
                    );
                })
                .toList();
    }
}