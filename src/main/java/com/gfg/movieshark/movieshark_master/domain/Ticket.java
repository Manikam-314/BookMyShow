package com.gfg.movieshark.movieshark_master.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gfg.movieshark.movieshark_master.resource.TicketResource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@EntityListeners(value = { AuditingEntityListener.class })
@Table(name = "tickets")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alloted_seats", nullable = false)
    private String allottedSeats;

    @Column(name = "amount", nullable = false)
    private double amount;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "booked_at", nullable = false)
    private Date bookedAt;

    @ManyToOne
    @JsonIgnore
    private User user;

    @ManyToOne
    @JsonIgnore
    private Show show;

    // ✅ FIXED HERE
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ShowSeat> seats;

    public static List<TicketResource> toResource(List<Ticket> tickets){
        if(CollectionUtils.isEmpty(tickets))
            return new ArrayList<>();
        return tickets.stream().map(Ticket::toResource).collect(Collectors.toList());
    }

    public static Ticket toEntity(TicketResource ticketResource) {
        return Ticket.builder()
                .allottedSeats(ticketResource.getAllottedSeats())
                .amount(ticketResource.getAmount())
                .build();
    }

    public static TicketResource toResource(Ticket ticketEntity) {
        return TicketResource.builder()
                .id(ticketEntity.getId())
                .allottedSeats(ticketEntity.getAllottedSeats())
                .amount(ticketEntity.getAmount())
                .bookedAt(ticketEntity.getBookedAt())
                .build();
    }
}
