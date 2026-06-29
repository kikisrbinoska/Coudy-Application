package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.dto.CreateCourseDto;
import mk.ukim.finki.timski.coudy.dto.DisplayCourseDto;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.Role;
import mk.ukim.finki.timski.coudy.service.PdfTopicService;
import mk.ukim.finki.timski.coudy.service.application.CourseApplicationService;
import mk.ukim.finki.timski.coudy.service.domain.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;
    private final CourseApplicationService courseApplicationService;
    private final PdfTopicService pdfTopicService;

    public CourseController(CourseService courseService, CourseApplicationService courseApplicationService, PdfTopicService pdfTopicService) {
        this.courseService = courseService;
        this.courseApplicationService = courseApplicationService;
        this.pdfTopicService = pdfTopicService;
    }

    @GetMapping
    public List<DisplayCourseDto> findAll(@AuthenticationPrincipal User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            return DisplayCourseDto.from(courseService.findAllByUser(user));
        }
        return DisplayCourseDto.from(courseService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisplayCourseDto> findById(@PathVariable Long id) {
        return courseApplicationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DisplayCourseDto> create(@RequestBody CreateCourseDto courseDto,
                                                    @AuthenticationPrincipal User user) {
        CreateCourseDto withUser = new CreateCourseDto(courseDto.code(), courseDto.name(), user.getUsername());
        return courseApplicationService.save(withUser)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DisplayCourseDto> update(@PathVariable Long id,
                                                    @RequestBody CreateCourseDto courseDto,
                                                    @AuthenticationPrincipal User user) {
        CreateCourseDto withUser = new CreateCourseDto(courseDto.code(), courseDto.name(), user.getUsername());
        return courseApplicationService.update(id, withUser)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseApplicationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<Map<String, Object>> uploadPresentations(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {
        return courseApplicationService.findById(id)
                .map(course -> {
                    int count = pdfTopicService.processUploads(course.name(), files);
                    Map<String, Object> body = new java.util.HashMap<>();
                    body.put("course", course.name());
                    body.put("topicsCreated", count);
                    return ResponseEntity.ok(body);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
