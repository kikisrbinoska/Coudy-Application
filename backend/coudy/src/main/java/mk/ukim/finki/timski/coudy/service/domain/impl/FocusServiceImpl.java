package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.dto.*;
import mk.ukim.finki.timski.coudy.model.domain.FocusSession;
import mk.ukim.finki.timski.coudy.model.domain.FocusSettings;
import mk.ukim.finki.timski.coudy.model.domain.FocusTask;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.BackgroundTheme;
import mk.ukim.finki.timski.coudy.model.exceptions.InvalidArgumentsException;
import mk.ukim.finki.timski.coudy.repository.FocusSessionRepository;
import mk.ukim.finki.timski.coudy.repository.FocusSettingsRepository;
import mk.ukim.finki.timski.coudy.repository.FocusTaskRepository;
import mk.ukim.finki.timski.coudy.repository.UserRepository;
import mk.ukim.finki.timski.coudy.service.domain.FocusService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FocusServiceImpl implements FocusService {

    private final FocusTaskRepository focusTaskRepository;
    private final FocusSessionRepository focusSessionRepository;
    private final FocusSettingsRepository focusSettingsRepository;
    private final UserRepository userRepository;

    public FocusServiceImpl(
            FocusTaskRepository focusTaskRepository,
            FocusSessionRepository focusSessionRepository,
            FocusSettingsRepository focusSettingsRepository,
            UserRepository userRepository
    ) {
        this.focusTaskRepository = focusTaskRepository;
        this.focusSessionRepository = focusSessionRepository;
        this.focusSettingsRepository = focusSettingsRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<FocusTaskDto> getTasks(User user) {
        return focusTaskRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toTaskDto)
                .toList();
    }

    @Override
    public FocusTaskDto createTask(User user, String title) {
        FocusTask task = new FocusTask();
        task.setUser(user);
        task.setTitle(title);
        task.setCompleted(false);
        return toTaskDto(focusTaskRepository.save(task));
    }

    @Override
    public FocusTaskDto updateTask(Long id, boolean completed) {
        FocusTask task = focusTaskRepository.findById(id)
                .orElseThrow(InvalidArgumentsException::new);
        task.setCompleted(completed);
        return toTaskDto(focusTaskRepository.save(task));
    }

    @Override
    public void deleteTask(Long id) {
        focusTaskRepository.deleteById(id);
    }

    @Override
    @Transactional
    public FocusSessionResponseDto createSession(User user, int durationSeconds) {
        User freshUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(InvalidArgumentsException::new);

        int pointsEarned = (durationSeconds / 60) * 10;

        LocalDateTime endedAt = LocalDateTime.now();
        LocalDateTime startedAt = endedAt.minusSeconds(durationSeconds);

        FocusSession session = new FocusSession();
        session.setUser(freshUser);
        session.setStartedAt(startedAt);
        session.setEndedAt(endedAt);
        session.setDurationSeconds(durationSeconds);
        session.setPointsEarned(pointsEarned);
        focusSessionRepository.save(session);

        int currentPoints = freshUser.getPoints() == null ? 0 : freshUser.getPoints();
        int newTotalPoints = currentPoints + pointsEarned;
        freshUser.setPoints(newTotalPoints);
        userRepository.save(freshUser);

        return new FocusSessionResponseDto(
                session.getId(),
                startedAt,
                endedAt,
                durationSeconds,
                pointsEarned,
                newTotalPoints
        );
    }

    @Override
    public FocusStatsDto getStats(User user) {
        List<FocusSession> sessions = focusSessionRepository.findAllByUser(user);
        int totalSessions = sessions.size();
        int totalSeconds = sessions.stream()
                .mapToInt(s -> s.getDurationSeconds() == null ? 0 : s.getDurationSeconds())
                .sum();
        int totalPointsEarned = sessions.stream()
                .mapToInt(s -> s.getPointsEarned() == null ? 0 : s.getPointsEarned())
                .sum();
        return new FocusStatsDto(totalSessions, totalSeconds / 60, totalPointsEarned);
    }

    @Override
    public FocusSettingsDto getSettings(User user) {
        FocusSettings settings = focusSettingsRepository.findByUser(user)
                .orElseGet(() -> createDefaultSettings(user));
        return toSettingsDto(settings);
    }

    @Override
    public FocusSettingsDto updateSettings(User user, boolean musicEnabled, BackgroundTheme backgroundTheme) {
        FocusSettings settings = focusSettingsRepository.findByUser(user)
                .orElseGet(() -> createDefaultSettings(user));
        settings.setMusicEnabled(musicEnabled);
        settings.setBackgroundTheme(backgroundTheme);
        return toSettingsDto(focusSettingsRepository.save(settings));
    }

    private FocusSettings createDefaultSettings(User user) {
        FocusSettings s = new FocusSettings();
        s.setUser(user);
        s.setMusicEnabled(false);
        s.setBackgroundTheme(BackgroundTheme.THEME_0);
        return focusSettingsRepository.save(s);
    }

    private FocusTaskDto toTaskDto(FocusTask task) {
        return new FocusTaskDto(task.getId(), task.getTitle(), task.isCompleted(), task.getCreatedAt());
    }

    private FocusSettingsDto toSettingsDto(FocusSettings settings) {
        return new FocusSettingsDto(settings.isMusicEnabled(), settings.getBackgroundTheme().name());
    }
}
