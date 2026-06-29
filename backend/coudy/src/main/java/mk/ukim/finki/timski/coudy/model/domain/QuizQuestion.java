package mk.ukim.finki.timski.coudy.model.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {
    private String id;
    private String question;
    private List<String> options;
    private int correctIndex;
    private String explanation;
    private String topic;
}