package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.service.domain.HabitService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/habits")
public class HabitController {
    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<Habit> findAll() {
        return habitService.findAll();
    }

    @GetMapping("/{id}")
    public Habit findById(@PathVariable Long id) {
        return habitService.findById(id);
    }

    @PostMapping("/add")
    public Habit create(@RequestParam Habit habit) {
        return habitService.create(habit);
    }

    @PostMapping("/edit/{id}")
    public Habit update(@PathVariable Long id,@RequestParam Habit habit) {
        return habitService.update(id, habit);
    }

    @PostMapping("/delete/{id}")
    void delete(@PathVariable Long id) {
        habitService.detele(id);
    }
}
