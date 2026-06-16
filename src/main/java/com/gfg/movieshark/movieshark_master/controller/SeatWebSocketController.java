package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.SeatActionPayload;
import com.gfg.movieshark.movieshark_master.service.SeatLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SeatWebSocketController {

    private final SeatLockService seatLockService;

    @MessageMapping("/seats.toggle")
    public void toggleSeat(@Payload SeatActionPayload payload) {
        seatLockService.processSeatAction(payload);
    }
}
