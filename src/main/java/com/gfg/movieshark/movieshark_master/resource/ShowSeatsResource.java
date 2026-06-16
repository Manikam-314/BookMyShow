package com.gfg.movieshark.movieshark_master.resource;

import com.gfg.movieshark.movieshark_master.enums.SeatType;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
@ToString
public class ShowSeatsResource {
    private long id;
    private String seatNumber;
    private String row;
    private int number;
    private int rate;
    private SeatType seatType;
    private String status;
    private boolean booked;
    private Date bookedAt;
}
