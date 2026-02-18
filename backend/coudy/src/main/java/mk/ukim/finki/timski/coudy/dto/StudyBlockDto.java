package mk.ukim.finki.timski.coudy.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class StudyBlockDto {
    private DayOfWeek day;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
    private Long deadlineId;
    private String courseName;
    private String deadlineTitle;
    private int allocatedMinutes;
    private String priority; // HIGH, MEDIUM, LOW
}