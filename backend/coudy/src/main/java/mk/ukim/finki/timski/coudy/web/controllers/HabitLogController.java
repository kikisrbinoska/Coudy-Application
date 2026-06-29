package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.dto.WeeklySummaryDto;
import mk.ukim.finki.timski.coudy.model.domain.HabitLog;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.service.domain.HabitLogService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habit-logs")
public class HabitLogController {
    private final HabitLogService habitLogService;

    public HabitLogController(HabitLogService habitLogService) {
        this.habitLogService = habitLogService;
    }

    @GetMapping
    public List<HabitLog> findAll(@AuthenticationPrincipal User user) {
        return habitLogService.findAllByUser(user);
    }

    @GetMapping("/{id}")
    public HabitLog getById(@PathVariable Long id) {
        return habitLogService.findById(id);
    }

    @PostMapping
    public HabitLog create(@RequestBody HabitLog habitLog) {
        return habitLogService.create(habitLog);
    }

    @PutMapping("/{id}")
    public HabitLog update(@PathVariable Long id, @RequestBody HabitLog habitLog) {
        return habitLogService.update(id, habitLog);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        habitLogService.delete(id);
    }

    @GetMapping("/weekly-summary")
    public List<WeeklySummaryDto> weeklySummary(@AuthenticationPrincipal User user) {
        return habitLogService.getWeeklySummary(user);
    }
}
