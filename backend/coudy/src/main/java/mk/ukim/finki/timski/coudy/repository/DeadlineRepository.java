package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeadlineRepository extends JpaRepository<Deadline, Long> {
    
    List<Deadline> findByUserUsername(String username);
    
    List<Deadline> findByUserUsernameAndStatusNot(String username, DeadlineStatus status);
    
    List<Deadline> findByUserUsernameAndDueDateBetween(String username, LocalDateTime start, LocalDateTime end);
    
    List<Deadline> findByUserUsernameAndDueDateAfter(String username, LocalDateTime date);
}
