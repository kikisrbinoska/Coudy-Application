package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.BuddySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuddySessionRepository extends JpaRepository<BuddySession, Long> {
    List<BuddySession> findByStudyBuddyIdOrderByScheduledTimeDesc(Long studyBuddyId);
}
