package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.config.JwtUtil;
import com.gfg.movieshark.movieshark_master.domain.ShowSeat;
import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.enums.SeatStatus;
import com.gfg.movieshark.movieshark_master.repository.ShowSeatsRepository;
import com.gfg.movieshark.movieshark_master.repository.UserRepository;
import com.gfg.movieshark.movieshark_master.resource.SeatActionPayload;
import com.gfg.movieshark.movieshark_master.resource.ShowSeatsResource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatLockService {

    private final ShowSeatsRepository showSeatsRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;

    private static final long LOCK_TIMEOUT_MS = 120000; // 2 minutes

    @Transactional
    public void processSeatAction(SeatActionPayload payload) {
        String email = jwtUtil.extractEmail(payload.getToken());
        if (email == null) return;

        User user = userRepository.findTopByEmailOrderByIdDesc(email);
        if (user == null) return;

        Optional<ShowSeat> seatOpt = showSeatsRepository.findById(payload.getSeatId());
        if (seatOpt.isEmpty()) return;

        ShowSeat seat = seatOpt.get();

        // Ensure the seat belongs to the given show
        if (!seat.getShow().getId().equals(payload.getShowId())) {
            return;
        }

        if ("LOCK".equalsIgnoreCase(payload.getAction())) {
            if (seat.getSeatStatus() == SeatStatus.AVAILABLE || 
                (seat.getSeatStatus() == SeatStatus.LOCKED && seat.getLockedBy().getId().equals(user.getId()))) {
                
                seat.setSeatStatus(SeatStatus.LOCKED);
                seat.setLockedBy(user);
                seat.setLockExpiresAt(new Date(System.currentTimeMillis() + LOCK_TIMEOUT_MS));
                showSeatsRepository.save(seat);
                
                broadcast(seat);
            }
        } else if ("UNLOCK".equalsIgnoreCase(payload.getAction())) {
            if (seat.getSeatStatus() == SeatStatus.LOCKED && seat.getLockedBy().getId().equals(user.getId())) {
                unlockSeat(seat);
            }
        }
    }

    private void unlockSeat(ShowSeat seat) {
        seat.setSeatStatus(SeatStatus.AVAILABLE);
        seat.setLockedBy(null);
        seat.setLockExpiresAt(null);
        showSeatsRepository.save(seat);
        broadcast(seat);
    }

    private void broadcast(ShowSeat seat) {
        ShowSeatsResource resource = ShowSeat.toResource(seat);
        messagingTemplate.convertAndSend("/topic/seats/" + seat.getShow().getId(), resource);
    }

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void releaseExpiredLocks() {
        log.info("Running expired seat locks cleanup...");
        List<ShowSeat> expiredSeats = showSeatsRepository.findBySeatStatusAndLockExpiresAtBefore(SeatStatus.LOCKED, new Date());
        for (ShowSeat seat : expiredSeats) {
            log.info("Releasing expired lock for seat: {}", seat.getId());
            unlockSeat(seat);
        }
    }
}
