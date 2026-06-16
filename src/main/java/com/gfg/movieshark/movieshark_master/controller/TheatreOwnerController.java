package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.domain.Theater;
import com.gfg.movieshark.movieshark_master.enums.TheatreStatus;
import com.gfg.movieshark.movieshark_master.resource.TheatreApplicationResponse;
import com.gfg.movieshark.movieshark_master.service.TheatreOwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/theatre-owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('THEATRE_OWNER')")
public class TheatreOwnerController {

    private final TheatreOwnerService theatreOwnerService;

    /**
     * GET /theatre-owner/status
     * Returns the current application status for the logged-in theatre owner.
     */
    @GetMapping("/status")
    public ResponseEntity<TheatreApplicationResponse> getStatus() {
        return ResponseEntity.ok(theatreOwnerService.getMyApplication());
    }

    /**
     * GET /theatre-owner/my-theatre
     * Returns the Theater entity (id, name, city, etc.) for this owner.
     * Auto-creates the Theater entity if the application is APPROVED but the entity
     * is missing.
     */
    @GetMapping("/my-theatre")
    public ResponseEntity<?> getMyTheatre() {
        try {
            Theater theatre = theatreOwnerService.getMyTheater();
            return ResponseEntity.ok(theatre);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(
                    Collections.singletonMap("message", "Theatre entity not found. It may not have been set up yet."));
        }
    }

    /**
     * GET /theatre-owner/dashboard
     * Returns dashboard data — 403 with message if not APPROVED.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        TheatreApplicationResponse app = theatreOwnerService.getMyApplication();

        if (app.getStatus() != TheatreStatus.APPROVED) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Your theatre is under verification. Current status: " + app.getStatus());
            error.put("status", app.getStatus());
            return ResponseEntity.status(403).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome! Your theatre is approved.");
        response.put("theatre", app);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-my-theatre")
    public ResponseEntity<com.gfg.movieshark.movieshark_master.resource.TheaterResource> updateMyTheatre(
            @org.springframework.web.bind.annotation.RequestBody com.gfg.movieshark.movieshark_master.resource.TheaterResource theaterResource) {
        return ResponseEntity.ok(theatreOwnerService.updateMyTheater(theaterResource));
    }
}
