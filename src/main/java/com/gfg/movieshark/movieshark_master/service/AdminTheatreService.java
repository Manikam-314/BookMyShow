package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.domain.AuditLog;
import com.gfg.movieshark.movieshark_master.domain.Theater;
import com.gfg.movieshark.movieshark_master.domain.TheatreApplication;
import com.gfg.movieshark.movieshark_master.enums.TheatreStatus;
import com.gfg.movieshark.movieshark_master.repository.AuditLogRepository;
import com.gfg.movieshark.movieshark_master.repository.TheaterRepository;
import com.gfg.movieshark.movieshark_master.repository.TheatreApplicationRepository;
import com.gfg.movieshark.movieshark_master.resource.AuditLogResponse;
import com.gfg.movieshark.movieshark_master.resource.TheatreApplicationResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminTheatreService {

    private final TheatreApplicationRepository theatreApplicationRepository;
    private final AuditLogRepository auditLogRepository;
    private final TheaterRepository theaterRepository;

    public List<TheatreApplicationResponse> getAllApplications(TheatreStatus status) {
        List<TheatreApplication> applications = (status != null)
                ? theatreApplicationRepository.findByStatus(status)
                : theatreApplicationRepository.findAll();
        return applications.stream().map(this::toResponse).toList();
    }

    @Transactional
    public TheatreApplicationResponse approve(Long id, String adminEmail) {
        TheatreApplication app = findById(id);
        app.setStatus(TheatreStatus.APPROVED);
        app.setRejectionReason(null);
        theatreApplicationRepository.save(app);

        // Auto-create the Theater entity if it doesn't already exist
        boolean theatreExists = theaterRepository.findFirstByNameIgnoreCase(app.getTheatreName()).isPresent();
        if (!theatreExists) {
            Theater newTheatre = Theater.builder()
                    .name(app.getTheatreName())
                    .city(app.getCity() != null ? app.getCity() : "")
                    .address(app.getAddress() != null ? app.getAddress() : "")
                    .totalRows(10)
                    .totalColumns(15)
                    .build();
            theaterRepository.save(newTheatre);
            log.info("Auto-created Theater entity '{}' for approved application {}", app.getTheatreName(), id);
        }

        logAction(adminEmail, "APPROVE", id, "Theatre approved");
        log.info("Admin {} approved theatre application {}", adminEmail, id);
        return toResponse(app);
    }

    @Transactional
    public TheatreApplicationResponse reject(Long id, String adminEmail, String reason) {
        TheatreApplication app = findById(id);
        app.setStatus(TheatreStatus.REJECTED);
        app.setRejectionReason(reason);
        theatreApplicationRepository.save(app);
        logAction(adminEmail, "REJECT", id, "Reason: " + reason);
        log.info("Admin {} rejected theatre application {}", adminEmail, id);
        return toResponse(app);
    }

    @Transactional
    public TheatreApplicationResponse suspend(Long id, String adminEmail, String reason) {
        TheatreApplication app = findById(id);
        app.setStatus(TheatreStatus.SUSPENDED);
        app.setRejectionReason(reason);
        theatreApplicationRepository.save(app);
        logAction(adminEmail, "SUSPEND", id, "Reason: " + reason);
        log.info("Admin {} suspended theatre application {}", adminEmail, id);
        return toResponse(app);
    }

    public List<AuditLogResponse> getAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(log -> AuditLogResponse.builder()
                        .id(log.getId())
                        .adminEmail(log.getAdminEmail())
                        .action(log.getAction())
                        .targetType(log.getTargetType())
                        .targetId(log.getTargetId())
                        .notes(log.getNotes())
                        .createdAt(log.getCreatedAt())
                        .build())
                .toList();
    }

    private TheatreApplication findById(Long id) {
        return theatreApplicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Theatre application not found: " + id));
    }

    private void logAction(String adminEmail, String action, Long targetId, String notes) {
        auditLogRepository.save(AuditLog.builder()
                .adminEmail(adminEmail)
                .action(action)
                .targetType("THEATRE_APPLICATION")
                .targetId(targetId)
                .notes(notes)
                .build());
    }

    private TheatreApplicationResponse toResponse(TheatreApplication app) {
        return TheatreApplicationResponse.builder()
                .id(app.getId())
                .theatreName(app.getTheatreName())
                .ownerName(app.getOwnerName())
                .email(app.getEmail())
                .phone(app.getPhone())
                .city(app.getCity())
                .address(app.getAddress())
                .screensCount(app.getScreensCount())
                .verificationDocUrl(app.getVerificationDocUrl())
                .status(app.getStatus())
                .rejectionReason(app.getRejectionReason())
                .ownerId(app.getOwner() != null ? app.getOwner().getId() : null)
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
