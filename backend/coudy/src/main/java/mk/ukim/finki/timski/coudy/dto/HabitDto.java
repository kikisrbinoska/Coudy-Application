package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.enumerations.HabitCategory;
import mk.ukim.finki.timski.coudy.model.enumerations.TargetFrequency;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record HabitDto(
        Long id,
        String name,
        String icon,
        HabitCategory category,
        TargetFrequency targetFrequency,
        LocalTime reminderTime,
        Integer streakCurrent,
        Integer streakLongest,
        Integer totalCompletions,
        LocalDateTime createdAt,
        boolean completedToday,
        double completionRate
) {}
