package mk.ukim.finki.timski.coudy.service.application;

import mk.ukim.finki.timski.coudy.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleApplicationService {

    ScheduleResponse generateWeeklySchedule(String username, GenerateScheduleRequest request);

    ScheduleResponse regenerateSchedule(String username, GenerateScheduleRequest request);

    ScheduleResponse getScheduleForWeek(String username, LocalDate weekStart);

    ScheduleResponse updateAdherence(Long scheduleId, ScheduleAdherenceRequest request);

    WeeklyWorkloadDto getWorkloadSummary(String username, LocalDate weekStart);

    List<ScheduleResponse> getAdherenceHistory(String username);
}