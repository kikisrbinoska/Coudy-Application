package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.dto.*;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.BackgroundTheme;
import mk.ukim.finki.timski.coudy.service.domain.FocusService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/focus")
public class FocusController {

    private final FocusService focusService;

    public FocusController(FocusService focusService) {
        this.focusService = focusService;
    }

    @GetMapping("/tasks")
    public List<FocusTaskDto> getTasks(@AuthenticationPrincipal User user) {
        return focusService.getTasks(user);
    }

    @PostMapping("/tasks")
    public FocusTaskDto createTask(
            @AuthenticationPrincipal User user,
            @RequestBody CreateFocusTaskRequest request
    ) {
        return focusService.createTask(user, request.title());
    }

    @PatchMapping("/tasks/{id}")
    public FocusTaskDto updateTask(
            @PathVariable Long id,
            @RequestBody UpdateFocusTaskRequest request
    ) {
        return focusService.updateTask(id, request.completed());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        focusService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions")
    public FocusSessionResponseDto createSession(
            @AuthenticationPrincipal User user,
            @RequestBody CreateFocusSessionRequest request
    ) {
        return focusService.createSession(user, request.durationSeconds());
    }

    @GetMapping("/sessions/stats")
    public FocusStatsDto getStats(@AuthenticationPrincipal User user) {
        return focusService.getStats(user);
    }

    @GetMapping("/settings")
    public FocusSettingsDto getSettings(@AuthenticationPrincipal User user) {
        return focusService.getSettings(user);
    }

    @PutMapping("/settings")
    public FocusSettingsDto updateSettings(
            @AuthenticationPrincipal User user,
            @RequestBody FocusSettingsDto request
    ) {
        BackgroundTheme theme;
        try {
            theme = request.backgroundTheme() != null
                    ? BackgroundTheme.valueOf(request.backgroundTheme())
                    : BackgroundTheme.THEME_0;
        } catch (IllegalArgumentException e) {
            theme = BackgroundTheme.THEME_0;
        }
        return focusService.updateSettings(user, request.musicEnabled(), theme);
    }
}
