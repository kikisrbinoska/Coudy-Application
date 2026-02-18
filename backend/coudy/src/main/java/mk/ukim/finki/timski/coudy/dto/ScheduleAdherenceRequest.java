package mk.ukim.finki.timski.coudy.dto;

import lombok.Data;

@Data
public class ScheduleAdherenceRequest {
    private Boolean wasFollowed;
    private Integer adherencePercentage;
}