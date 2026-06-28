package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.model.enumerations.Priority;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.service.domain.DeadlineService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        normalizeDeadline(deadline);
        if (deadline.getCreatedAt() == null) {
            deadline.setCreatedAt(LocalDateTime.now());
        }
        return deadlineRepository.save(deadline);
    }

    @Override
    public List<Deadline> findAllDeadlinesByUser(User user) {
        List<Deadline> deadlines = deadlineRepository.findByUserUsername(user.getUsername());
        deadlines.forEach(this::normalizeDeadline);
        deadlines.sort(Comparator
                .comparing((Deadline d) -> d.getPriority(), Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed()
                .thenComparing(Deadline::getDueDate, Comparator.nullsLast(Comparator.naturalOrder())));
        return deadlines;
    }

    @Override
    public Deadline updateDeadline(Deadline deadline) {
        normalizeDeadline(deadline);
        return deadlineRepository.save(deadline);
    }

    @Override
    public void deleteDeadline(Long id) {
        deadlineRepository.deleteById(id);
    }

    private void normalizeDeadline(Deadline deadline) {
        if (deadline.getPriority() == null) {
            deadline.setPriority(Priority.MEDIUM);
        }
        if (deadline.getCompletionPercentage() == null) {
            deadline.setCompletionPercentage(0);
        }
        if (deadline.getStatus() == null) {
            deadline.setStatus(DeadlineStatus.NOT_STARTED);
        }
    }
}
