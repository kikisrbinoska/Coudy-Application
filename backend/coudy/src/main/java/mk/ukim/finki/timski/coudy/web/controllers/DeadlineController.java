package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.Habit;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.service.domain.CourseService;
import mk.ukim.finki.timski.coudy.service.domain.DeadlineService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deadline")
public class DeadlineController {
    private final DeadlineService deadlineService;

    public DeadlineController(DeadlineService deadlineService) {
        this.deadlineService = deadlineService;
    }

    @PostMapping("/add")
    public Deadline create(@RequestBody Deadline deadline, @AuthenticationPrincipal User user) {
        deadline.setUser(user);
        return deadlineService.createDeadline(deadline);
    }

    @GetMapping
    public List<Deadline> getAllDeadlines(@AuthenticationPrincipal User user) {
        return deadlineService.findAllDeadlinesByUser(user);
    }

    @PostMapping("/change")
    public Deadline update(@RequestBody Deadline deadline, @AuthenticationPrincipal User user) {
        deadline.setUser(user);
        if(deadline.getStatus().equals(DeadlineStatus.COMPLETED)){
            deadline.setCompletionPercentage(100);
        }
        if(deadline.getStatus().equals(DeadlineStatus.NOT_STARTED)){
            deadline.setCompletionPercentage(0);
        }
        return deadlineService.updateDeadline(deadline);
    }
}
