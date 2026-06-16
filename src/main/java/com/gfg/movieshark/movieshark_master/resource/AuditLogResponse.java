package com.gfg.movieshark.movieshark_master.resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String adminEmail;
    private String action;
    private String targetType;
    private Long targetId;
    private String notes;
    private LocalDateTime createdAt;
}
