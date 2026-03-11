package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.HabitDto;
import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;

public interface HabitService {

    List<Habit> findAll();

    List<Habit> findAllByUser(User user);

    List<HabitDto> findAllByUserAsDto(User user);

    Habit findById(Long id);

    Habit create(Habit habit);

    Habit update(Long id, Habit habit);

    void delete(Long id);

    HabitDto completeToday(Long id, User user);
}
