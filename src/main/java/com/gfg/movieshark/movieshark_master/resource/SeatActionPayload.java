package com.gfg.movieshark.movieshark_master.resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatActionPayload {
    private Long showId;
    private Long seatId;
    private String action; // "LOCK" or "UNLOCK"
    private String token; // Optional if we extract it from interceptor, but let's pass it for simplicity from Frontend
}
