package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.FocusTask;
import mk.ukim.finki.timski.coudy.model.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FocusTaskRepository extends JpaRepository<FocusTask, Long> {
    List<FocusTask> findAllByUserOrderByCreatedAtDesc(User user);
}
