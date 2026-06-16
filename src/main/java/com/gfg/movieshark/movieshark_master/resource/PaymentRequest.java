package com.gfg.movieshark.movieshark_master.resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private double amount;
    private BookingResource bookingResource; 
}
