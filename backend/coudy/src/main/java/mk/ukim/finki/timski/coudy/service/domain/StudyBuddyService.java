package mk.ukim.finki.timski.coudy.service.domain;

import mk.ukim.finki.timski.coudy.dto.BuddyMessageDto;
import mk.ukim.finki.timski.coudy.dto.BuddyConnectionRequestDto;
import mk.ukim.finki.timski.coudy.dto.BuddySessionDto;
import mk.ukim.finki.timski.coudy.dto.CreateBuddySessionRequest;
import mk.ukim.finki.timski.coudy.dto.SendBuddyMessageRequest;
import mk.ukim.finki.timski.coudy.dto.StudyBuddyCardDto;
import mk.ukim.finki.timski.coudy.model.domain.User;

import java.util.List;

public interface StudyBuddyService {
    List<StudyBuddyCardDto> discover(User user);
    List<StudyBuddyCardDto> myBuddies(User user);
    List<BuddyConnectionRequestDto> incomingRequests(User user);
    List<BuddyConnectionRequestDto> outgoingRequests(User user);
    BuddyConnectionRequestDto connect(User user, String otherUsername);
    BuddyConnectionRequestDto acceptRequest(User user, Long requestId);
    BuddyConnectionRequestDto declineRequest(User user, Long requestId);
    List<BuddySessionDto> sessions(User user, Long buddyId);
    BuddySessionDto createSession(User user, Long buddyId, CreateBuddySessionRequest request);
    List<BuddyMessageDto> messages(User user, Long buddyId);
    BuddyMessageDto sendMessage(User user, Long buddyId, SendBuddyMessageRequest request);
}
