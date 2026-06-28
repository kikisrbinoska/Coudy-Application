package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.enumerations.Difficulty;

public record GameDto(
        Long id,
        String name,
        String description,
        String subject,
        String icon,
        Integer points,
        Integer level,
        Difficulty difficulty,
        String category,
        Boolean active
) {}