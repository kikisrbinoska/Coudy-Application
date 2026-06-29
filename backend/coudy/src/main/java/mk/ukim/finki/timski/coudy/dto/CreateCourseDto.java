package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.domain.Course;

public record CreateCourseDto (
     String code,
     String name,
     String user
){
    public static CreateCourseDto from(Course course) {
        return new CreateCourseDto(course.getCode(),course.getName(),course.getUser().getUsername());
    }
}
