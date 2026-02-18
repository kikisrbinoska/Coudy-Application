package mk.ukim.finki.timski.coudy.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScheduleResponse {
    private Long id;
    private LocalDate weekStart;
    private List<StudyBlockDto> studyBlocks;
    private Boolean wasFollowed;
    private Integer adherencePercentage;
    private LocalDateTime generatedAt;
}