package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.dto.StudyBlockDto;
import mk.ukim.finki.timski.coudy.dto.TimeSlotDto;
import mk.ukim.finki.timski.coudy.dto.WeeklyWorkloadDto;
import mk.ukim.finki.timski.coudy.model.domain.Deadline;
import mk.ukim.finki.timski.coudy.model.domain.ScoredDeadline;
import mk.ukim.finki.timski.coudy.model.enumerations.DeadlineStatus;
import mk.ukim.finki.timski.coudy.service.domain.ScheduleGenerationDomainService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ScheduleGenerationDomainServiceImpl implements ScheduleGenerationDomainService {

    @Override
    public List<StudyBlockDto> allocateStudyBlocks(
            List<TimeSlotDto> availableSlots,
            List<Deadline> deadlines,
            LocalDate weekStart) {

        List<StudyBlockDto> result = new ArrayList<>();

        // Filter out completed deadlines
        List<Deadline> activeDeadlines = deadlines.stream()
                .filter(d -> d.getStatus() != DeadlineStatus.COMPLETED)
                .toList();

        // Score and sort by urgency — lowest score = most urgent
        List<ScoredDeadline> scored = activeDeadlines.stream()
                .map(d -> new ScoredDeadline(d, calculateUrgencyScore(d, weekStart)))
                .sorted(Comparator.comparingDouble(ScoredDeadline::score))
                .toList();

        // Calculate remaining minutes per deadline using completionPercentage
        Map<Long, Integer> remainingMinutes = new HashMap<>();
        for (Deadline d : activeDeadlines) {
            int hoursNeeded = d.getEstimatedHours() != null ? d.getEstimatedHours() : 2;
            int completion = d.getCompletionPercentage() != null ? d.getCompletionPercentage() : 0;
            int remainingMins = (int) Math.ceil(hoursNeeded * 60 * (1 - completion / 100.0));
            if (remainingMins > 0) remainingMinutes.put(d.getId(), remainingMins);
        }

        // Greedily fill each time slot with the most urgent deadlines first
        for (TimeSlotDto slot : availableSlots) {
            int slotMinutes = (int) Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
            int cursor = 0;

            for (ScoredDeadline sd : scored) {
                if (cursor >= slotMinutes) break;
                int rem = remainingMinutes.getOrDefault(sd.deadline().getId(), 0);
                if (rem <= 0) continue;

                int allocate = Math.min(rem, slotMinutes - cursor);

                StudyBlockDto block = new StudyBlockDto();
                block.setDay(slot.getDay());
                block.setStartTime(slot.getStartTime().plusMinutes(cursor));
                block.setEndTime(slot.getStartTime().plusMinutes(cursor + allocate));
                block.setDeadlineId(sd.deadline().getId());
                block.setCourseName(sd.deadline().getCourse().getName());
                block.setDeadlineTitle(sd.deadline().getTitle());
                block.setAllocatedMinutes(allocate);
                block.setPriority(resolvePriority(sd.score()));

                result.add(block);
                remainingMinutes.put(sd.deadline().getId(), rem - allocate);
                cursor += allocate;
            }
        }

        return result;
    }

    @Override
    public WeeklyWorkloadDto calculateWorkload(LocalDate weekStart, List<StudyBlockDto> blocks) {
        int total = 0;
        Map<String, Integer> perCourse = new HashMap<>();

        for (StudyBlockDto block : blocks) {
            total += block.getAllocatedMinutes();
            perCourse.merge(block.getCourseName(), block.getAllocatedMinutes(), Integer::sum);
        }

        String pressure;
        if (total < 600) pressure = "LIGHT";
        else if (total < 1200) pressure = "MODERATE";
        else pressure = "HEAVY";

        long distinctDeadlines = blocks.stream()
                .map(StudyBlockDto::getDeadlineId)
                .distinct()
                .count();

        return new WeeklyWorkloadDto(weekStart, total, (int) distinctDeadlines, perCourse, pressure);
    }

    private double calculateUrgencyScore(Deadline deadline, LocalDate weekStart) {
        long daysLeft = ChronoUnit.DAYS.between(weekStart, deadline.getDueDate().toLocalDate());
        int hoursNeeded = deadline.getEstimatedHours() != null ? deadline.getEstimatedHours() : 2;
        int completion = deadline.getCompletionPercentage() != null ? deadline.getCompletionPercentage() : 0;
        int remainingHours = (int) Math.ceil(hoursNeeded * (1 - completion / 100.0));
        if (daysLeft <= 0) return 0.0;
        return (double) daysLeft / (remainingHours + 1);
    }

    private String resolvePriority(double score) {
        if (score < 1.5) return "HIGH";
        if (score < 3.5) return "MEDIUM";
        return "LOW";
    }
}