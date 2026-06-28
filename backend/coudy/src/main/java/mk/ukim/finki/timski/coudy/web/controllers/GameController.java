package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.dto.GameDto;
import mk.ukim.finki.timski.coudy.model.domain.Game;
import mk.ukim.finki.timski.coudy.service.domain.GameService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public List<GameDto> findAll() {
        return gameService.findAllAsDto();
    }

    @GetMapping("/{id}")
    public Game findById(@PathVariable Long id) {
        return gameService.findById(id);
    }

    @PostMapping
    public Game create(@RequestBody Game game) {
        return gameService.create(game);
    }

    @PutMapping("/{id}")
    public Game update(@PathVariable Long id, @RequestBody Game game) {
        return gameService.update(id, game);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        gameService.delete(id);
    }
}
