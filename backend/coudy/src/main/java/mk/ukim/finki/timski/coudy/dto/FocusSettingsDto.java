package mk.ukim.finki.timski.coudy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FocusSettingsDto(
        @JsonProperty("musicEnabled") boolean musicEnabled,
        @JsonProperty("backgroundTheme") String backgroundTheme
) {}
