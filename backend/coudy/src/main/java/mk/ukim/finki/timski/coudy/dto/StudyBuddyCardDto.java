package mk.ukim.finki.timski.coudy.dto;

import mk.ukim.finki.timski.coudy.model.domain.StudyBuddy;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.BuddyStatus;

import java.time.LocalDateTime;
import java.util.List;

public record StudyBuddyCardDto(
        Long id,
        String username,
        String name,
        String surname,
        String major,
        String year,
        List<String> courses,
        Integer matchScore,
        String studyStyle,
        String availability,
        String bio,
        BuddyStatus status,
        Integer sessionCount,
        Integer unreadCount,
        Integer unreadMessageCount,
        Integer unreadSessionCount,
        LocalDateTime matchedAt,
        LocalDateTime nextSessionAt,
        String nextSessionLocation
) {
    public static StudyBuddyCardDto fromProfile(
            User user,
            List<String> courses,
            Integer matchScore,
            String studyStyle,
            String availability,
            String bio
    ) {
        return new StudyBuddyCardDto(
                null,
                user.getUsername(),
                user.getName(),
                user.getSurname(),
                user.getMajor(),
                user.getYear(),
                courses,
                matchScore,
                studyStyle,
                availability,
                bio,
                null,
                null,
                0,
                0,
                0,
                null,
                null,
                null
        );
    }

    public static StudyBuddyCardDto fromBuddy(
            StudyBuddy buddy,
            User buddyUser,
            List<String> courses,
            LocalDateTime nextSessionAt,
            String nextSessionLocation,
            Integer unreadCount,
            Integer unreadMessageCount,
            Integer unreadSessionCount
    ) {
        return new StudyBuddyCardDto(
                buddy.getId(),
                buddyUser.getUsername(),
                buddyUser.getName(),
                buddyUser.getSurname(),
                buddyUser.getMajor(),
                buddyUser.getYear(),
                courses,
                buddy.getMatchScore(),
                buddyUser.getStudyStyle(),
                buddyUser.getAvailability(),
                buddyUser.getBio(),
                buddy.getStatus(),
                buddy.getSessionCount(),
                unreadCount,
                unreadMessageCount,
                unreadSessionCount,
                buddy.getMatchedAt(),
                nextSessionAt,
                nextSessionLocation
        );
    }
}
