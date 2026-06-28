package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.finki.timski.coudy.model.enumerations.GameStatus;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@Table(name = "game_sessions")
@NoArgsConstructor
@Data
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Game game;

    private Integer score = 0;

    private Integer currentQuestionIndex = 0;

    @Enumerated(EnumType.STRING)
    private GameStatus status;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
