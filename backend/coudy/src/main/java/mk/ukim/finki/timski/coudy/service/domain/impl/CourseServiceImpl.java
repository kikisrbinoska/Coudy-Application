package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.repository.CourseRepository;
import mk.ukim.finki.timski.coudy.service.domain.CourseService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;

    public CourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    @Override
    public List<Course> findAllByUser(User user) {
        return courseRepository.findAllByUser(user);
    }

    @Override
    public Optional<Course> findById(Long id) {
        return courseRepository.findById(id);
    }

    @Override
    public Optional<Course> update(Long id, Course course) {
        return courseRepository.findById(id)
                .map(existingCourse -> {
                    if (course.getName() != null) existingCourse.setName(course.getName());
                    if (course.getCode() != null) existingCourse.setCode(course.getCode());
                    if (course.getUser() != null) existingCourse.setUser(course.getUser());

                    Course updatedCourse = courseRepository.save(existingCourse);
                    return updatedCourse;
                });
    }

    @Override
    public Optional<Course> save(Course course) {
        Optional<Course> savedCourse = Optional.empty();
        if(course.getUser() != null){
            savedCourse = Optional.of(courseRepository.save(
                    new Course(course.getCode(), course.getName(), course.getUser())
            ));
        }
        return savedCourse;
    }

    @Override
    public void deleteById(Long id) {
        courseRepository.deleteById(id);
    }
}
