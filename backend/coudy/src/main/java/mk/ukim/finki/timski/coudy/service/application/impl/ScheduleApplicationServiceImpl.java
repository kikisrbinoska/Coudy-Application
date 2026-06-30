package mk.ukim.finki.timski.coudy.service.application.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.timski.coudy.dto.*;
import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.Schedule;
import mk.ukim.finki.timski.coudy.model.domain.StudyBlock;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.repository.DeadlineRepository;
import mk.ukim.finki.timski.coudy.repository.ScheduleRepository;
import mk.ukim.finki.timski.coudy.repository.StudyBlockRepository;
import mk.ukim.finki.timski.coudy.repository.UserRepository;
import mk.ukim.finki.timski.coudy.service.application.ScheduleApplicationService;
import mk.ukim.finki.timski.coudy.service.domain.ScheduleGenerationDomainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleApplicationServiceImpl implements ScheduleApplicationService {

    private final ScheduleRepository scheduleRepository;
    private final StudyBlockRepository studyBlockRepository;
    private final UserRepository userRepository;
    private final DeadlineRepository deadlineRepository;
    private final ScheduleGenerationDomainService domainService;

    @Override
    @Transactional
    public ScheduleResponse generateWeeklySchedule(String username, GenerateScheduleRequest request) {
        if (request.getWeekStart() == null) {
            throw new IllegalArgumentException("weekStart is required");
        }

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
        schedule.setGeneratedAt(LocalDateTime.now());
        schedule.setStudyBlocks(blocks.stream().map(b -> toEntity(b, schedule)).toList());

        scheduleRepository.save(schedule);
        return mapToResponse(schedule);
    }

    @Override
    @Transactional
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
        return mapToResponse(schedule);
    }

    @Override
    @Transactional
    public ScheduleResponse updateAdherence(Long scheduleId, ScheduleAdherenceRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.setWasFollowed(request.getWasFollowed());
        schedule.setAdherencePercentage(request.getAdherencePercentage());
        scheduleRepository.save(schedule);
        return mapToResponse(schedule);
    }

    @Override
    public WeeklyWorkloadDto getWorkloadSummary(String username, LocalDate weekStart) {
        Schedule schedule = scheduleRepository
                .findByUserUsernameAndWeekStart(username, weekStart)
                .orElseThrow(() -> new RuntimeException("No schedule found for this week"));
        return domainService.calculateWorkload(weekStart, schedule.getStudyBlocks().stream().map(this::toDto).toList());
    }

    @Override
    public List<ScheduleResponse> getAdherenceHistory(String username) {
        return scheduleRepository.findByUserUsernameOrderByWeekStartDesc(username)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public ScheduleResponse updateStudyBlock(String username, Long blockId, UpdateStudyBlockRequest request) {
        StudyBlock block = studyBlockRepository.findByIdAndSchedule_User_Username(blockId, username)
                .orElseThrow(() -> new RuntimeException("Study block not found"));
        if (request.getDay() != null) block.setDay(request.getDay());
        if (request.getStartTime() != null) block.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) block.setEndTime(request.getEndTime());
        studyBlockRepository.save(block);
        return mapToResponse(block.getSchedule());
    }

    @Override
    @Transactional
    public ScheduleResponse deleteStudyBlock(String username, Long blockId) {
        StudyBlock block = studyBlockRepository.findByIdAndSchedule_User_Username(blockId, username)
                .orElseThrow(() -> new RuntimeException("Study block not found"));
        Schedule schedule = block.getSchedule();
        schedule.getStudyBlocks().remove(block);
        scheduleRepository.save(schedule);
        return mapToResponse(schedule);
    }

    private StudyBlock toEntity(StudyBlockDto dto, Schedule schedule) {
        StudyBlock block = new StudyBlock();
        block.setSchedule(schedule);
        block.setDay(dto.getDay());
        block.setStartTime(dto.getStartTime());
        block.setEndTime(dto.getEndTime());
        block.setDeadlineId(dto.getDeadlineId());
        block.setCourseName(dto.getCourseName());
        block.setDeadlineTitle(dto.getDeadlineTitle());
        block.setAllocatedMinutes(dto.getAllocatedMinutes());
        block.setPriority(dto.getPriority());
        return block;
    }

    private StudyBlockDto toDto(StudyBlock block) {
        StudyBlockDto dto = new StudyBlockDto();
        dto.setId(block.getId());
        dto.setDay(block.getDay());
        dto.setStartTime(block.getStartTime());
        dto.setEndTime(block.getEndTime());
        dto.setDeadlineId(block.getDeadlineId());
        dto.setCourseName(block.getCourseName());
        dto.setDeadlineTitle(block.getDeadlineTitle());
        dto.setAllocatedMinutes(block.getAllocatedMinutes());
        dto.setPriority(block.getPriority());
        return dto;
    }

    private ScheduleResponse mapToResponse(Schedule schedule) {
        ScheduleResponse response = new ScheduleResponse();
        response.setId(schedule.getId());
        response.setWeekStart(schedule.getWeekStart());
        response.setStudyBlocks(schedule.getStudyBlocks().stream().map(this::toDto).toList());
        response.setWasFollowed(schedule.getWasFollowed());
        response.setAdherencePercentage(schedule.getAdherencePercentage());
        response.setGeneratedAt(schedule.getGeneratedAt());
        return response;
    }
}
