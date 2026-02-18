package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    Optional<Schedule> findByUserUsernameAndWeekStart(String username, LocalDate weekStart);

    List<Schedule> findByUserUsernameOrderByWeekStartDesc(String username);

    List<Schedule> findByUserUsernameAndWeekStartBetween(String username, LocalDate from, LocalDate to);

    boolean existsByUserUsernameAndWeekStart(String username, LocalDate weekStart);

    void deleteByUserUsernameAndWeekStart(String username, LocalDate weekStart);
}