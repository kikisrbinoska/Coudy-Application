package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.GameDto;
import mk.ukim.finki.timski.coudy.model.domain.Game;
import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.HabitLog;

import java.util.List;

public interface GameService {

    List<Game> findAll();
    List<GameDto> findAllAsDto();
    Game findById(Long id);
    Game create(Game game);
    Game update(Long id, Game game);
    void delete(Long id);
}