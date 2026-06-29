package mk.ukim.finki.timski.coudy.service.domain.impl;

import mk.ukim.finki.timski.coudy.dto.BuddyMessageDto;
import mk.ukim.finki.timski.coudy.dto.BuddyConnectionRequestDto;
import mk.ukim.finki.timski.coudy.dto.BuddyNotificationDto;
import mk.ukim.finki.timski.coudy.dto.BuddySessionDto;
import mk.ukim.finki.timski.coudy.dto.CreateBuddySessionRequest;
import mk.ukim.finki.timski.coudy.dto.SendBuddyMessageRequest;
import mk.ukim.finki.timski.coudy.dto.StudyBuddyCardDto;
import mk.ukim.finki.timski.coudy.model.domain.BuddyConnectionRequest;
import mk.ukim.finki.timski.coudy.model.domain.BuddyMessage;
import mk.ukim.finki.timski.coudy.model.domain.BuddySession;
import mk.ukim.finki.timski.coudy.model.domain.Course;
import mk.ukim.finki.timski.coudy.model.domain.StudyBuddy;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyRequestStatus;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyNotificationType;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyStatus;
import mk.ukim.finki.timski.coudy.model.enumerations.SessionStatus;
import mk.ukim.finki.timski.coudy.repository.BuddyConnectionRequestRepository;
import mk.ukim.finki.timski.coudy.repository.BuddyMessageRepository;
import mk.ukim.finki.timski.coudy.repository.BuddySessionRepository;
import mk.ukim.finki.timski.coudy.repository.CourseRepository;
import mk.ukim.finki.timski.coudy.repository.StudyBuddyRepository;
import mk.ukim.finki.timski.coudy.repository.UserRepository;
import mk.ukim.finki.timski.coudy.service.domain.StudyBuddyService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudyBuddyServiceImpl implements StudyBuddyService {
    private final StudyBuddyRepository studyBuddyRepository;
    private final BuddyConnectionRequestRepository buddyConnectionRequestRepository;
    private final BuddySessionRepository buddySessionRepository;
    private final BuddyMessageRepository buddyMessageRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public StudyBuddyServiceImpl(
            StudyBuddyRepository studyBuddyRepository,
            BuddyConnectionRequestRepository buddyConnectionRequestRepository,
            BuddySessionRepository buddySessionRepository,
            BuddyMessageRepository buddyMessageRepository,
            UserRepository userRepository,
            CourseRepository courseRepository
    ) {
        this.studyBuddyRepository = studyBuddyRepository;
        this.buddyConnectionRequestRepository = buddyConnectionRequestRepository;
        this.buddySessionRepository = buddySessionRepository;
        this.buddyMessageRepository = buddyMessageRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public List<StudyBuddyCardDto> discover(User user) {
        Set<String> myCourseNames = courseNamesFor(user);
        List<StudyBuddy> existingBuddies = studyBuddyRepository.findAllForUserByStatus(user.getUsername(), BuddyStatus.ACTIVE);
        Set<String> existingUsernames = existingBuddies.stream()
                .map(b -> partnerUsername(b, user.getUsername()))
                .collect(Collectors.toSet());

        List<StudyBuddyCardDto> recommendations = new ArrayList<>();
        for (User candidate : userRepository.findAll()) {
            if (candidate.getUsername().equals(user.getUsername())
                    || existingUsernames.contains(candidate.getUsername())
                    || buddyConnectionRequestRepository.findPendingBetween(user.getUsername(), candidate.getUsername()).isPresent()) {
                continue;
            }

            Set<String> candidateCourses = courseNamesFor(candidate);
            List<String> sharedCourses = myCourseNames.stream()
                    .filter(candidateCourses::contains)
                    .sorted()
                    .toList();

            int score = calculateMatchScore(user, candidate, sharedCourses);
            recommendations.add(StudyBuddyCardDto.fromProfile(
                    candidate,
                    candidateCourses.stream().sorted().toList(),
                    score,
                    fallback(candidate.getStudyStyle(), deriveStudyStyle(sharedCourses.size())),
                    fallback(candidate.getAvailability(), deriveAvailability(sharedCourses.size())),
                    fallback(candidate.getBio(), deriveBio(candidate))
            ));
        }

        recommendations.sort(Comparator.comparing(StudyBuddyCardDto::matchScore).reversed());
        return recommendations;
    }

    @Override
    public List<StudyBuddyCardDto> myBuddies(User user) {
        List<StudyBuddyCardDto> cards = new ArrayList<>();
        for (StudyBuddy buddy : studyBuddyRepository.findAllForUserByStatus(user.getUsername(), BuddyStatus.ACTIVE)) {
            User partner = buddy.getUser1().getUsername().equals(user.getUsername()) ? buddy.getUser2() : buddy.getUser1();
            List<String> partnerCourses = courseNamesFor(partner).stream().sorted().toList();
            BuddySession nextSession = buddySessionRepository.findByStudyBuddyIdOrderByScheduledTimeDesc(buddy.getId())
                    .stream()
                    .filter(session -> session.getStatus() != SessionStatus.CANCELLED)
                    .filter(session -> session.getScheduledTime() == null || session.getScheduledTime().isAfter(LocalDateTime.now().minusMinutes(1)))
                    .sorted(Comparator.comparing(BuddySession::getScheduledTime, Comparator.nullsLast(Comparator.naturalOrder())))
                    .findFirst()
                    .orElse(null);
            int unreadMessageCount = Math.toIntExact(buddyMessageRepository.countUnreadForBuddy(user.getUsername(), buddy.getId()));
            int unreadSessionCount = Math.toIntExact(buddySessionRepository.countUnreadForBuddy(user.getUsername(), buddy.getId()));

            cards.add(StudyBuddyCardDto.fromBuddy(
                    buddy,
                    partner,
                    partnerCourses,
                    nextSession != null ? nextSession.getScheduledTime() : null,
                    nextSession != null ? nextSession.getLocation() : null,
                    unreadMessageCount + unreadSessionCount,
                    unreadMessageCount,
                    unreadSessionCount
            ));
        }
        return cards;
    }

    @Override
    public List<BuddyConnectionRequestDto> incomingRequests(User user) {
        return buddyConnectionRequestRepository.findIncoming(user.getUsername(), BuddyRequestStatus.PENDING)
                .stream()
                .map(BuddyConnectionRequestDto::from)
                .toList();
    }

    @Override
    public List<BuddyConnectionRequestDto> outgoingRequests(User user) {
        return buddyConnectionRequestRepository.findOutgoing(user.getUsername())
                .stream()
                .map(BuddyConnectionRequestDto::from)
                .toList();
    }

    @Override
    public List<BuddyNotificationDto> notifications(User user) {
        List<BuddyNotificationDto> notifications = new ArrayList<>();

        buddyConnectionRequestRepository.findUnreadIncoming(user.getUsername(), BuddyRequestStatus.PENDING)
                .forEach(request -> notifications.add(new BuddyNotificationDto(
                        BuddyNotificationType.CONNECTION_REQUEST,
                        request.getId(),
                        null,
                        null,
                        request.getSender() != null ? request.getSender().getUsername() : null,
                        request.getSender() != null ? request.getSender().getName() : null,
                        request.getSender() != null ? request.getSender().getSurname() : null,
                        "Connection request",
                        request.getMessage(),
                        request.getCreatedAt()
                )));

        buddyMessageRepository.findUnreadForUser(user.getUsername())
                .forEach(message -> notifications.add(new BuddyNotificationDto(
                        BuddyNotificationType.MESSAGE,
                        null,
                        message.getStudyBuddy() != null ? message.getStudyBuddy().getId() : null,
                        null,
                        message.getSender() != null ? message.getSender().getUsername() : null,
                        message.getSender() != null ? message.getSender().getName() : null,
                        message.getSender() != null ? message.getSender().getSurname() : null,
                        "New message",
                        message.getContent(),
                        message.getSentAt()
                )));

        buddySessionRepository.findUnreadForUser(user.getUsername())
                .forEach(session -> notifications.add(new BuddyNotificationDto(
                        BuddyNotificationType.SESSION,
                        null,
                        session.getStudyBuddy() != null ? session.getStudyBuddy().getId() : null,
                        session.getId(),
                        session.getCreatedBy() != null ? session.getCreatedBy().getUsername() : null,
                        session.getCreatedBy() != null ? session.getCreatedBy().getName() : null,
                        session.getCreatedBy() != null ? session.getCreatedBy().getSurname() : null,
                        "Study session scheduled",
                        session.getLocation() != null
                                ? session.getLocation()
                                : "A study session was created.",
                        session.getCreatedAt()
                )));

        notifications.sort(Comparator.comparing(BuddyNotificationDto::createdAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return notifications;
    }

    @Override
    public long unreadNotificationCount(User user) {
        return buddyConnectionRequestRepository.countUnreadIncoming(user.getUsername(), BuddyRequestStatus.PENDING)
                + buddyMessageRepository.countUnreadForUser(user.getUsername())
                + buddySessionRepository.countUnreadForUser(user.getUsername());
    }

    @Override
    @Transactional
    public void markNotificationsRead(User user) {
        buddyConnectionRequestRepository.markUnreadIncomingAsRead(
                user.getUsername(),
                BuddyRequestStatus.PENDING,
                LocalDateTime.now()
        );
        buddyMessageRepository.markUnreadForUserAsRead(user.getUsername(), LocalDateTime.now());
        buddySessionRepository.markUnreadForUserAsRead(user.getUsername(), LocalDateTime.now());
    }

    @Override
    public BuddyConnectionRequestDto connect(User user, String otherUsername) {
        if (otherUsername == null || otherUsername.isBlank() || otherUsername.equals(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid buddy username");
        }

        User otherUser = userRepository.findByUsername(otherUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        StudyBuddy existingBuddy = studyBuddyRepository.findPair(user.getUsername(), otherUsername)
                .orElse(null);
        if (existingBuddy != null) {
            if (existingBuddy.getStatus() == BuddyStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already connected");
            }

            existingBuddy.setStatus(BuddyStatus.ACTIVE);
            studyBuddyRepository.save(existingBuddy);

            BuddyConnectionRequest acceptedRequest = buddyConnectionRequestRepository
                    .findBetween(user.getUsername(), otherUsername, BuddyRequestStatus.ACCEPTED)
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (acceptedRequest != null) {
                return BuddyConnectionRequestDto.from(acceptedRequest);
            }

            BuddyConnectionRequest fallbackRequest = new BuddyConnectionRequest();
            fallbackRequest.setSender(user);
            fallbackRequest.setReceiver(otherUser);
            fallbackRequest.setStatus(BuddyRequestStatus.ACCEPTED);
            fallbackRequest.setCreatedAt(existingBuddy.getMatchedAt() != null ? existingBuddy.getMatchedAt() : LocalDateTime.now());
            fallbackRequest.setRespondedAt(LocalDateTime.now());
            fallbackRequest.setReadAt(LocalDateTime.now());
            fallbackRequest.setMessage("Study buddy connection restored");
            return BuddyConnectionRequestDto.from(buddyConnectionRequestRepository.save(fallbackRequest));
        }

        buddyConnectionRequestRepository.findPendingBetween(user.getUsername(), otherUsername)
                .ifPresent(existingRequest -> {
                    if (existingRequest.getSender().getUsername().equals(user.getUsername())) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Connection request already sent");
                    }
                });

        BuddyConnectionRequest incomingRequest = buddyConnectionRequestRepository.findPendingBetween(otherUsername, user.getUsername())
                .filter(request -> request.getReceiver().getUsername().equals(user.getUsername()))
                .orElse(null);

        if (incomingRequest != null) {
            return acceptRequest(user, incomingRequest.getId());
        }

        BuddyConnectionRequest request = new BuddyConnectionRequest();
        request.setSender(user);
        request.setReceiver(otherUser);
        request.setStatus(BuddyRequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setMessage(user.getName() != null && otherUser.getName() != null
                ? "Let's study together sometime."
                : "Study buddy request");
        return BuddyConnectionRequestDto.from(buddyConnectionRequestRepository.save(request));
    }

    @Override
    public BuddyConnectionRequestDto acceptRequest(User user, Long requestId) {
        BuddyConnectionRequest request = buddyConnectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!request.getReceiver().getUsername().equals(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot accept this request");
        }
        if (request.getStatus() != BuddyRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request is no longer pending");
        }

        createOrActivateBuddy(request.getSender(), request.getReceiver());
        request.setStatus(BuddyRequestStatus.ACCEPTED);
        request.setRespondedAt(LocalDateTime.now());
        return BuddyConnectionRequestDto.from(buddyConnectionRequestRepository.save(request));
    }

    @Override
    public BuddyConnectionRequestDto declineRequest(User user, Long requestId) {
        BuddyConnectionRequest request = buddyConnectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!request.getReceiver().getUsername().equals(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot decline this request");
        }
        if (request.getStatus() != BuddyRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request is no longer pending");
        }

        request.setStatus(BuddyRequestStatus.DECLINED);
        request.setRespondedAt(LocalDateTime.now());
        return BuddyConnectionRequestDto.from(buddyConnectionRequestRepository.save(request));
    }

    @Override
    @Transactional
    public void removeBuddy(User user, Long buddyId) {
        StudyBuddy buddy = findOwnedBuddy(buddyId, user);
        buddy.setStatus(BuddyStatus.INACTIVE);
        studyBuddyRepository.save(buddy);
    }

    @Override
    public List<BuddySessionDto> sessions(User user, Long buddyId) {
        StudyBuddy buddy = findOwnedBuddy(buddyId, user);
        return buddySessionRepository.findByStudyBuddyIdOrderByScheduledTimeDesc(buddy.getId())
                .stream()
                .map(BuddySessionDto::from)
                .toList();
    }

    @Override
    @Transactional
    public void markBuddyMessagesRead(User user, Long buddyId) {
        StudyBuddy buddy = findOwnedBuddy(buddyId, user);
        buddyMessageRepository.markUnreadForBuddyAsRead(user.getUsername(), buddy.getId(), LocalDateTime.now());
        buddySessionRepository.markUnreadForBuddyAsRead(user.getUsername(), buddy.getId(), LocalDateTime.now());
    }

    @Override
    public BuddySessionDto createSession(User user, Long buddyId, CreateBuddySessionRequest request) {
        StudyBuddy buddy = findOwnedBuddy(buddyId, user);
        BuddySession session = new BuddySession();
        session.setStudyBuddy(buddy);
        session.setScheduledTime(request.scheduledTime() != null ? request.scheduledTime() : LocalDateTime.now());
        session.setLocation(request.location());
        session.setDurationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 60);
        session.setAttendedUser1(false);
        session.setAttendedUser2(false);
        session.setStatus(SessionStatus.SCHEDULED);
        session.setNotes(request.notes());
        session.setCreatedBy(user);
        session.setCreatedAt(LocalDateTime.now());
        session.setReadAt(null);

        BuddySession saved = buddySessionRepository.save(session);
        buddy.setSessionCount((buddy.getSessionCount() == null ? 0 : buddy.getSessionCount()) + 1);
        studyBuddyRepository.save(buddy);
        return BuddySessionDto.from(saved);
    }

    @Override
    @Transactional
    public List<BuddyMessageDto> messages(User user, Long buddyId) {
        markBuddyMessagesRead(user, buddyId);
        findOwnedBuddy(buddyId, user);
        return buddyMessageRepository.findByStudyBuddyIdOrderBySentAtAsc(buddyId)
                .stream()
                .map(BuddyMessageDto::from)
                .toList();
    }

    @Override
    public BuddyMessageDto sendMessage(User user, Long buddyId, SendBuddyMessageRequest request) {
        StudyBuddy buddy = findOwnedBuddy(buddyId, user);
        if (request == null || request.content() == null || request.content().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content is required");
        }

        BuddyMessage message = new BuddyMessage();
        message.setStudyBuddy(buddy);
        message.setSender(user);
        message.setContent(request.content().trim());
        message.setSentAt(LocalDateTime.now());
        return BuddyMessageDto.from(buddyMessageRepository.save(message));
    }

    private StudyBuddy findOwnedBuddy(Long buddyId, User user) {
        StudyBuddy buddy = studyBuddyRepository.findById(buddyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buddy not found"));

        if (!isMember(buddy, user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this buddy");
        }
        return buddy;
    }

    private StudyBuddy createOrActivateBuddy(User left, User right) {
        StudyBuddy buddy = studyBuddyRepository.findPair(left.getUsername(), right.getUsername()).orElseGet(() -> {
            StudyBuddy created = new StudyBuddy();
            created.setUser1(left.getUsername().compareTo(right.getUsername()) <= 0 ? left : right);
            created.setUser2(left.getUsername().compareTo(right.getUsername()) <= 0 ? right : left);
            created.setMatchScore(calculateMatchScore(left, right, intersection(courseNamesFor(left), courseNamesFor(right))));
            created.setStatus(BuddyStatus.ACTIVE);
            created.setMatchedAt(LocalDateTime.now());
            created.setSessionCount(0);
            return created;
        });

        if (buddy.getStatus() == null || buddy.getStatus() != BuddyStatus.ACTIVE) {
            buddy.setStatus(BuddyStatus.ACTIVE);
        }
        if (buddy.getMatchedAt() == null) {
            buddy.setMatchedAt(LocalDateTime.now());
        }
        if (buddy.getSessionCount() == null) {
            buddy.setSessionCount(0);
        }
        return studyBuddyRepository.save(buddy);
    }

    private boolean isMember(StudyBuddy buddy, String username) {
        return buddy.getUser1().getUsername().equals(username) || buddy.getUser2().getUsername().equals(username);
    }

    private String partnerUsername(StudyBuddy buddy, String username) {
        return buddy.getUser1().getUsername().equals(username)
                ? buddy.getUser2().getUsername()
                : buddy.getUser1().getUsername();
    }

    private Set<String> courseNamesFor(User user) {
        return courseRepository.findAllByUser(user).stream()
                .map(Course::getName)
                .filter(name -> name != null && !name.isBlank())
                .collect(Collectors.toSet());
    }

    private List<String> intersection(Set<String> a, Set<String> b) {
        return a.stream().filter(b::contains).sorted().toList();
    }

    private int calculateMatchScore(User left, User right, List<String> sharedCourses) {
        int score = 40 + sharedCourses.size() * 12;
        if (left.getMajor() != null && left.getMajor().equalsIgnoreCase(right.getMajor())) {
            score += 12;
        }
        if (left.getStudyStyle() != null && left.getStudyStyle().equalsIgnoreCase(right.getStudyStyle())) {
            score += 8;
        }
        if (left.getAvailability() != null && left.getAvailability().equalsIgnoreCase(right.getAvailability())) {
            score += 6;
        }
        return Math.min(score, 99);
    }

    private String deriveStudyStyle(int sharedCount) {
        return sharedCount >= 2 ? "Discussion" : "Problem Solving";
    }

    private String deriveAvailability(int sharedCount) {
        return sharedCount >= 2 ? "Evenings" : "Afternoons";
    }

    private String deriveBio(User user) {
        String major = user.getMajor() != null ? user.getMajor() : "a subject";
        return "Looking for study partners in " + major + ".";
    }

    private String fallback(String value, String derived) {
        return value != null && !value.isBlank() ? value : derived;
    }
}
