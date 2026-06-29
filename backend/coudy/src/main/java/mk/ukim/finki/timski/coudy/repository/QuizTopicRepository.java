package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.QuizTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizTopicRepository extends JpaRepository<QuizTopic, Long> {

    List<QuizTopic> findByCourse(String course);

    Optional<QuizTopic> findByCourseAndTopic(String course, String topic);

    boolean existsByCourseAndTopic(String course, String topic);  // ← ова мора да го имаш

    @Query("SELECT DISTINCT t.course FROM QuizTopic t")
    List<String> findAllDistinctCourses();

    @Query("SELECT t FROM QuizTopic t WHERE t.generatedQuestionsJson IS NULL OR t.generatedQuestionsJson = ''")
    List<QuizTopic> findTopicsWithoutQuestions();
}