package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserAnswer {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private GameSession session;

    @ManyToOne
    private Question question;

    private String givenAnswer;

    private Boolean correct;
}
