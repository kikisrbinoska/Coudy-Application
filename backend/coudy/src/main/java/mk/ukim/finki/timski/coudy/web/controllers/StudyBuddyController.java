package mk.ukim.finki.timski.coudy.web.controllers;

import mk.ukim.finki.timski.coudy.dto.BuddyMessageDto;
import mk.ukim.finki.timski.coudy.dto.BuddyConnectionRequestDto;
import mk.ukim.finki.timski.coudy.dto.BuddyNotificationDto;
import mk.ukim.finki.timski.coudy.dto.BuddySessionDto;
import mk.ukim.finki.timski.coudy.dto.CreateBuddySessionRequest;
import mk.ukim.finki.timski.coudy.dto.SendBuddyMessageRequest;
import mk.ukim.finki.timski.coudy.dto.StudyBuddyCardDto;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.service.domain.StudyBuddyService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-buddies")
public class StudyBuddyController {
    private final StudyBuddyService studyBuddyService;

    public StudyBuddyController(StudyBuddyService studyBuddyService) {
        this.studyBuddyService = studyBuddyService;
    }

    @GetMapping("/discover")
    public List<StudyBuddyCardDto> discover(@AuthenticationPrincipal User user) {
        return studyBuddyService.discover(user);
    }

    @GetMapping("/mine")
    public List<StudyBuddyCardDto> mine(@AuthenticationPrincipal User user) {
        return studyBuddyService.myBuddies(user);
    }

    @GetMapping("/requests/incoming")
    public List<BuddyConnectionRequestDto> incomingRequests(@AuthenticationPrincipal User user) {
        return studyBuddyService.incomingRequests(user);
    }

    @GetMapping("/requests/outgoing")
    public List<BuddyConnectionRequestDto> outgoingRequests(@AuthenticationPrincipal User user) {
        return studyBuddyService.outgoingRequests(user);
    }

    @GetMapping("/notifications")
    public List<BuddyNotificationDto> notifications(@AuthenticationPrincipal User user) {
        return studyBuddyService.notifications(user);
    }

    @GetMapping("/notifications/count")
    public long notificationCount(@AuthenticationPrincipal User user) {
        return studyBuddyService.unreadNotificationCount(user);
    }

    @PostMapping("/notifications/read")
    public void markNotificationsRead(@AuthenticationPrincipal User user) {
        studyBuddyService.markNotificationsRead(user);
    }

    @PostMapping("/connect/{username}")
    public BuddyConnectionRequestDto connect(@AuthenticationPrincipal User user, @PathVariable String username) {
        return studyBuddyService.connect(user, username);
    }

    @PostMapping("/requests/{requestId}/accept")
    public BuddyConnectionRequestDto accept(@AuthenticationPrincipal User user, @PathVariable Long requestId) {
        return studyBuddyService.acceptRequest(user, requestId);
    }

    @PostMapping("/requests/{requestId}/decline")
    public BuddyConnectionRequestDto decline(@AuthenticationPrincipal User user, @PathVariable Long requestId) {
        return studyBuddyService.declineRequest(user, requestId);
    }

    @PostMapping("/requests/{requestId}/cancel")
    public BuddyConnectionRequestDto cancel(@AuthenticationPrincipal User user, @PathVariable Long requestId) {
        return studyBuddyService.cancelRequest(user, requestId);
    }

    @DeleteMapping("/{buddyId}")
    public void removeBuddy(@AuthenticationPrincipal User user, @PathVariable Long buddyId) {
        studyBuddyService.removeBuddy(user, buddyId);
    }

    @GetMapping("/{buddyId}/sessions")
    public List<BuddySessionDto> sessions(@AuthenticationPrincipal User user, @PathVariable Long buddyId) {
        return studyBuddyService.sessions(user, buddyId);
    }

    @PostMapping("/{buddyId}/sessions")
    public BuddySessionDto createSession(
            @AuthenticationPrincipal User user,
            @PathVariable Long buddyId,
            @RequestBody CreateBuddySessionRequest request
    ) {
        return studyBuddyService.createSession(user, buddyId, request);
    }

    @GetMapping("/{buddyId}/messages")
    public List<BuddyMessageDto> messages(@AuthenticationPrincipal User user, @PathVariable Long buddyId) {
        return studyBuddyService.messages(user, buddyId);
    }

    @PostMapping("/{buddyId}/messages")
    public BuddyMessageDto sendMessage(
            @AuthenticationPrincipal User user,
            @PathVariable Long buddyId,
            @RequestBody SendBuddyMessageRequest request
    ) {
        return studyBuddyService.sendMessage(user, buddyId, request);
    }
}
