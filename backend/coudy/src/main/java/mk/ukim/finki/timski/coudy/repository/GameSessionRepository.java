package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.GameSession;
import mk.ukim.finki.timski.coudy.model.enumerations.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    List<GameSession> findByUserUsernameAndStatus(String username, GameStatus status);



}
