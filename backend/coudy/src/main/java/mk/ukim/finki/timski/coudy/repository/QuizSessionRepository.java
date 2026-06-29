package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, String> {


    List<QuizSession> findByCourse(String course);

    // Само завршени сесии
    List<QuizSession> findByCompleted(boolean completed);

    // Сесии по курс сортирани по датум
    List<QuizSession> findByCourseOrderByCreatedAtDesc(String course);
}
