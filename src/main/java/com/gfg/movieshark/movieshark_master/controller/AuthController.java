package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.*;
import com.gfg.movieshark.movieshark_master.service.AuthService;
import com.gfg.movieshark.movieshark_master.service.NotificationService;
import com.gfg.movieshark.movieshark_master.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final NotificationService notificationService;

    /** POST /auth/login — returns JWT + role */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** POST /auth/register — creates a regular USER account */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerUser(request.getName(), request.getEmail(),
                        request.getPhone(), request.getPassword(), request.getOtp()));
    }

    /** POST /auth/register-theatre — creates THEATRE_OWNER + TheatreApplication */
    @PostMapping("/register-theatre")
    public ResponseEntity<AuthResponse> registerTheatre(@Valid @RequestBody TheatreRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerTheatreOwner(request));
    }

    /** POST /auth/request-otp — sends OTP to email */
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestParam String email) {
        String otp = otpService.generateOtp(email);
        notificationService.sendOtpEmail(email, otp);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + email));
    }

    /** GET /auth/me — debug current roles */
    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return ResponseEntity.status(401).body("Not authenticated");
        Map<String, Object> response = new HashMap<>();
        response.put("name", auth.getName());
        response.put("authorities", auth.getAuthorities());
        response.put("principal", auth.getPrincipal());
        return ResponseEntity.ok(response);
    }
}
