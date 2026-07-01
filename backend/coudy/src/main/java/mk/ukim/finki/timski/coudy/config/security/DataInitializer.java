package mk.ukim.finki.timski.coudy.config.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.timski.coudy.model.domain.*;
import mk.ukim.finki.timski.coudy.model.enumerations.*;
import mk.ukim.finki.timski.coudy.repository.*;
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

        // Games and their questions are seeded independently of the user check below,
        // and per-game/per-question, so re-running after adding a new game (or new
        // questions for an existing game) doesn't get silently skipped just because
        // the "kikis" dev user already exists.
        seedGamesAndQuestions();

        if (userRepository.findByUsername("kikis").isPresent())
        {
            System.out.println("EXITING DATA INITIALIZER");
            return;
        }

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

        System.out.println("=================================================");
        System.out.println("  Dev data initialized:");
        System.out.println("  Users  : kikis / password123  (ROLE_USER)");
        System.out.println("           admin / admin123     (ROLE_ADMIN)");
        System.out.println("  Courses: MATH101, CS202, CS301");
        System.out.println("  Deadlines: 3 active deadlines for kikis");
        System.out.println("  Games: 6 educational games seeded, each with questions");
        System.out.println("=================================================");
    }

    // Finds each game by name (creating it if missing) and backfills its questions
    // if it has none, so partial/broken seed state from earlier runs self-heals
    // instead of being permanently skipped by the "kikis" user guard above.
    private void seedGamesAndQuestions() {
        Game g1 = findOrCreateGame("Math Blitz", "Solve algebra and arithmetic problems under time pressure to earn bonus points.",
                "Mathematics", "➗", 100, 1, Difficulty.EASY, "Quiz");
        seedQuestionsIfMissing(g1, List.of(
                newQuestion(g1, "3 + 2 = ?", List.of("3", "4", "5"), "4"),
                newQuestion(g1, "10 - 7 = ?", List.of("2", "3", "4"), "3"),
                newQuestion(g1, "5 * 6 = ?", List.of("11", "30", "56"), "30"),
                newQuestion(g1, "5 * 6 = ?", List.of("11", "30", "56"), "30")
        ));

        Game g2 = findOrCreateGame("Code Duel", "Race against the clock to fix bugs and write functions in Java or Python.",
                "Computer Science", "💻", 200, 3, Difficulty.HARD, "Coding");
        seedQuestionsIfMissing(g2, List.of(
                newQuestion(g2, "Which keyword declares a constant in Java?", List.of("var", "final", "let"), "final"),
                newQuestion(g2, "What does JVM stand for?", List.of("Java Virtual Machine", "Java Variable Method", "Just Virtual Memory"), "Java Virtual Machine"),
                newQuestion(g2, "Which data structure uses FIFO order?", List.of("Stack", "Queue", "Tree"), "Queue")
        ));

        Game g3 = findOrCreateGame("History Hunt", "Match historical events to dates and figures in this fast-paced trivia game.",
                "History", "🏛️", 150, 2, Difficulty.MEDIUM, "Trivia");
        seedQuestionsIfMissing(g3, List.of(
                newQuestion(g3, "In which year did World War II end?", List.of("1943", "1945", "1950"), "1945"),
                newQuestion(g3, "Who was the first President of the United States?", List.of("Thomas Jefferson", "George Washington", "Abraham Lincoln"), "George Washington"),
                newQuestion(g3, "The Great Wall is located in which country?", List.of("China", "India", "Egypt"), "China")
        ));

        Game g4 = findOrCreateGame("Science Lab", "Run virtual experiments and answer questions about chemistry and physics.",
                "Science", "🔬", 175, 2, Difficulty.MEDIUM, "Simulation");
        seedQuestionsIfMissing(g4, List.of(
                newQuestion(g4, "What is the chemical symbol for water?", List.of("H2O", "CO2", "O2"), "H2O"),
                newQuestion(g4, "What force pulls objects toward the Earth?", List.of("Magnetism", "Gravity", "Friction"), "Gravity"),
                newQuestion(g4, "How many bones are in the adult human body?", List.of("206", "150", "300"), "206")
        ));

        Game g5 = findOrCreateGame("Word Wizard", "Expand your vocabulary by unscrambling words and solving language puzzles.",
                "Language Arts", "📝", 120, 1, Difficulty.EASY, "Puzzle");
        seedQuestionsIfMissing(g5, List.of(
                newQuestion(g5, "Which word is a synonym for \"happy\"?", List.of("Joyful", "Angry", "Tired"), "Joyful"),
                newQuestion(g5, "What is the plural of \"child\"?", List.of("Childs", "Children", "Childes"), "Children"),
                newQuestion(g5, "Which word means the opposite of \"ancient\"?", List.of("Modern", "Old", "Historic"), "Modern")
        ));

        Game g6 = findOrCreateGame("Logic Master", "Challenge your critical thinking with logic puzzles and reasoning problems.",
                "Philosophy", "🧠", 250, 4, Difficulty.EXPERT, "Puzzle");
        seedQuestionsIfMissing(g6, List.of(
                newQuestion(g6, "If all cats are animals, and Tom is a cat, then Tom is a...?", List.of("Plant", "Animal", "Mineral"), "Animal"),
                newQuestion(g6, "What comes next in the sequence: 2, 4, 8, 16, ?", List.of("18", "24", "32"), "32"),
                newQuestion(g6, "A statement that is either true or false is called a...?", List.of("Proposition", "Question", "Opinion"), "Proposition")
        ));
    }

    private Question newQuestion(Game game, String text, List<String> options, String correctAnswer) {
        Question question = new Question();
        question.setGame(game);
        question.setText(text);
        question.setOptions(options);
        question.setCorrectAnswer(correctAnswer);
        question.setQuestionType(QuestionType.SINGLE_CHOICE);
        return question;
    }

    private Game findOrCreateGame(String name, String description, String subject, String icon,
                                  int points, int level, Difficulty difficulty, String category) {
        return gameRepository.findByName(name).orElseGet(() -> {
            Game game = new Game();
            game.setName(name);
            game.setDescription(description);
            game.setSubject(subject);
            game.setIcon(icon);
            game.setPoints(points);
            game.setLevel(level);
            game.setDifficulty(difficulty);
            game.setCategory(category);
            game.setActive(true);
            return gameRepository.save(game);
        });
    }

    private void seedQuestionsIfMissing(Game game, List<Question> questions) {
        if (questionRepository.findAllByGameId(game.getId()).isEmpty()) {
            questionRepository.saveAll(questions);
        }
    }
}