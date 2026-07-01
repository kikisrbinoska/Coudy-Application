package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.*;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.BackgroundTheme;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface FocusService {
    List<FocusTaskDto> getTasks(User user);
    FocusTaskDto createTask(User user, String title);
    FocusTaskDto updateTask(Long id, boolean completed);
    void deleteTask(Long id);
    FocusSessionResponseDto createSession(User user, int durationSeconds);
    FocusStatsDto getStats(User user);
    Map<LocalDate, Integer> getDailyMinutes(User user);
    FocusSettingsDto getSettings(User user);
    FocusSettingsDto updateSettings(User user, boolean musicEnabled, BackgroundTheme backgroundTheme);
}
