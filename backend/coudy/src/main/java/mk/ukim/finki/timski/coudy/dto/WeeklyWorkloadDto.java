package mk.ukim.finki.timski.coudy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyWorkloadDto {
    private LocalDate weekStart;
    private int totalStudyMinutes;
    private int totalDeadlines;
    private Map<String, Integer> minutesPerCourse;
    private String overallPressure;
}