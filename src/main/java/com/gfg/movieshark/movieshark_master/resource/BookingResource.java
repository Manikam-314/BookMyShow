package com.gfg.movieshark.movieshark_master.resource;

import com.gfg.movieshark.movieshark_master.enums.SeatType;
import lombok.*;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BookingResource {

    @NotEmpty
    private Set<String> seatsNumbers;

    @Min(1)
    private long userId;

    @Min(1)
    private long showId;

    @NotNull
    private SeatType seatType;
}
