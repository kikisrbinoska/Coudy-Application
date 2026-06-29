package mk.ukim.finki.timski.coudy.dto;

import java.time.LocalDateTime;

public record FocusTaskDto(Long id, String title, boolean completed, LocalDateTime createdAt) {}
