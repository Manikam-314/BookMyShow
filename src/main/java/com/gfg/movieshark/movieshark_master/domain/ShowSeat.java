package com.gfg.movieshark.movieshark_master.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gfg.movieshark.movieshark_master.enums.SeatType;
import com.gfg.movieshark.movieshark_master.enums.SeatStatus;
import com.gfg.movieshark.movieshark_master.resource.ShowSeatsResource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.util.CollectionUtils;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Entity
@Table(name = "show_seats")
@NoArgsConstructor
@Builder
@AllArgsConstructor
@ToString
public class ShowSeat {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "seat_number", nullable = false)
	private String seatNumber;

	@Column(name = "rate", nullable = false)
	private int rate;

	@Enumerated(EnumType.STRING)
	@Column(name = "seat_type", nullable = false)
	private SeatType seatType;

	@Column(name = "is_booked", columnDefinition = "bit(1) default 0", nullable = false)
	private boolean booked;

	@Enumerated(EnumType.STRING)
	@Column(name = "seat_status", columnDefinition = "varchar(20) default 'AVAILABLE'")
	private SeatStatus seatStatus = SeatStatus.AVAILABLE;

	@ManyToOne
	@JoinColumn(name = "locked_by_user_id")
	private User lockedBy;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "lock_expires_at")
	private Date lockExpiresAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "booked_at")
	@CreationTimestamp
	private Date bookedAt;

	@ManyToOne
	@JsonIgnore
	private Show show;

	@ManyToOne
	@JsonIgnore
	private Ticket ticket;

	public static List<ShowSeatsResource> toResource(List<ShowSeat> seats) {

		if (!CollectionUtils.isEmpty(seats)) {
			return seats.stream().map(ShowSeat::toResource).collect(Collectors.toList());
		}

		return new ArrayList<>();
	}

	public static ShowSeatsResource toResource(ShowSeat seatsEntity) {
		String seatNum = seatsEntity.getSeatNumber();
		String row = "";
		int number = 0;
		try {
			// Extract letters for row, digits for number
			row = seatNum.replaceAll("[^A-Za-z]", "");
			String numStr = seatNum.replaceAll("[^0-9]", "");
			if (!numStr.isEmpty()) {
				number = Integer.parseInt(numStr);
			}
		} catch (Exception e) {
			// fallback if parsing fails
		}

		return ShowSeatsResource.builder()
				.id(seatsEntity.getId())
				.seatNumber(seatNum)
				.row(row)
				.number(number)
				.rate(seatsEntity.getRate())
				.seatType(seatsEntity.getSeatType())
				.booked(seatsEntity.isBooked())
				.status(seatsEntity.getSeatStatus() != null ? seatsEntity.getSeatStatus().name() : (seatsEntity.isBooked() ? "BOOKED" : "AVAILABLE"))
				.bookedAt(seatsEntity.getBookedAt())
				.build();
	}

}
