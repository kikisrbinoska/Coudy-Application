package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;

public interface CourseService {
    List<Course> findAllByUser(User user);
}
