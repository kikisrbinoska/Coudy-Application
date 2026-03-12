package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.service.domain.DeadlineService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DeadlineServiceImpl implements DeadlineService {

    private final DeadlineRepository deadlineRepository;

    public DeadlineServiceImpl(DeadlineRepository deadlineRepository) {
        this.deadlineRepository = deadlineRepository;
    }

    @Override
    public Deadline createDeadline(Deadline deadline) {
        if (deadline.getCreatedAt() == null) {
            deadline.setCreatedAt(LocalDateTime.now());
        }
        if (deadline.getCompletionPercentage() == null) {
            deadline.setCompletionPercentage(0);
        }
        if (deadline.getStatus() == null) {
            deadline.setStatus(DeadlineStatus.NOT_STARTED);
        }
        return deadlineRepository.save(deadline);
    }

    @Override
    public List<Deadline> findAllDeadlinesByUser(User user) {
        List<Deadline> deadlines = deadlineRepository.findByUserUsername(user.getUsername());
        deadlines.sort(Comparator.comparingInt((Deadline d) -> d.getPriority().getWeight()).reversed()
                .thenComparing(Deadline::getDueDate));
        return deadlines;
    }

    @Override
    public Deadline updateDeadline(Deadline deadline) {
        return deadlineRepository.save(deadline);
    }
}
