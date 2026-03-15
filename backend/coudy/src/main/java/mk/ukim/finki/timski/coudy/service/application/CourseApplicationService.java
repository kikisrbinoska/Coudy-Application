package mk.ukim.finki.timski.coudy.service.application;

import mk.ukim.finki.timski.coudy.dto.CreateCourseDto;
import mk.ukim.finki.timski.coudy.dto.DisplayCourseDto;

import java.util.Optional;

public interface CourseApplicationService {
    Optional<DisplayCourseDto> update(Long id, CreateCourseDto courseDto) ;

    Optional<DisplayCourseDto> save(CreateCourseDto courseDto);

    Optional<DisplayCourseDto> findById(Long id);


    void deleteById(Long id);

}
