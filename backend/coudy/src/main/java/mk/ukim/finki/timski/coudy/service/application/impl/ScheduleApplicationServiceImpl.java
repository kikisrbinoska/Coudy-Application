package mk.ukim.finki.timski.coudy.service.application.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.timski.coudy.dto.*;
import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.Schedule;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.repository.ScheduleRepository;
import mk.ukim.finki.timski.coudy.repository.UserRepository;
import mk.ukim.finki.timski.coudy.service.application.ScheduleApplicationService;
import mk.ukim.finki.timski.coudy.service.domain.ScheduleGenerationDomainService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleApplicationServiceImpl implements ScheduleApplicationService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final DeadlineRepository deadlineRepository;
    private final ScheduleGenerationDomainService domainService;

    @Override
    public ScheduleResponse generateWeeklySchedule(String username, GenerateScheduleRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate week end date (7 days after week start)
        LocalDate weekEnd = request.getWeekStart().plusDays(7);
        LocalDateTime weekStartDateTime = request.getWeekStart().atStartOfDay();
        LocalDateTime weekEndDateTime = weekEnd.atStartOfDay();

        // Fetch active deadlines for the week
        List<Deadline> deadlines = deadlineRepository.findByUserUsernameAndDueDateBetween(
                username,
                weekStartDateTime,
                weekEndDateTime
        );

        List<StudyBlockDto> blocks = domainService.allocateStudyBlocks(
                request.getAvailableSlots(),
                deadlines,
                request.getWeekStart()
        );

        Schedule schedule = new Schedule();
        schedule.setUser(user);
        schedule.setWeekStart(request.getWeekStart());
        schedule.setScheduleJson(serialize(blocks));
        schedule.setGeneratedAt(LocalDateTime.now());

        scheduleRepository.save(schedule);
        return mapToResponse(schedule, blocks);
    }

    @Override
    public ScheduleResponse regenerateSchedule(String username, GenerateScheduleRequest request) {
        if (scheduleRepository.existsByUserUsernameAndWeekStart(username, request.getWeekStart())) {
            scheduleRepository.deleteByUserUsernameAndWeekStart(username, request.getWeekStart());
        }
        return generateWeeklySchedule(username, request);
    }

    @Override
    public ScheduleResponse getScheduleForWeek(String username, LocalDate weekStart) {
        Schedule schedule = scheduleRepository
                .findByUserUsernameAndWeekStart(username, weekStart)
                .orElseThrow(() -> new RuntimeException("No schedule found for this week"));
        return mapToResponse(schedule, deserialize(schedule.getScheduleJson()));
    }

    @Override
    public ScheduleResponse updateAdherence(Long scheduleId, ScheduleAdherenceRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.setWasFollowed(request.getWasFollowed());
        schedule.setAdherencePercentage(request.getAdherencePercentage());
        scheduleRepository.save(schedule);
        return mapToResponse(schedule, deserialize(schedule.getScheduleJson()));
    }

    @Override
    public WeeklyWorkloadDto getWorkloadSummary(String username, LocalDate weekStart) {
        Schedule schedule = scheduleRepository
                .findByUserUsernameAndWeekStart(username, weekStart)
                .orElseThrow(() -> new RuntimeException("No schedule found for this week"));
        return domainService.calculateWorkload(weekStart, deserialize(schedule.getScheduleJson()));
    }

    @Override
    public List<ScheduleResponse> getAdherenceHistory(String username) {
        return scheduleRepository.findByUserUsernameOrderByWeekStartDesc(username)
                .stream()
                .map(s -> mapToResponse(s, deserialize(s.getScheduleJson())))
                .toList();
    }

    private String serialize(List<StudyBlockDto> blocks) {
        try {
            return OBJECT_MAPPER.writeValueAsString(blocks);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize schedule blocks", e);
        }
    }

    private List<StudyBlockDto> deserialize(String json) {
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<StudyBlockDto>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize schedule blocks", e);
        }
    }

    private ScheduleResponse mapToResponse(Schedule schedule, List<StudyBlockDto> blocks) {
        ScheduleResponse response = new ScheduleResponse();
        response.setId(schedule.getId());
        response.setWeekStart(schedule.getWeekStart());
        response.setStudyBlocks(blocks);
        response.setWasFollowed(schedule.getWasFollowed());
        response.setAdherencePercentage(schedule.getAdherencePercentage());
        response.setGeneratedAt(schedule.getGeneratedAt());
        return response;
    }
}