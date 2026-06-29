package mk.ukim.finki.timski.coudy.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import mk.ukim.finki.timski.coudy.model.domain.User;
import mk.ukim.finki.timski.coudy.model.enumerations.Role;

public record CreateUserDto(
        String username,
        String password,
        @JsonAlias("repeatPassword")
        String repeatPassword,
        String name,
        String surname,
        Role role
) {

    public User toUser() {
        return new User(username, password, name, surname);
    }
}
