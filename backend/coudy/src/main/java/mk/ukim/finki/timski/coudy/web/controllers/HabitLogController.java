package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.model.domain.HabitLog;
import mk.ukim.finki.timski.coudy.service.domain.HabitLogService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/habit-logs")
public class HabitLogController {
    private final HabitLogService habitLogService;

    public HabitLogController(HabitLogService habitLogService) {
        this.habitLogService = habitLogService;
    }

    @GetMapping
    public List<HabitLog> findAll() {
        return habitLogService.findAll();
    }

    @GetMapping("/{id}")
    public HabitLog getById(@PathVariable Long id) {
        return habitLogService.findById(id);
    }

    @PostMapping("/add")
    public HabitLog create(@RequestParam HabitLog habitLog) {
        return habitLogService.create(habitLog);
    }

    @PostMapping("/{id}")
    public HabitLog update(@PathVariable Long id,@RequestParam HabitLog habitLog) {
        return habitLogService.update(id,habitLog);
    }

    public void delete (@PathVariable Long id) {
        habitLogService.delete(id);
    }
}
