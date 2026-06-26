package mk.ukim.finki.timski.coudy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateFocusSessionRequest(
        @JsonProperty("duration_seconds") Integer durationSeconds
) {}
