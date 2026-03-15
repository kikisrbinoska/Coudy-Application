package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;

public record DisplayCourseDto (
        Long id,
        String code,
        String name,
        String user
){
    public static DisplayCourseDto from(Course course) {
        return new DisplayCourseDto(course.getId(),course.getCode(),course.getName(),course.getUser().getUsername());
    }
    public static List<DisplayCourseDto> from(List<Course> courses) {
        return courses.stream().map(DisplayCourseDto::from).toList();
    }
    public Course toCourse(User user) {
        return new Course(code,name,user);
    }
}
