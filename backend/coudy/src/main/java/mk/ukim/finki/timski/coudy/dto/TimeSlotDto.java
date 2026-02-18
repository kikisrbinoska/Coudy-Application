package mk.ukim.finki.timski.coudy.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class TimeSlotDto {
    private DayOfWeek day;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
}