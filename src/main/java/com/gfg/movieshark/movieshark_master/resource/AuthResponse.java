package com.gfg.movieshark.movieshark_master.resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private String email;
    private String name;
    private Long userId;
}
