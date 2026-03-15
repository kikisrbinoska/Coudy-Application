package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.finki.timski.coudy.model.enumerations.Difficulty;

@Data
@Entity
@Table(name = "games")
@AllArgsConstructor
@NoArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String subject;
    private String icon;
    private Integer points;
    private Integer level;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private String category;
    private Boolean active;

    @ManyToOne
    private Achievement achievement;
}
