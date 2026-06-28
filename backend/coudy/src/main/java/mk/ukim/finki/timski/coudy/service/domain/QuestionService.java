package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.QuestionDto;
import mk.ukim.finki.timski.coudy.model.domain.Question;

import java.util.List;

public interface QuestionService {

    List<Question> getQuestionsByGame (Long gameId);

    QuestionDto getNextQuestion (Long gameId, Integer index);
}
