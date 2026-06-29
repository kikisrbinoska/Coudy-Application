package mk.ukim.finki.timski.coudy.model.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    private String sessionId;
    private Map<Integer, Integer> answers;
}