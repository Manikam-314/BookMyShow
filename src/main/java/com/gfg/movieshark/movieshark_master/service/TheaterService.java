package com.gfg.movieshark.movieshark_master.service;


import com.gfg.movieshark.movieshark_master.domain.Theater;
import com.gfg.movieshark.movieshark_master.domain.TheaterSeats;
import com.gfg.movieshark.movieshark_master.enums.SeatType;
import com.gfg.movieshark.movieshark_master.repository.TheaterRepository;
import com.gfg.movieshark.movieshark_master.repository.TheaterSeatsRepository;
import com.gfg.movieshark.movieshark_master.resource.TheaterResource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Slf4j
@Service
public class TheaterService {

	@Autowired
	private TheaterRepository theaterRepository;

	@Autowired
	private TheaterSeatsRepository theaterSeatsRepository;

    public TheaterResource addTheater(TheaterResource theaterDto) {

        Theater theater = Theater.toEntity(theaterDto);

        List<TheaterSeats> seats = getTheaterSeats();

        for (TheaterSeats seat : seats) {
            seat.setTheater(theater);   // Set relation BEFORE saving
        }

        theater.getSeats().addAll(seats);

        theater = theaterRepository.save(theater);  // Cascade will save seats

        log.info("Added Theater [id: {}, Name: {}]", theater.getId(), theater.getName());

        return Theater.toResource(theater);
    }

    private List<TheaterSeats> getTheaterSeats() {

        List<TheaterSeats> seats = new ArrayList<>();

        seats.add(getTheaterSeat("1A", SeatType.REGULAR));
        seats.add(getTheaterSeat("1B", SeatType.REGULAR));
        seats.add(getTheaterSeat("1C", SeatType.REGULAR));
        seats.add(getTheaterSeat("1D", SeatType.REGULAR));
        seats.add(getTheaterSeat("1E", SeatType.REGULAR));

        seats.add(getTheaterSeat("2A", SeatType.RECLINER));
        seats.add(getTheaterSeat("2B", SeatType.RECLINER));
        seats.add(getTheaterSeat("2C", SeatType.RECLINER));
        seats.add(getTheaterSeat("2D", SeatType.RECLINER));
        seats.add(getTheaterSeat("2E", SeatType.RECLINER));

        return seats;   // 🚨 NO SAVE HERE
    }


	private TheaterSeats getTheaterSeat(String seatNumber, SeatType seatType) {
		return TheaterSeats.builder().seatNumber(seatNumber).seatType(seatType).build();
	}


	public TheaterResource getTheater(long id) {
		log.info("Searching Theater by id: " + id);

		Optional<Theater> theaterEntity = theaterRepository.findById(id);

		if (theaterEntity.isEmpty()) {
			log.error("Theater not found for id: " + id);
			throw new EntityNotFoundException("Theater Not Found with ID: " + id);
		}

		return Theater.toResource(theaterEntity.get());
	}

}