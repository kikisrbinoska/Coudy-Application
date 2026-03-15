package mk.ukim.finki.timski.coudy.service.domain.impl;

import lombok.AllArgsConstructor;
import mk.ukim.finki.timski.coudy.model.domain.Game;
import mk.ukim.finki.timski.coudy.model.exceptions.InvalidGameException;
import mk.ukim.finki.timski.coudy.repository.GameRepository;
import mk.ukim.finki.timski.coudy.service.domain.GameService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class GameServiceImpl implements GameService {
    private final GameRepository gameRepository;
    @Override
    public List<Game> findAll() {
        return gameRepository.findAll();
    }

    @Override
    public Game findById(Long id) {
        return gameRepository.findById(id).orElseThrow(InvalidGameException::new);
    }

    @Override
    public Game create(Game game) {
        return gameRepository.save(game);
    }

    @Override
    public Game update(Long id, Game game) {
        Game gameId = gameRepository.findById(id).orElseThrow(InvalidGameException::new);
        gameId.setId(id);
        gameId.setName(gameId.getName());
        gameId.setAchievement(gameId.getAchievement());
        gameId.setPoints(gameId.getPoints());
        gameId.setLevel(gameId.getLevel());
        return gameRepository.save(gameId);
    }

    @Override
    public void delete(Long id) {
        Game gameId = gameRepository.findById(id).orElseThrow(InvalidGameException::new);
        gameRepository.delete(gameId);
    }


}
