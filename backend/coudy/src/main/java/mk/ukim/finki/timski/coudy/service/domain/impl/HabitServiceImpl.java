package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.dto.HabitDto;
import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.HabitLog;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.exceptions.InvalidArgumentsException;
import mk.ukim.finki.timski.coudy.repository.HabitLogRepository;
import mk.ukim.finki.timski.coudy.repository.HabitRepository;
import mk.ukim.finki.timski.coudy.service.domain.HabitService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class HabitServiceImpl implements HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    public HabitServiceImpl(HabitRepository habitRepository, HabitLogRepository habitLogRepository) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
    }

    @Override
    public List<Habit> findAll() {
        return habitRepository.findAll();
    }

    @Override
    public List<Habit> findAllByUser(User user) {
        return habitRepository.findAllByUser(user);
    }

    @Override
    public List<HabitDto> findAllByUserAsDto(User user) {
        List<Habit> habits = habitRepository.findAllByUser(user);
        LocalDate today = LocalDate.now();
        return habits.stream().map(h -> toDto(h, today)).toList();
    }

    @Override
    public Habit findById(Long id) {
        return habitRepository.findById(id).orElseThrow(InvalidArgumentsException::new);
    }

    @Override
    public Habit create(Habit habit) {
        if (habit.getCreatedAt() == null) {
            habit.setCreatedAt(LocalDateTime.now());
        }
        if (habit.getStreakCurrent() == null) habit.setStreakCurrent(0);
        if (habit.getStreakLongest() == null) habit.setStreakLongest(0);
        if (habit.getTotalCompletions() == null) habit.setTotalCompletions(0);
        return habitRepository.save(habit);
    }

    @Override
    public Habit update(Long id, Habit updatedHabit) {
        Habit habit = habitRepository.findById(id).orElseThrow(InvalidArgumentsException::new);
        habit.setName(updatedHabit.getName());
        habit.setIcon(updatedHabit.getIcon());
        habit.setCategory(updatedHabit.getCategory());
        habit.setTargetFrequency(updatedHabit.getTargetFrequency());
        habit.setReminderTime(updatedHabit.getReminderTime());
        habit.setStreakCurrent(updatedHabit.getStreakCurrent());
        habit.setStreakLongest(updatedHabit.getStreakLongest());
        habit.setTotalCompletions(updatedHabit.getTotalCompletions());
        return habitRepository.save(habit);
    }

    @Override
    public void delete(Long id) {
        habitRepository.deleteById(id);
    }

    @Override
    public HabitDto completeToday(Long id, User user) {
        Habit habit = habitRepository.findById(id).orElseThrow(InvalidArgumentsException::new);
        LocalDate today = LocalDate.now();

        // Dedup: don't allow completing twice on the same day
        List<HabitLog> existing = habitLogRepository.findAllByHabitAndDate(habit, today);
        boolean alreadyCompleted = existing.stream().anyMatch(l -> Boolean.TRUE.equals(l.getCompleted()));
        if (!alreadyCompleted) {
            HabitLog log = new HabitLog();
            log.setHabit(habit);
            log.setUser(user);
            log.setDate(today);
            log.setCompleted(true);
            habitLogRepository.save(log);

            // Update streak
            int newStreak = (habit.getStreakCurrent() == null ? 0 : habit.getStreakCurrent()) + 1;
            habit.setStreakCurrent(newStreak);
            if (habit.getStreakLongest() == null || newStreak > habit.getStreakLongest()) {
                habit.setStreakLongest(newStreak);
            }
            int completions = (habit.getTotalCompletions() == null ? 0 : habit.getTotalCompletions()) + 1;
            habit.setTotalCompletions(completions);
            habitRepository.save(habit);
        }

        return toDto(habit, today);
    }

    private HabitDto toDto(Habit habit, LocalDate today) {
        List<HabitLog> logs = habitLogRepository.findAllByHabit(habit);
        boolean completedToday = logs.stream()
                .anyMatch(l -> today.equals(l.getDate()) && Boolean.TRUE.equals(l.getCompleted()));

        double completionRate = 0;
        if (!logs.isEmpty()) {
            long completed = logs.stream().filter(l -> Boolean.TRUE.equals(l.getCompleted())).count();
            completionRate = Math.round((completed * 100.0 / logs.size()));
        }

        return new HabitDto(
                habit.getId(),
                habit.getName(),
                habit.getIcon(),
                habit.getCategory(),
                habit.getTargetFrequency(),
                habit.getReminderTime(),
                habit.getStreakCurrent() == null ? 0 : habit.getStreakCurrent(),
                habit.getStreakLongest() == null ? 0 : habit.getStreakLongest(),
                habit.getTotalCompletions() == null ? 0 : habit.getTotalCompletions(),
                habit.getCreatedAt(),
                completedToday,
                completionRate
        );
    }
}
