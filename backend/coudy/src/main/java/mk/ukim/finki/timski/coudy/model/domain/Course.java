package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String name;
    @ManyToOne
    private User user;

    public Course(String code, String name, User user) {
        this.code = code;
        this.name = name;
        this.user = user;
    }
}
