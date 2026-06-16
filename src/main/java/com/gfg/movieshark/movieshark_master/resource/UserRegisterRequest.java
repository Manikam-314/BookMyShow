package com.gfg.movieshark.movieshark_master.resource;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number")
    private String phone;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "OTP is required")
    private String otp;
}
