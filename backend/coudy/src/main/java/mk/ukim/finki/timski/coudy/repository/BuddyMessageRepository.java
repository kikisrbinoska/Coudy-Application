package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.BuddyMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuddyMessageRepository extends JpaRepository<BuddyMessage, Long> {
    List<BuddyMessage> findByStudyBuddyIdOrderBySentAtAsc(Long studyBuddyId);
}
