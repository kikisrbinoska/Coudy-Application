package mk.ukim.finki.timski.coudy.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class GenerateScheduleRequest {
    private LocalDate weekStart;
    private List<TimeSlotDto> availableSlots;
}