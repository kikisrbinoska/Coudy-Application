package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.dto.WeeklySummaryDto;
import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.HabitLog;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.exceptions.InvalidArgumentsException;
import mk.ukim.finki.timski.coudy.repository.HabitLogRepository;
import mk.ukim.finki.timski.coudy.service.domain.HabitLogService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HabitLogServiceImpl implements HabitLogService {

    private final HabitLogRepository habitLogRepository;

    public HabitLogServiceImpl(HabitLogRepository habitLogRepository) {
        this.habitLogRepository = habitLogRepository;
    }

    @Override
    public List<HabitLog> findAll() {
        return habitLogRepository.findAll();
    }

    @Override
    public List<HabitLog> findAllByHabit(Habit habit) {
        return habitLogRepository.findAllByHabit(habit);
    }

    @Override
    public List<HabitLog> findAllByUser(User user) {
        return habitLogRepository.findAllByUser(user);
    }

    @Override
    public HabitLog findById(Long id) {
        return habitLogRepository.findById(id).orElseThrow(InvalidArgumentsException::new);
    }

    @Override
    public HabitLog create(HabitLog habitLog) {
        return habitLogRepository.save(habitLog);
    }

    @Override
    public HabitLog update(Long id, HabitLog habitLog) {
        HabitLog log = habitLogRepository.findById(id).orElseThrow(InvalidArgumentsException::new);
        log.setHabit(habitLog.getHabit());
        log.setUser(habitLog.getUser());
        log.setDate(habitLog.getDate());
        log.setCompleted(habitLog.getCompleted());
        log.setDifficultyRating(habitLog.getDifficultyRating());
        log.setNotes(habitLog.getNotes());
        log.setTimeSpentMinutes(habitLog.getTimeSpentMinutes());
        return habitLogRepository.save(log);
    }

    @Override
    public void delete(Long id) {
        habitLogRepository.deleteById(id);
    }

    @Override
    public List<WeeklySummaryDto> getWeeklySummary(User user) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        List<HabitLog> logs = habitLogRepository.findAllByUserAndDateBetween(user, weekStart, today);

        Map<LocalDate, Long> countByDate = logs.stream()
                .filter(l -> Boolean.TRUE.equals(l.getCompleted()))
                .collect(Collectors.groupingBy(HabitLog::getDate, Collectors.counting()));

        return weekStart.datesUntil(today.plusDays(1))
                .map(date -> new WeeklySummaryDto(
                        date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        countByDate.getOrDefault(date, 0L)
                ))
                .toList();
    }
}
