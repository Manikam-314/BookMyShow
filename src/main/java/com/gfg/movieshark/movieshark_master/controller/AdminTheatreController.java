package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.enums.TheatreStatus;
import com.gfg.movieshark.movieshark_master.resource.AuditLogResponse;
import com.gfg.movieshark.movieshark_master.resource.TheatreApplicationResponse;
import com.gfg.movieshark.movieshark_master.service.AdminTheatreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTheatreController {

    private final AdminTheatreService adminTheatreService;

    /**
     * GET /admin/theatres?status=PENDING
     * Returns all theatre applications, optionally filtered by status.
     */
    @GetMapping("/theatres")
    public ResponseEntity<List<TheatreApplicationResponse>> getAllTheatres(
            @RequestParam(required = false) TheatreStatus status,
            Authentication auth) {
        log.info("Fetching admin theatres. Current user: {}, Authorities: {}",
                auth != null ? auth.getName() : "anonymous",
                auth != null ? auth.getAuthorities() : "none");
        return ResponseEntity.ok(adminTheatreService.getAllApplications(status));
    }

    /**
     * GET /admin/theatres/{id}
     * Returns a single theatre application by ID.
     */
    @GetMapping("/theatres/{id}")
    public ResponseEntity<List<TheatreApplicationResponse>> getSingleTheatre(@PathVariable Long id) {
        // Fetch all and filter — simple approach
        return ResponseEntity.ok(
                adminTheatreService.getAllApplications(null)
                        .stream()
                        .filter(a -> a.getId().equals(id))
                        .toList());
    }

    /**
     * PUT /admin/theatre/{id}/approve
     */
    @PutMapping("/theatre/{id}/approve")
    public ResponseEntity<TheatreApplicationResponse> approve(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(adminTheatreService.approve(id, auth.getName()));
    }

    /**
     * PUT /admin/theatre/{id}/reject
     * Body: { "reason": "..." }
     */
    @PutMapping("/theatre/{id}/reject")
    public ResponseEntity<TheatreApplicationResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        String reason = (body != null) ? body.getOrDefault("reason", "No reason provided") : "No reason provided";
        return ResponseEntity.ok(adminTheatreService.reject(id, auth.getName(), reason));
    }

    /**
     * PUT /admin/theatre/{id}/suspend
     * Body: { "reason": "..." }
     */
    @PutMapping("/theatre/{id}/suspend")
    public ResponseEntity<TheatreApplicationResponse> suspend(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        String reason = (body != null) ? body.getOrDefault("reason", "No reason provided") : "No reason provided";
        return ResponseEntity.ok(adminTheatreService.suspend(id, auth.getName(), reason));
    }

    /**
     * GET /admin/audit-logs
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs() {
        return ResponseEntity.ok(adminTheatreService.getAuditLogs());
    }
}
