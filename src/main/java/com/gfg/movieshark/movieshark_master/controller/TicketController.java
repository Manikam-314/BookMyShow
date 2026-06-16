package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.BookingResource;
import com.gfg.movieshark.movieshark_master.resource.TicketResource;
import com.gfg.movieshark.movieshark_master.service.TicketService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/ticket")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/book")
    public ResponseEntity<?> bookTicket(@RequestBody BookingResource bookingResource) {
        try {
            log.info("Received Request to book ticket: " + bookingResource);
            return ResponseEntity.ok(ticketService.bookTicket(bookingResource));
        } catch (Exception e) {
            log.error("Error booking ticket", e);
            e.printStackTrace(); // Ensure it prints to stdout
            return ResponseEntity.internalServerError().body("Error booking ticket: " + e.getMessage());
        }
    }

    @GetMapping("{id}")
    public ResponseEntity<TicketResource> getTicket(
            @PathVariable(name = "id") @Min(value = 1, message = "Ticket Id Cannot be -ve") long id) {

        log.info("Received Request to get ticket: " + id);

        return ResponseEntity.ok(ticketService.getTicket(id));
    }
}