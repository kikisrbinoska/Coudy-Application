package mk.ukim.finki.timski.coudy.repository;

import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course,Long> {
    Course findByName(String name);
    Course findById(long id);
    List<Course> findAllByUser(User user);

}
