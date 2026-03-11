package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.HabitLog;
import mk.ukim.finki.timski.coudy.model.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog,Long> {
    List<HabitLog> findAllByHabit(Habit habit);
    List<HabitLog> findAllByUser(User user);
    List<HabitLog> findAllByHabitAndDate(Habit habit, LocalDate date);
}
