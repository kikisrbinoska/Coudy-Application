package mk.ukim.finki.timski.coudy.model.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResult {
    private String sessionId;
    private int score;
    private int totalQuestions;
    private int percentage;
    private List<QuestionResult> questionResults;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private String question;
        private int selectedIndex;
        private int correctIndex;
        private boolean correct;
        private String explanation;
    }
}