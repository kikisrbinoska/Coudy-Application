package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.StudyBlockDto;
import mk.ukim.finki.timski.coudy.dto.TimeSlotDto;
import mk.ukim.finki.timski.coudy.dto.WeeklyWorkloadDto;
import mk.ukim.finki.timski.coudy.model.domain.Deadline;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleGenerationDomainService {

    List<StudyBlockDto> allocateStudyBlocks(
            List<TimeSlotDto> availableSlots,
            List<Deadline> deadlines,
            LocalDate weekStart
    );

    WeeklyWorkloadDto calculateWorkload(LocalDate weekStart, List<StudyBlockDto> blocks);
}