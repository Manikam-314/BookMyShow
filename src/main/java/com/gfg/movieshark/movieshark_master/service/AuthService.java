package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.config.JwtUtil;
import com.gfg.movieshark.movieshark_master.domain.TheatreApplication;
import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.enums.Role;
import com.gfg.movieshark.movieshark_master.enums.TheatreStatus;
import com.gfg.movieshark.movieshark_master.repository.TheatreApplicationRepository;
import com.gfg.movieshark.movieshark_master.repository.UserRepository;
import com.gfg.movieshark.movieshark_master.resource.AuthRequest;
import com.gfg.movieshark.movieshark_master.resource.AuthResponse;
import com.gfg.movieshark.movieshark_master.resource.TheatreRegisterRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TheatreApplicationRepository theatreApplicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    /**
     * Registers a new regular user account (Role.USER).
     */
    @Transactional
    public AuthResponse registerUser(String name, String email, String phone, String password, String otp) {
        if (!otpService.verifyOtp(email, otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .mobile(phone)
                .password(passwordEncoder.encode(password))
                .role(Role.USER)
                .build();
        final User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved);
        return AuthResponse.builder()
                .token(token)
                .role(saved.getRole().name())
                .email(saved.getEmail())
                .name(saved.getName())
                .userId(saved.getId())
                .build();
    }

    /**
     * Authenticates a user by email + password, returns a JWT token.
     */
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findTopByEmailOrderByIdDesc(request.getEmail());

        if (user == null) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .email(user.getEmail())
                .name(user.getName())
                .userId(user.getId())
                .build();
    }

    /**
     * Registers a new theatre owner: creates a User (THEATRE_OWNER role) +
     * TheatreApplication (PENDING).
     */
    @Transactional
    public AuthResponse registerTheatreOwner(TheatreRegisterRequest request) {
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        if (theatreApplicationRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Theatre application already submitted for this email");
        }

        // Create User account
        User user = User.builder()
                .name(request.getOwnerName())
                .email(request.getEmail())
                .mobile(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.THEATRE_OWNER)
                .build();
        userRepository.save(user);

        // Create TheatreApplication (PENDING)
        TheatreApplication application = TheatreApplication.builder()
                .theatreName(request.getTheatreName())
                .ownerName(request.getOwnerName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .city(request.getCity())
                .address(request.getAddress())
                .screensCount(request.getScreensCount())
                .verificationDocUrl(request.getVerificationDocUrl())
                .status(TheatreStatus.PENDING)
                .owner(user)
                .build();
        theatreApplicationRepository.save(application);

        log.info("Theatre registration submitted: {} ({})", request.getTheatreName(), request.getEmail());

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .email(user.getEmail())
                .name(user.getName())
                .userId(user.getId())
                .build();
    }
}
