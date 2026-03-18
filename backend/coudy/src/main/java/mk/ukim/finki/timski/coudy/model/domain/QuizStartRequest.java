package mk.ukim.finki.timski.coudy.model.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizStartRequest {
    private String course;
    private String topic;  // може null ако е цел курс
    private int count;
}