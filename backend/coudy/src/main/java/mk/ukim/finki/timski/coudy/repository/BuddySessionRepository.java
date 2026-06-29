package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.BuddySession;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface BuddySessionRepository extends JpaRepository<BuddySession, Long> {
    List<BuddySession> findByStudyBuddyIdOrderByScheduledTimeDesc(Long studyBuddyId);

    @Query("""
            select s
            from BuddySession s
            where s.readAt is null
              and s.createdBy.username <> :username
              and (s.studyBuddy.user1.username = :username or s.studyBuddy.user2.username = :username)
            order by s.createdAt desc, s.id desc
            """)
    List<BuddySession> findUnreadForUser(String username);

    @Query("""
            select count(s)
            from BuddySession s
            where s.readAt is null
              and s.createdBy.username <> :username
              and (s.studyBuddy.user1.username = :username or s.studyBuddy.user2.username = :username)
            """)
    long countUnreadForUser(String username);

    @Query("""
            select count(s)
            from BuddySession s
            where s.readAt is null
              and s.createdBy.username <> :username
              and s.studyBuddy.id = :buddyId
            """)
    long countUnreadForBuddy(String username, Long buddyId);

    @Modifying
    @Query("""
            update BuddySession s
            set s.readAt = :readAt
            where s.readAt is null
              and s.createdBy.username <> :username
              and (s.studyBuddy.user1.username = :username or s.studyBuddy.user2.username = :username)
            """)
    int markUnreadForUserAsRead(String username, LocalDateTime readAt);

    @Modifying
    @Query("""
            update BuddySession s
            set s.readAt = :readAt
            where s.readAt is null
              and s.studyBuddy.id = :buddyId
              and s.createdBy.username <> :username
            """)
    int markUnreadForBuddyAsRead(String username, Long buddyId, LocalDateTime readAt);
}
