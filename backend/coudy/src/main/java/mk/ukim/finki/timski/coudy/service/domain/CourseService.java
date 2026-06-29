package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;
import java.util.Optional;

public interface CourseService {
    List<Course> findAll();
    List<Course> findAllByUser(User user);
    Optional<Course> findById(Long id);

    Optional<Course> update(Long id, Course course);

    Optional<Course> save(Course course);

    void deleteById(Long id);

}
