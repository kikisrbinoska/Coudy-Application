package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.dto.HabitDto;
import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.service.domain.HabitService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
public class HabitController {
    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<HabitDto> findAll(@AuthenticationPrincipal User user) {
        return habitService.findAllByUserAsDto(user);
    }

    @GetMapping("/{id}")
    public Habit findById(@PathVariable Long id) {
        return habitService.findById(id);
    }

    @PostMapping
    public Habit create(@RequestBody Habit habit, @AuthenticationPrincipal User user) {
        habit.setUser(user);
        return habitService.create(habit);
    }

    @PutMapping("/{id}")
    public Habit update(@PathVariable Long id, @RequestBody Habit habit) {
        return habitService.update(id, habit);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        habitService.delete(id);
    }

    @PostMapping("/{id}/complete")
    public HabitDto completeToday(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return habitService.completeToday(id, user);
    }
}
