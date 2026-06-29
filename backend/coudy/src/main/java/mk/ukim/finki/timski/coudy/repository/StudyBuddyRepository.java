package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.StudyBuddy;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyBuddyRepository extends JpaRepository<StudyBuddy, Long> {
    @Query("""
            select sb
            from StudyBuddy sb
            where sb.user1.username = :username or sb.user2.username = :username
            order by sb.matchedAt desc, sb.id desc
            """)
    List<StudyBuddy> findAllForUser(String username);

    @Query("""
            select sb
            from StudyBuddy sb
            where ((sb.user1.username = :username1 and sb.user2.username = :username2)
                or (sb.user1.username = :username2 and sb.user2.username = :username1))
            """)
    Optional<StudyBuddy> findPair(String username1, String username2);

    @Query("""
            select sb
            from StudyBuddy sb
            where (sb.user1.username = :username or sb.user2.username = :username)
              and sb.status = :status
            order by sb.matchedAt desc, sb.id desc
            """)
    List<StudyBuddy> findAllForUserByStatus(String username, BuddyStatus status);
}
