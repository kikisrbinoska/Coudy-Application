package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;

public interface HabitService {

    List<Habit> findAll();

    List<Habit> findAllByUser(User user);

    Habit findById(Long id);

    Habit create(Habit habit);

    Habit update(Long id,Habit habit);

    void detele(Long id);
}
