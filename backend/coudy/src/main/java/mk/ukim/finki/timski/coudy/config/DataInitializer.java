package mk.ukim.finki.timski.coudy.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.Game;
import mk.ukim.finki.timski.coudy.model.domain.QuizTopic;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.model.enumerations.Difficulty;
import mk.ukim.finki.timski.coudy.model.enumerations.Priority;
import mk.ukim.finki.timski.coudy.model.enumerations.Role;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.repository.GameRepository;
import mk.ukim.finki.timski.coudy.repository.QuizTopicRepository;
import mk.ukim.finki.timski.coudy.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DeadlineRepository deadlineRepository;
    private final GameRepository gameRepository;
    private final QuizTopicRepository quizTopicRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        if (userRepository.findByUsername("kikis").isPresent()) return;

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

        Course db = new Course();
        db.setCode("CS401");
        db.setName("Database Design");
        db.setUser(user);
        entityManager.persist(db);

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

        // ── Educational Games ─────────────────────────────────────────────────
        Game g1 = new Game();
        g1.setName("Math Blitz");
        g1.setDescription("Solve algebra and arithmetic problems under time pressure to earn bonus points.");
        g1.setSubject("Mathematics");
        g1.setIcon("➗");
        g1.setPoints(100);
        g1.setLevel(1);
        g1.setDifficulty(Difficulty.EASY);
        g1.setCategory("Quiz");
        g1.setActive(true);
        gameRepository.save(g1);

        Game g2 = new Game();
        g2.setName("Code Duel");
        g2.setDescription("Race against the clock to fix bugs and write functions in Java or Python.");
        g2.setSubject("Computer Science");
        g2.setIcon("💻");
        g2.setPoints(200);
        g2.setLevel(3);
        g2.setDifficulty(Difficulty.HARD);
        g2.setCategory("Coding");
        g2.setActive(true);
        gameRepository.save(g2);

        Game g3 = new Game();
        g3.setName("History Hunt");
        g3.setDescription("Match historical events to dates and figures in this fast-paced trivia game.");
        g3.setSubject("History");
        g3.setIcon("🏛️");
        g3.setPoints(150);
        g3.setLevel(2);
        g3.setDifficulty(Difficulty.MEDIUM);
        g3.setCategory("Trivia");
        g3.setActive(true);
        gameRepository.save(g3);

        Game g4 = new Game();
        g4.setName("Science Lab");
        g4.setDescription("Run virtual experiments and answer questions about chemistry and physics.");
        g4.setSubject("Science");
        g4.setIcon("🔬");
        g4.setPoints(175);
        g4.setLevel(2);
        g4.setDifficulty(Difficulty.MEDIUM);
        g4.setCategory("Simulation");
        g4.setActive(true);
        gameRepository.save(g4);

        Game g5 = new Game();
        g5.setName("Word Wizard");
        g5.setDescription("Expand your vocabulary by unscrambling words and solving language puzzles.");
        g5.setSubject("Language Arts");
        g5.setIcon("📝");
        g5.setPoints(120);
        g5.setLevel(1);
        g5.setDifficulty(Difficulty.EASY);
        g5.setCategory("Puzzle");
        g5.setActive(true);
        gameRepository.save(g5);

        Game g6 = new Game();
        g6.setName("Logic Master");
        g6.setDescription("Challenge your critical thinking with logic puzzles and reasoning problems.");
        g6.setSubject("Philosophy");
        g6.setIcon("🧠");
        g6.setPoints(250);
        g6.setLevel(4);
        g6.setDifficulty(Difficulty.EXPERT);
        g6.setCategory("Puzzle");
        g6.setActive(true);
        gameRepository.save(g6);

        // ── Quiz Topics (from quiz_dataset.json) ──────────────────────────────
        if (quizTopicRepository.count() == 0) {
            try {
                InputStream is = new ClassPathResource("quiz_dataset.json").getInputStream();
                List<QuizTopic> topics = new ObjectMapper()
                        .readValue(is, new TypeReference<List<QuizTopic>>() {});
                quizTopicRepository.saveAll(topics);
                System.out.println("  Quiz topics: " + topics.size() + " topics loaded from quiz_dataset.json");
            } catch (Exception e) {
                System.err.println("  Failed to load quiz_dataset.json: " + e.getMessage());
            }
        }

        System.out.println("=================================================");
        System.out.println("  Dev data initialized:");
        System.out.println("  Users  : kikis / password123  (ROLE_USER)");
        System.out.println("           admin / admin123     (ROLE_ADMIN)");
        System.out.println("  Courses: MATH101, CS202, CS301");
        System.out.println("  Deadlines: 3 active deadlines for kikis");
        System.out.println("  Games: 6 educational games seeded");
        System.out.println("=================================================");
    }
}
