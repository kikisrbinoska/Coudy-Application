package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.BuddyConnectionRequest;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuddyConnectionRequestRepository extends JpaRepository<BuddyConnectionRequest, Long> {
    @Query("""
            select r
            from BuddyConnectionRequest r
            where r.receiver.username = :username
              and r.status = :status
            order by r.createdAt desc, r.id desc
            """)
    List<BuddyConnectionRequest> findIncoming(String username, BuddyRequestStatus status);

    @Query("""
            select r
            from BuddyConnectionRequest r
            where r.receiver.username = :username
              and r.status = :status
              and r.readAt is null
            order by r.createdAt desc, r.id desc
            """)
    List<BuddyConnectionRequest> findUnreadIncoming(String username, BuddyRequestStatus status);

    @Query("""
            select count(r)
            from BuddyConnectionRequest r
            where r.receiver.username = :username
              and r.status = :status
              and r.readAt is null
            """)
    long countUnreadIncoming(String username, BuddyRequestStatus status);

    @Modifying
    @Query("""
            update BuddyConnectionRequest r
            set r.readAt = :readAt
            where r.receiver.username = :username
              and r.status = :status
              and r.readAt is null
            """)
    int markUnreadIncomingAsRead(String username, BuddyRequestStatus status, java.time.LocalDateTime readAt);

    @Query("""
            select r
            from BuddyConnectionRequest r
            where r.sender.username = :username
            order by r.createdAt desc, r.id desc
            """)
    List<BuddyConnectionRequest> findOutgoing(String username);

    @Query("""
            select r
            from BuddyConnectionRequest r
            where ((r.sender.username = :username1 and r.receiver.username = :username2)
                or (r.sender.username = :username2 and r.receiver.username = :username1))
              and r.status = :status
            order by r.createdAt desc, r.id desc
            """)
    List<BuddyConnectionRequest> findBetween(String username1, String username2, BuddyRequestStatus status);

    default Optional<BuddyConnectionRequest> findPendingBetween(String username1, String username2) {
        return findBetween(username1, username2, BuddyRequestStatus.PENDING).stream().findFirst();
    }
}
