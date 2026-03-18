package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.model.domain.QuizResult;
import mk.ukim.finki.timski.coudy.model.domain.QuizSession;
import mk.ukim.finki.timski.coudy.model.domain.QuizStartRequest;      // ← додадено
import mk.ukim.finki.timski.coudy.model.domain.QuizSubmitRequest;
import mk.ukim.finki.timski.coudy.model.domain.QuizTopic;
import mk.ukim.finki.timski.coudy.repository.QuizTopicRepository;
import mk.ukim.finki.timski.coudy.service.QuizSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired private QuizSessionService sessionService;
    @Autowired private QuizTopicRepository topicRepository;

    @GetMapping("/courses")
    public List<String> getCourses() {
        return topicRepository.findAllDistinctCourses();
    }

    @GetMapping("/courses/{course}/topics")
    public List<String> getTopics(@PathVariable String course) {
        return topicRepository.findByCourse(course)
                .stream().map(QuizTopic::getTopic).toList();
    }

    @PostMapping("/start")
    public QuizSession startQuiz(@RequestBody QuizStartRequest req) {
        return sessionService.createSession(req.getCourse(), req.getTopic(), req.getCount());
    }

    @PostMapping("/submit")
    public QuizResult submitAnswers(@RequestBody QuizSubmitRequest req) {
        return sessionService.evaluateSession(req);
    }
}