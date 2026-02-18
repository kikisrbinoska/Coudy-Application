package mk.ukim.finki.timski.coudy.service.application;

import mk.ukim.finki.timski.coudy.dto.CreateUserDto;
import mk.ukim.finki.timski.coudy.dto.DisplayUserDto;
import mk.ukim.finki.timski.coudy.dto.LoginResponseDto;
import mk.ukim.finki.timski.coudy.dto.LoginUserDto;

import java.util.Optional;

public interface UserApplicationService {

    Optional<DisplayUserDto> register(CreateUserDto createUserDto);

    Optional<LoginResponseDto> login(LoginUserDto loginUserDto);

    Optional<DisplayUserDto> findByUsername(String username);
}

