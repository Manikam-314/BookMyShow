package com.gfg.movieshark.movieshark_master.resource;

import com.gfg.movieshark.movieshark_master.enums.TheatreStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheatreApplicationResponse {
    private Long id;
    private String theatreName;
    private String ownerName;
    private String email;
    private String phone;
    private String city;
    private String address;
    private Integer screensCount;
    private String verificationDocUrl;
    private TheatreStatus status;
    private String rejectionReason;
    private Long ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
