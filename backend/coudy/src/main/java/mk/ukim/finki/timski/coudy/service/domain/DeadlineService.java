package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;

public interface DeadlineService {
    Deadline createDeadline(Deadline deadline);
    List<Deadline> findAllDeadlinesByUser(User user);
    Deadline updateDeadline(Deadline deadline, User user);
    void deleteDeadline(Long id, User user);
}
