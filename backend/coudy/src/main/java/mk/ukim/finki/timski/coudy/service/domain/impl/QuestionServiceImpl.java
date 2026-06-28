package mk.ukim.finki.timski.coudy.service.domain.impl;

import lombok.AllArgsConstructor;
import mk.ukim.finki.timski.coudy.dto.QuestionDto;
import mk.ukim.finki.timski.coudy.model.domain.Question;
import mk.ukim.finki.timski.coudy.repository.QuestionRepository;
import mk.ukim.finki.timski.coudy.service.domain.QuestionService;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@AllArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;



    @Override
    public List<Question> getQuestionsByGame(Long gameId) {
        return questionRepository.findAllByGameId(gameId);
    }

    @Override
    public QuestionDto getNextQuestion(Long gameId, Integer index) {
        List<Question> questions = questionRepository.findAllByGameId(gameId);

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
}
