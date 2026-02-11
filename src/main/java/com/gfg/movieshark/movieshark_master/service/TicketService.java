//package com.gfg.movieshark.movieshark_master.service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.gfg.movieshark.movieshark_master.domain.Show;
//import com.gfg.movieshark.movieshark_master.domain.ShowSeat;
//import com.gfg.movieshark.movieshark_master.domain.Ticket;
//import com.gfg.movieshark.movieshark_master.domain.User;
//import com.gfg.movieshark.movieshark_master.exception.NotFoundException;
//import com.gfg.movieshark.movieshark_master.repository.ShowRepository;
//import com.gfg.movieshark.movieshark_master.repository.TicketRepository;
//import com.gfg.movieshark.movieshark_master.repository.UserRepository;
//import com.gfg.movieshark.movieshark_master.resource.BookingResource;
//import com.gfg.movieshark.movieshark_master.resource.TicketResource;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.util.CollectionUtils;
//
//import jakarta.persistence.EntityNotFoundException;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//public class TicketService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private ShowRepository showRepository;
//
//    @Autowired
//    private TicketRepository ticketRepository;
//
//    ObjectMapper mapper = new ObjectMapper();
//
//    public TicketResource bookTicket(BookingResource bookingResource) {
//
//        Optional<User> optionalUser = userRepository.findById(bookingResource.getUserId());
//
//        if (optionalUser.isEmpty()) {
//            throw new NotFoundException("User Not Found with ID: " + bookingResource.getUserId() + " to book ticket");
//        }
//
//        Optional<Show> optionalShow = showRepository.findById(bookingResource.getShowId());
//
//        if (optionalShow.isEmpty()) {
//            throw new NotFoundException("Show Not Found with ID: " + bookingResource.getShowId() + " to book ticket");
//        }
//
//        Set<String> requestedSeats = bookingResource.getSeatsNumbers();
//
//        List<ShowSeat> showSeatsEntities = optionalShow.get().getSeats();
//
//        showSeatsEntities =
//                showSeatsEntities
//                        .stream()
//                        .filter(seat -> seat.getSeatType().equals(bookingResource.getSeatType())
//                                && !seat.isBooked()
//                                && requestedSeats.contains(seat.getSeatNumber()))
//                        .collect(Collectors.toList());
//
//        if (showSeatsEntities.size() != requestedSeats.size()) {
//            throw new NotFoundException("Seats Not Available for Booking");
//        }
//
//        Ticket ticket =
//                Ticket.builder()
//                        .user(optionalUser.get())
//                        .show(optionalShow.get())
//                        .seats(showSeatsEntities)
//                        .build();
//        double amount = 0.0;
//        String allotedSeats = "";
//
//        for (ShowSeat seatsEntity : showSeatsEntities) {
//            seatsEntity.setBooked(true);
//            seatsEntity.setBookedAt(new Date());
//            seatsEntity.setTicket(ticket);
//
//            amount += seatsEntity.getRate();
//            allotedSeats += seatsEntity.getSeatNumber() + " ";
//        }
//
//        ticket.setAmount(amount);
//        ticket.setAllottedSeats(allotedSeats);
//
//        if (CollectionUtils.isEmpty(optionalUser.get().getTicketEntities())) {
//            optionalUser.get().setTicketEntities(new ArrayList<>());
//        }
//
//        optionalUser.get().getTicketEntities().add(ticket);
//
//        if (CollectionUtils.isEmpty(optionalShow.get().getTickets())) {
//            optionalShow.get().setTickets(new ArrayList<>());
//        }
//
//        optionalShow.get().getTickets().add(ticket);
//
//        ticket = ticketRepository.save(ticket);
//
//        return Ticket.toResource(ticket);
//    }
//
//    public TicketResource getTicket(long id) {
//        Optional<Ticket> ticketEntity = ticketRepository.findById(id);
//
//        if (ticketEntity.isEmpty()) {
//            throw new EntityNotFoundException("Ticket Not Found with ID: " + id);
//        }
//
//        return Ticket.toResource(ticketEntity.get());
//    }
//}
package com.gfg.movieshark.movieshark_master.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gfg.movieshark.movieshark_master.domain.Show;
import com.gfg.movieshark.movieshark_master.domain.ShowSeat;
import com.gfg.movieshark.movieshark_master.domain.Ticket;
import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.exception.NotFoundException;
import com.gfg.movieshark.movieshark_master.repository.ShowRepository;
import com.gfg.movieshark.movieshark_master.repository.TicketRepository;
import com.gfg.movieshark.movieshark_master.repository.UserRepository;
import com.gfg.movieshark.movieshark_master.resource.BookingResource;
import com.gfg.movieshark.movieshark_master.resource.TicketMessage;
import com.gfg.movieshark.movieshark_master.resource.TicketResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import jakarta.persistence.EntityNotFoundException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private TicketRepository ticketRepository;

    // ✅ ADD THIS
    @Autowired
    private NotificationService notificationService;

    ObjectMapper mapper = new ObjectMapper();

    public TicketResource bookTicket(BookingResource bookingResource) {

        Optional<User> optionalUser = userRepository.findById(bookingResource.getUserId());

        if (optionalUser.isEmpty()) {
            throw new NotFoundException("User Not Found with ID: " + bookingResource.getUserId());
        }

        Optional<Show> optionalShow = showRepository.findById(bookingResource.getShowId());

        if (optionalShow.isEmpty()) {
            throw new NotFoundException("Show Not Found with ID: " + bookingResource.getShowId());
        }

        Set<String> requestedSeats = bookingResource.getSeatsNumbers();

        List<ShowSeat> showSeatsEntities = optionalShow.get().getSeats();

        showSeatsEntities =
                showSeatsEntities.stream()
                        .filter(seat ->
                                seat.getSeatType().equals(bookingResource.getSeatType())
                                        && !seat.isBooked()
                                        && requestedSeats.contains(seat.getSeatNumber())
                        )
                        .collect(Collectors.toList());

        if (showSeatsEntities.size() != requestedSeats.size()) {
            throw new NotFoundException("Seats Not Available for Booking");
        }

        Ticket ticket =
                Ticket.builder()
                        .user(optionalUser.get())
                        .show(optionalShow.get())
                        .seats(showSeatsEntities)
                        .build();

        double amount = 0.0;
        String allotedSeats = "";

        for (ShowSeat seatsEntity : showSeatsEntities) {
            seatsEntity.setBooked(true);
            seatsEntity.setBookedAt(new Date());
            seatsEntity.setTicket(ticket);

            amount += seatsEntity.getRate();
            allotedSeats += seatsEntity.getSeatNumber() + " ";
        }

        ticket.setAmount(amount);
        ticket.setAllottedSeats(allotedSeats);

        if (CollectionUtils.isEmpty(optionalUser.get().getTicketEntities())) {
            optionalUser.get().setTicketEntities(new ArrayList<>());
        }

        optionalUser.get().getTicketEntities().add(ticket);

        if (CollectionUtils.isEmpty(optionalShow.get().getTickets())) {
            optionalShow.get().setTickets(new ArrayList<>());
        }

        optionalShow.get().getTickets().add(ticket);

        // ✅ SAVE TICKET
        ticket = ticketRepository.save(ticket);

        // 🔥 SEND NOTIFICATION
        TicketMessage message = new TicketMessage();
        message.setEmail(optionalUser.get().getEmail());
        message.setMobile(optionalUser.get().getMobile());
        message.setShow(optionalShow.get().getShowTime().toString());
        message.setSeats(allotedSeats);

        notificationService.sendNotification(message);

        return Ticket.toResource(ticket);
    }

    public TicketResource getTicket(long id) {
        Optional<Ticket> ticketEntity = ticketRepository.findById(id);

        if (ticketEntity.isEmpty()) {
            throw new EntityNotFoundException("Ticket Not Found with ID: " + id);
        }

        return Ticket.toResource(ticketEntity.get());
    }
}
