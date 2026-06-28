package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.enumerations.QuestionType;

import java.util.List;

public record QuestionDto(
        Long id,
        String text,
        List<String> options,
        QuestionType questionType
) {
}
