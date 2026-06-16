package com.gfg.movieshark.movieshark_master.resource;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TheatreRegisterRequest {

    @NotBlank(message = "Theatre name is required")
    private String theatreName;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String phone;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Address is required")
    private String address;

    @Min(value = 1, message = "At least 1 screen is required")
    @Max(value = 50, message = "Cannot exceed 50 screens")
    private Integer screensCount;

    private String verificationDocUrl;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "OTP is required")
    private String otp;
}
