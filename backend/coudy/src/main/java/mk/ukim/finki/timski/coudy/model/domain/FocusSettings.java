package mk.ukim.finki.timski.coudy.model.domain;

import jakarta.persistence.*;
import lombok.Data;
import mk.ukim.finki.timski.coudy.model.enumerations.BackgroundTheme;

@Data
@Entity
@Table(name = "focus_settings")
public class FocusSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private boolean musicEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackgroundTheme backgroundTheme = BackgroundTheme.THEME_0;
}
