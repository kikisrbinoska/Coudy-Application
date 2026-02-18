package mk.ukim.finki.timski.coudy.web.controllers;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.timski.coudy.dto.*;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.service.application.ScheduleApplicationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleApplicationService scheduleApplicationService;

    @PostMapping("/generate")
    public ResponseEntity<ScheduleResponse> generate(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody GenerateScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(scheduleApplicationService.generateWeeklySchedule(getUsername(user), request));
    }

    @GetMapping
    public ResponseEntity<ScheduleResponse> getForWeek(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        try {
            return ResponseEntity.ok(scheduleApplicationService.getScheduleForWeek(getUsername(user), weekStart));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/regenerate")
    public ResponseEntity<ScheduleResponse> regenerate(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody GenerateScheduleRequest request) {
        return ResponseEntity.ok(scheduleApplicationService.regenerateSchedule(getUsername(user), request));
    }

    @PatchMapping("/{scheduleId}/adherence")
    public ResponseEntity<ScheduleResponse> updateAdherence(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleAdherenceRequest request) {
        return ResponseEntity.ok(scheduleApplicationService.updateAdherence(scheduleId, request));
    }

    @GetMapping("/workload")
    public ResponseEntity<WeeklyWorkloadDto> getWorkload(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(scheduleApplicationService.getWorkloadSummary(getUsername(user), weekStart));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ScheduleResponse>> getHistory(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(scheduleApplicationService.getAdherenceHistory(getUsername(user)));
    }

    private String getUsername(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return ((User) userDetails).getUsername();
        }
        return userDetails.getUsername();
    }
}
