package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.model.enumerations.Priority;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.repository.CourseRepository;
import mk.ukim.finki.timski.coudy.service.domain.DeadlineService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class DeadlineServiceImpl implements DeadlineService {

    private final DeadlineRepository deadlineRepository;
    private final CourseRepository courseRepository;

    public DeadlineServiceImpl(DeadlineRepository deadlineRepository, CourseRepository courseRepository) {
        this.deadlineRepository = deadlineRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public Deadline createDeadline(Deadline deadline) {
        deadline.setCourse(resolveCourse(deadline.getCourse()));
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
    public Deadline updateDeadline(Deadline deadline, User user) {
        if (deadline.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline id is required");
        }

        Deadline existingDeadline = findOwnedDeadline(deadline.getId(), user);

        existingDeadline.setCourse(resolveCourse(deadline.getCourse()));
        existingDeadline.setTitle(deadline.getTitle());
        existingDeadline.setDescription(deadline.getDescription());
        existingDeadline.setDueDate(deadline.getDueDate());
        existingDeadline.setEstimatedHours(deadline.getEstimatedHours());
        existingDeadline.setPriority(deadline.getPriority());
        existingDeadline.setCompletionPercentage(deadline.getCompletionPercentage());
        existingDeadline.setStatus(deadline.getStatus());

        normalizeDeadline(existingDeadline);
        return deadlineRepository.save(existingDeadline);
    }

    @Override
    public void deleteDeadline(Long id, User user) {
        Deadline deadline = findOwnedDeadline(id, user);
        deadlineRepository.delete(deadline);
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

    private Deadline findOwnedDeadline(Long id, User user) {
        Deadline deadline = deadlineRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deadline not found"));

        if (deadline.getUser() == null || user == null || !deadline.getUser().getUsername().equals(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this deadline");
        }

        return deadline;
    }

    private Course resolveCourse(Course course) {
        if (course == null || course.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course id is required");
        }

        return courseRepository.findById(course.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }
}
