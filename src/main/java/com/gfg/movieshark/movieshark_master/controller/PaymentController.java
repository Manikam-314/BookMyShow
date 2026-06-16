package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.PaymentRequest;
import com.gfg.movieshark.movieshark_master.resource.PaymentResponse;
import com.gfg.movieshark.movieshark_master.resource.PaymentVerificationRequest;
import com.gfg.movieshark.movieshark_master.resource.TicketResource;
import com.gfg.movieshark.movieshark_master.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse> createOrder(@RequestBody PaymentRequest request) {
        try {
            PaymentResponse response = paymentService.createOrder(request.getAmount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Razorpay Order Creation Failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<TicketResource> verifyPaymentAndBookTicket(@RequestBody PaymentVerificationRequest request) {
        try {
            TicketResource ticketResource = paymentService.verifyPaymentAndBook(request);
            return ResponseEntity.ok(ticketResource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
