package mk.ukim.finki.timski.coudy.web.controllers;

import lombok.AllArgsConstructor;
import mk.ukim.finki.timski.coudy.dto.*;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.service.domain.GameSessionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/game-sessions")
@AllArgsConstructor
public class GameSessionController {

    private final GameSessionService gameSessionService;

    @PostMapping("/start")
    public GameSessionStartDto start(@RequestParam Long gameId,
                                     Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        var session = gameSessionService.startSession(
                gameId,
                user.getUsername()
        );

        return new GameSessionStartDto(
                session.getId(),
                session.getStatus(),
                session.getCurrentQuestionIndex()
        );
    }

    @PostMapping("/{id}/answer")
    public SubmitAnswerResponseDto answer(
            @PathVariable Long id,
            @RequestBody SubmitAnswerRequestDto request
    ) {
        return gameSessionService.answer(id, request.answer());
    }

    @PostMapping("/{id}/finish")
    public SubmitAnswerResponseDto finish(@PathVariable Long id) {
        return gameSessionService.finish(id);
    }

    @GetMapping("/{id}/question")
    public QuestionDto getQuestion(@PathVariable Long id) {
        return gameSessionService.getCurrentQuestion(id);
    }

    @GetMapping("/my-results")
    public List<GameSessionResultDto> myResults(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return gameSessionService.getResultsByUser(user.getUsername());
    }
}