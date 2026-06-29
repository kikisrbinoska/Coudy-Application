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


import mk.ukim.finki.timski.coudy.model.domain.*;
import mk.ukim.finki.timski.coudy.model.enumerations.*;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.repository.GameRepository;
import mk.ukim.finki.timski.coudy.repository.QuestionRepository;


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
    private final QuestionRepository questionRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        // Always reload quiz topics in dev so the seeded data stays consistent.
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

        if (userRepository.findByUsername("kikis").isPresent()) return;

        // ── Users ─────────────────────────────────────────────────────────────
        User user = new User("kikis", passwordEncoder.encode("password123"), "Kiki", "Test", Role.ROLE_USER);
        user.setPoints(0);
        user.setMajor("Computer Science");
        user.setYear("Junior");
        user.setStudyStyle("Discussion");
        user.setAvailability("Evenings");
        user.setBio("Enjoys algorithm drills, systems topics, and collaborative study sessions.");
        userRepository.save(user);

        User admin = new User("admin", passwordEncoder.encode("admin123"), "Admin", "User", Role.ROLE_ADMIN);
        admin.setPoints(0);
        admin.setMajor("Computer Science");
        admin.setYear("Staff");
        admin.setStudyStyle("Teaching");
        admin.setAvailability("Flexible");
        admin.setBio("Platform administrator and occasional study mentor.");
        userRepository.save(admin);

        // ── Courses ───────────────────────────────────────────────────────────
        Course intSys = new Course(); intSys.setCode("IS101"); intSys.setName("Integrated Systems"); intSys.setUser(user); entityManager.persist(intSys);
        Course soa = new Course(); soa.setCode("SOA201"); soa.setName("Service Oriented Architecture"); soa.setUser(user); entityManager.persist(soa);
        Course st = new Course(); st.setCode("ST301"); st.setName("Software Testing"); st.setUser(user); entityManager.persist(st);
        Course cd = new Course(); cd.setCode("CD401"); cd.setName("CI/CD"); cd.setUser(user); entityManager.persist(cd);
        Course ap = new Course(); ap.setCode("AP501"); ap.setName("Advanced Programming"); ap.setUser(user); entityManager.persist(ap);

        User maria = new User("maria", passwordEncoder.encode("password123"), "Maria", "Gonzales", Role.ROLE_USER);
        maria.setPoints(320);
        maria.setMajor("Mathematics");
        maria.setYear("Sophomore");
        maria.setStudyStyle("Problem Solving");
        maria.setAvailability("Afternoons");
        maria.setBio("Loves calculus, proof practice, and quick feedback loops.");
        entityManager.persist(maria);

        User nikola = new User("nikola", passwordEncoder.encode("password123"), "Nikola", "Petrov", Role.ROLE_USER);
        nikola.setPoints(280);
        nikola.setMajor("Physics");
        nikola.setYear("Senior");
        nikola.setStudyStyle("Teaching");
        nikola.setAvailability("Evenings");
        nikola.setBio("Physics tutor who likes whiteboard sessions and exam prep.");
        entityManager.persist(nikola);

        User ana = new User("ana", passwordEncoder.encode("password123"), "Ana", "Ilic", Role.ROLE_USER);
        ana.setPoints(210);
        ana.setMajor("Computer Science");
        ana.setYear("Junior");
        ana.setStudyStyle("Discussion");
        ana.setAvailability("Flexible");
        ana.setBio("Frontend and algorithms are the favorite combo.");
        entityManager.persist(ana);

        Course m1 = new Course(); m1.setCode("MTH201"); m1.setName("Linear Algebra"); m1.setUser(maria); entityManager.persist(m1);
        Course m2 = new Course(); m2.setCode("MTH202"); m2.setName("Calculus II"); m2.setUser(maria); entityManager.persist(m2);
        Course n1 = new Course(); n1.setCode("PHY301"); n1.setName("Thermodynamics"); n1.setUser(nikola); entityManager.persist(n1);
        Course n2 = new Course(); n2.setCode("PHY302"); n2.setName("Quantum Mechanics"); n2.setUser(nikola); entityManager.persist(n2);
        Course a1 = new Course(); a1.setCode("CS302"); a1.setName("Algorithms"); a1.setUser(ana); entityManager.persist(a1);
        Course a2 = new Course(); a2.setCode("CS303"); a2.setName("Web Dev"); a2.setUser(ana); entityManager.persist(a2);

        entityManager.flush();

        // ── Deadlines ────────────────────────────────────────────────────────
        LocalDateTime now = LocalDateTime.now();

        Deadline d1 = new Deadline();
        d1.setUser(user);
        d1.setCourse(soa);
        d1.setTitle("SOA Assignment");
        d1.setDescription("Strategic DDD homework");
        d1.setDueDate(now.plusDays(3));
        d1.setEstimatedHours(4);
        d1.setPriority(Priority.HIGH);
        d1.setCompletionPercentage(20);
        d1.setStatus(DeadlineStatus.IN_PROGRESS);
        d1.setCreatedAt(now);
        deadlineRepository.save(d1);

        Deadline d2 = new Deadline();
        d2.setUser(user);
        d2.setCourse(st);
        d2.setTitle("Testing Lab");
        d2.setDescription("Graph coverage exercises");
        d2.setDueDate(now.plusDays(5));
        d2.setEstimatedHours(6);
        d2.setPriority(Priority.CRITICAL);
        d2.setCompletionPercentage(0);
        d2.setStatus(DeadlineStatus.NOT_STARTED);
        d2.setCreatedAt(now);
        deadlineRepository.save(d2);

        Deadline d3 = new Deadline();
        d3.setUser(user);
        d3.setCourse(ap);
        d3.setTitle("Java Streams Project");
        d3.setDescription("Implement functional pipelines");
        d3.setDueDate(now.plusDays(6));
        d3.setEstimatedHours(8);
        d3.setPriority(Priority.MEDIUM);
        d3.setCompletionPercentage(50);
        d3.setStatus(DeadlineStatus.IN_PROGRESS);
        d3.setCreatedAt(now);
        deadlineRepository.save(d3);





        StudyBuddy buddy1 = new StudyBuddy();
        buddy1.setUser1(user);
        buddy1.setUser2(ana);
        buddy1.setMatchScore(94);
        buddy1.setStatus(BuddyStatus.ACTIVE);
        buddy1.setMatchedAt(now.minusDays(4));
        buddy1.setSessionCount(3);
        entityManager.persist(buddy1);

        StudyBuddy buddy2 = new StudyBuddy();
        buddy2.setUser1(user);
        buddy2.setUser2(maria);
        buddy2.setMatchScore(87);
        buddy2.setStatus(BuddyStatus.ACTIVE);
        buddy2.setMatchedAt(now.minusDays(8));
        buddy2.setSessionCount(5);
        entityManager.persist(buddy2);

        StudyBuddy buddy3 = new StudyBuddy();
        buddy3.setUser1(user);
        buddy3.setUser2(nikola);
        buddy3.setMatchScore(82);
        buddy3.setStatus(BuddyStatus.PENDING);
        buddy3.setMatchedAt(now.minusDays(1));
        buddy3.setSessionCount(0);
        entityManager.persist(buddy3);

        BuddySession session1 = new BuddySession();
        session1.setStudyBuddy(buddy1);
        session1.setScheduledTime(now.plusHours(2));
        session1.setLocation("Library Room 2");
        session1.setDurationMinutes(90);
        session1.setAttendedUser1(false);
        session1.setAttendedUser2(false);
        session1.setNotes("Algorithms review");
        session1.setStatus(SessionStatus.SCHEDULED);
        entityManager.persist(session1);

        BuddySession session2 = new BuddySession();
        session2.setStudyBuddy(buddy2);
        session2.setScheduledTime(now.plusDays(1).withHour(16).withMinute(0));
        session2.setLocation("Campus cafe");
        session2.setDurationMinutes(60);
        session2.setAttendedUser1(true);
        session2.setAttendedUser2(true);
        session2.setRatingUser1(5);
        session2.setRatingUser2(5);
        session2.setNotes("Calculus practice");
        session2.setStatus(SessionStatus.COMPLETED);
        entityManager.persist(session2);

        BuddyMessage message1 = new BuddyMessage();
        message1.setStudyBuddy(buddy1);
        message1.setSender(user);
        message1.setContent("Are you free to review sorting algorithms later?");
        message1.setSentAt(now.minusHours(3));
        entityManager.persist(message1);

        BuddyMessage message2 = new BuddyMessage();
        message2.setStudyBuddy(buddy1);
        message2.setSender(ana);
        message2.setContent("Yes, let's do 7 PM.");
        message2.setSentAt(now.minusHours(2));
        entityManager.persist(message2);

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



        //QUESTIONS
        Question q1 = new Question();
        q1.setGame(g1);
        q1.setText("2 + 2 = ?");
        q1.setOptions(List.of("3", "4", "5"));
        q1.setCorrectAnswer("4");
        q1.setQuestionType(QuestionType.SINGLE_CHOICE);
        questionRepository.save(q1);

        Question q2 = new Question();
        q2.setGame(g1);
        q2.setText("10 - 7 = ?");
        q2.setOptions(List.of("2", "3", "4"));
        q2.setCorrectAnswer("3");
        q2.setQuestionType(QuestionType.SINGLE_CHOICE);
        questionRepository.save(q2);

        Question q3 = new Question();
        q3.setGame(g1);
        q3.setText("5 * 6 = ?");
        q3.setOptions(List.of("11", "30", "56"));
        q3.setCorrectAnswer("30");
        q3.setQuestionType(QuestionType.SINGLE_CHOICE);
        questionRepository.save(q3);



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
