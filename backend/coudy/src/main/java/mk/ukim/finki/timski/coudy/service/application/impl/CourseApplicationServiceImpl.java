package mk.ukim.finki.timski.coudy.service.application.impl;

import mk.ukim.finki.timski.coudy.dto.CreateCourseDto;
import mk.ukim.finki.timski.coudy.dto.DisplayCourseDto;
import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.exceptions.UserNotFoundException;
import mk.ukim.finki.timski.coudy.service.application.CourseApplicationService;
import mk.ukim.finki.timski.coudy.service.domain.CourseService;
import mk.ukim.finki.timski.coudy.service.domain.UserService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CourseApplicationServiceImpl implements CourseApplicationService {
    private final CourseService courseService;
    private final UserService userService;

    public CourseApplicationServiceImpl(CourseService courseService, UserService userService) {
        this.courseService = courseService;
        this.userService = userService;
    }

    @Override
    public Optional<DisplayCourseDto> save(CreateCourseDto courseDto) {
        User user = (User) userService.loadUserByUsername(courseDto.user());
        Course course = new Course(courseDto.code(), courseDto.name(), user);
        return courseService.save(course).map(DisplayCourseDto::from);
    }

    @Override
    public Optional<DisplayCourseDto> update(Long id, CreateCourseDto courseDto) {
        User user = (User) userService.loadUserByUsername(courseDto.user());
        Course patch = new Course(courseDto.code(), courseDto.name(), user);
        return courseService.update(id, patch).map(DisplayCourseDto::from);
    }

    @Override
    public Optional<DisplayCourseDto> findById(Long id) {
        return courseService.findById(id).map(DisplayCourseDto::from);
    }

    @Override
    public void deleteById(Long id) {
        courseService.deleteById(id);
    }
}
