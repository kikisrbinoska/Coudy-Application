package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.finki.timski.coudy.model.enumerations.QuestionType;

import java.util.List;

@Data
@Entity
@Table(name = "questions")
@AllArgsConstructor
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String text;


    @ElementCollection
    private List<String> options;


    private String correctAnswer;


    @ManyToOne
    private Game game;

    private QuestionType questionType;
}
