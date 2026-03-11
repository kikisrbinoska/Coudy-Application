package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.WeeklySummaryDto;
import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.HabitLog;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;

public interface HabitLogService {
    List<HabitLog> findAll();
    List<HabitLog> findAllByHabit(Habit habit);
    List<HabitLog> findAllByUser(User user);
    HabitLog findById(Long id);
    HabitLog create(HabitLog habitLog);
    HabitLog update(Long id, HabitLog habitLog);
    void delete(Long id);
    List<WeeklySummaryDto> getWeeklySummary(User user);
}
