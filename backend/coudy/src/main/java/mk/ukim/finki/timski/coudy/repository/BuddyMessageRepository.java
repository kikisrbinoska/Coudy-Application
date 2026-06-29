package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.BuddyMessage;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface BuddyMessageRepository extends JpaRepository<BuddyMessage, Long> {
    List<BuddyMessage> findByStudyBuddyIdOrderBySentAtAsc(Long studyBuddyId);

    @Query("""
            select m
            from BuddyMessage m
            where m.readAt is null
              and m.sender.username <> :username
              and (m.studyBuddy.user1.username = :username or m.studyBuddy.user2.username = :username)
            order by m.sentAt desc, m.id desc
            """)
    List<BuddyMessage> findUnreadForUser(String username);

    @Query("""
            select count(m)
            from BuddyMessage m
            where m.readAt is null
              and m.sender.username <> :username
              and (m.studyBuddy.user1.username = :username or m.studyBuddy.user2.username = :username)
            """)
    long countUnreadForUser(String username);

    @Query("""
            select count(m)
            from BuddyMessage m
            where m.readAt is null
              and m.sender.username <> :username
              and m.studyBuddy.id = :buddyId
            """)
    long countUnreadForBuddy(String username, Long buddyId);

    @Modifying
    @Query("""
            update BuddyMessage m
            set m.readAt = :readAt
            where m.readAt is null
              and m.sender.username <> :username
              and (m.studyBuddy.user1.username = :username or m.studyBuddy.user2.username = :username)
            """)
    int markUnreadForUserAsRead(String username, LocalDateTime readAt);

    @Modifying
    @Query("""
            update BuddyMessage m
            set m.readAt = :readAt
            where m.studyBuddy.id = :buddyId
              and m.readAt is null
              and m.sender.username <> :username
            """)
    int markUnreadForBuddyAsRead(String username, Long buddyId, LocalDateTime readAt);
}
