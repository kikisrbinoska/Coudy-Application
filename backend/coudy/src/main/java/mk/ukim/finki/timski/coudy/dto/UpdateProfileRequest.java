package mk.ukim.finki.timski.coudy.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String surname;
    private String bio;
    private String major;
    private String year;
}
