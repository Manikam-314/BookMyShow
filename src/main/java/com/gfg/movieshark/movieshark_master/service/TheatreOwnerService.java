package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.domain.Theater;
import com.gfg.movieshark.movieshark_master.domain.TheatreApplication;
import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.repository.TheaterRepository;
import com.gfg.movieshark.movieshark_master.repository.TheatreApplicationRepository;
import com.gfg.movieshark.movieshark_master.repository.UserRepository;
import com.gfg.movieshark.movieshark_master.resource.TheatreApplicationResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TheatreOwnerService {

    private final TheatreApplicationRepository theatreApplicationRepository;
    private final UserRepository userRepository;
    private final TheaterRepository theaterRepository;

    /**
     * Returns the theatre application for the currently authenticated theatre
     * owner.
     */
    public TheatreApplicationResponse getMyApplication() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findTopByEmailOrderByIdDesc(email);
        if (user == null) {
            throw new EntityNotFoundException("User not found");
        }
        List<TheatreApplication> apps = theatreApplicationRepository.findByOwner_Id(user.getId());
        if (apps.isEmpty()) {
            throw new EntityNotFoundException("No theatre application found for this account");
        }
        TheatreApplication app = apps.get(0);
        return toResponse(app);
    }

    /**
     * Returns the actual Theater entity matching the owner's registered theatre
     * name.
     * If the application is APPROVED but the Theater entity was never created
     * (e.g. approved before auto-creation was added), creates it on-the-fly.
     */
    public Theater getMyTheater() {
        TheatreApplicationResponse app = getMyApplication();

        Optional<Theater> existing = theaterRepository.findFirstByNameIgnoreCase(app.getTheatreName());
        if (existing.isPresent()) {
            return existing.get();
        }

        // Not found — if APPROVED, auto-create it now (retro-active fix)
        if (app.getStatus().name().equals("APPROVED")) {
            Theater created = Theater.builder()
                    .name(app.getTheatreName())
                    .city(app.getCity() != null ? app.getCity() : "")
                    .address(app.getAddress() != null ? app.getAddress() : "")
                    .totalRows(10)
                    .totalColumns(15)
                    .build();
            return theaterRepository.save(created);
        }

        throw new jakarta.persistence.EntityNotFoundException(
                "Theatre entity not found for application: " + app.getTheatreName());
    }

    private final TheaterService theaterService;

    public com.gfg.movieshark.movieshark_master.resource.TheaterResource updateMyTheater(
            com.gfg.movieshark.movieshark_master.resource.TheaterResource theaterResource) {
        Theater theatre = getMyTheater();
        return theaterService.updateTheater(theatre.getId(), theaterResource);
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
