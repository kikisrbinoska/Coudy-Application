package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.model.domain.Deadline;

import java.util.List;

import mk.ukim.finki.timski.coudy.model.domain.User;

public interface DeadlineService {
    Deadline createDeadline(Deadline deadline);
    List<Deadline> findAllDeadlinesByUser(User user);
    Deadline updateDeadline(Deadline deadline);
}
