package mk.ukim.finki.timski.coudy.web.controllers;

import lombok.AllArgsConstructor;
import mk.ukim.finki.timski.coudy.dto.QuestionDto;
import mk.ukim.finki.timski.coudy.model.domain.Question;
import mk.ukim.finki.timski.coudy.service.domain.QuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
@AllArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/game/{gameId}")
    public List<QuestionDto> getByGame(@PathVariable Long gameId) {
        return questionService.getQuestionsByGame(gameId)
                .stream()
                .map(q -> new QuestionDto(
                        q.getId(),
                        q.getText(),
                        q.getOptions(),
                        q.getQuestionType()
                )).toList();
    }

    @GetMapping("/game/{gameId}/next")
    public QuestionDto getNext(@PathVariable Long gameId,
                               @RequestParam Integer index) {
        return questionService.getNextQuestion(gameId, index);
    }
}
