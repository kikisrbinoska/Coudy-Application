package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.StudyBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudyBlockRepository extends JpaRepository<StudyBlock, Long> {

    Optional<StudyBlock> findByIdAndSchedule_User_Username(Long id, String username);
}
