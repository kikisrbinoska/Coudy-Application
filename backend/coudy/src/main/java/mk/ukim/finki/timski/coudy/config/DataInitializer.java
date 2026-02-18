package mk.ukim.finki.timski.coudy.config;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.model.enumerations.Priority;
import mk.ukim.finki.timski.coudy.model.enumerations.Role;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DeadlineRepository deadlineRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        // ── Users ─────────────────────────────────────────────────────────────
        User user = new User("kikis", passwordEncoder.encode("password123"), "Kiki", "Test", Role.ROLE_USER);
        user.setPoints(0);
        userRepository.save(user);

        User admin = new User("admin", passwordEncoder.encode("admin123"), "Admin", "User", Role.ROLE_ADMIN);
        admin.setPoints(0);
        userRepository.save(admin);

        // ── Courses ───────────────────────────────────────────────────────────
        Course math = new Course();
        math.setCode("MATH101");
        math.setName("Mathematics");
        math.setUser(user);
        entityManager.persist(math);

        Course os = new Course();
        os.setCode("CS202");
        os.setName("Operating Systems");
        os.setUser(user);
        entityManager.persist(os);

        Course web = new Course();
        web.setCode("CS301");
        web.setName("Web Development");
        web.setUser(user);
        entityManager.persist(web);

        entityManager.flush();

        // ── Deadlines (this week so schedule generation works) ────────────────
        LocalDateTime now = LocalDateTime.now();

        Deadline d1 = new Deadline();
        d1.setUser(user);
        d1.setCourse(math);
        d1.setTitle("Calculus Assignment");
        d1.setDescription("Chapter 5 exercises");
        d1.setDueDate(now.plusDays(3));
        d1.setEstimatedHours(4);
        d1.setPriority(Priority.HIGH);
        d1.setCompletionPercentage(20);
        d1.setStatus(DeadlineStatus.IN_PROGRESS);
        d1.setCreatedAt(now);
        deadlineRepository.save(d1);

        Deadline d2 = new Deadline();
        d2.setUser(user);
        d2.setCourse(os);
        d2.setTitle("Process Scheduling Lab");
        d2.setDescription("Implement Round Robin scheduler");
        d2.setDueDate(now.plusDays(5));
        d2.setEstimatedHours(6);
        d2.setPriority(Priority.CRITICAL);
        d2.setCompletionPercentage(0);
        d2.setStatus(DeadlineStatus.NOT_STARTED);
        d2.setCreatedAt(now);
        deadlineRepository.save(d2);

        Deadline d3 = new Deadline();
        d3.setUser(user);
        d3.setCourse(web);
        d3.setTitle("REST API Project");
        d3.setDescription("Build a Spring Boot REST API");
        d3.setDueDate(now.plusDays(6));
        d3.setEstimatedHours(8);
        d3.setPriority(Priority.MEDIUM);
        d3.setCompletionPercentage(50);
        d3.setStatus(DeadlineStatus.IN_PROGRESS);
        d3.setCreatedAt(now);
        deadlineRepository.save(d3);

        System.out.println("=================================================");
        System.out.println("  Dev data initialized:");
        System.out.println("  Users  : kikis / password123  (ROLE_USER)");
        System.out.println("           admin / admin123     (ROLE_ADMIN)");
        System.out.println("  Courses: MATH101, CS202, CS301");
        System.out.println("  Deadlines: 3 active deadlines for kikis");
        System.out.println("=================================================");
    }
}
