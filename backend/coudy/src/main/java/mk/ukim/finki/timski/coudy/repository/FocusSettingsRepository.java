package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.FocusSettings;
import mk.ukim.finki.timski.coudy.model.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FocusSettingsRepository extends JpaRepository<FocusSettings, Long> {
    Optional<FocusSettings> findByUser(User user);
}
