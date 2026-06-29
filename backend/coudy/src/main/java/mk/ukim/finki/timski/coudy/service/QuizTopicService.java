package mk.ukim.finki.timski.coudy.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.timski.coudy.model.domain.QuizQuestion;
import mk.ukim.finki.timski.coudy.model.domain.QuizTopic;
import mk.ukim.finki.timski.coudy.model.domain.SlideContent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuizTopicService {

    private final ObjectMapper mapper = new ObjectMapper();

    public List<SlideContent> getSlides(QuizTopic topic) throws Exception {
        return mapper.readValue(topic.getSlidesJson(),
                new TypeReference<List<SlideContent>>() {});
    }

    public void setSlides(QuizTopic topic, List<SlideContent> slides) throws Exception {
        topic.setSlidesJson(mapper.writeValueAsString(slides));
    }

    public List<QuizQuestion> getQuestions(QuizTopic topic) throws Exception {
        if (topic.getGeneratedQuestionsJson() == null) return new ArrayList<>();
        return mapper.readValue(topic.getGeneratedQuestionsJson(),
                new TypeReference<List<QuizQuestion>>() {});
    }

    public void setQuestions(QuizTopic topic, List<QuizQuestion> questions) throws Exception {
        topic.setGeneratedQuestionsJson(mapper.writeValueAsString(questions));
    }
}