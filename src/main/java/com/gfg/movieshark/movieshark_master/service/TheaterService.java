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
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class TheaterService {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private TheaterSeatsRepository theaterSeatsRepository;

    public TheaterResource addTheater(TheaterResource theaterDto) {

        Theater theater = Theater.toEntity(theaterDto);

        // Use provided rows/cols or default to 10x15 if not provided (0)
        int rows = theaterDto.getTotalRows() > 0 ? theaterDto.getTotalRows() : 10;
        int cols = theaterDto.getTotalColumns() > 0 ? theaterDto.getTotalColumns() : 15;

        // Ensure entity has values set (in case they were 0 in DTO)
        theater.setTotalRows(rows);
        theater.setTotalColumns(cols);

        List<TheaterSeats> seats = getTheaterSeats(rows, cols);

        for (TheaterSeats seat : seats) {
            seat.setTheater(theater); // Set relation BEFORE saving
        }

        theater.getSeats().addAll(seats);

        theater = theaterRepository.save(theater); // Cascade will save seats

        log.info("Added Theater [id: {}, Name: {}, Seats: {}]", theater.getId(), theater.getName(), seats.size());

        return Theater.toResource(theater);
    }

    public TheaterResource deleteTheater(long id) {
        Optional<Theater> theaterEntity = theaterRepository.findById(id);

        if (theaterEntity.isEmpty()) {
            throw new EntityNotFoundException("Theater Not Found with ID: " + id);
        }

        Theater theater = theaterEntity.get();
        theaterRepository.delete(theater);

        return Theater.toResource(theater);
    }

    public TheaterResource updateTheater(long id, TheaterResource theaterResource) {
        Optional<Theater> theaterEntity = theaterRepository.findById(id);

        if (theaterEntity.isEmpty()) {
            throw new EntityNotFoundException("Theater Not Found with ID: " + id);
        }

        Theater theater = theaterEntity.get();

        // One-time seat configuration logic
        if (Boolean.TRUE.equals(theater.getSeatsConfigured())) {
            // If already configured, we DO NOT allow changing rows/cols
            if ((theaterResource.getTotalRows() > 0 && theaterResource.getTotalRows() != theater.getTotalRows()) ||
                    (theaterResource.getTotalColumns() > 0
                            && theaterResource.getTotalColumns() != theater.getTotalColumns())) {
                throw new IllegalStateException("Seat configuration is already locked and cannot be edited.");
            }
        } else {
            // First-time configuration
            if (theaterResource.getTotalRows() > 0 && theaterResource.getTotalColumns() > 0) {
                theater.setTotalRows(theaterResource.getTotalRows());
                theater.setTotalColumns(theaterResource.getTotalColumns());
                theater.setSeatsConfigured(true);

                // Regenerate seats based on new config
                theaterSeatsRepository.deleteByTheater(theater);
                List<TheaterSeats> newSeats = getTheaterSeats(theater.getTotalRows(), theater.getTotalColumns());
                for (TheaterSeats seat : newSeats) {
                    seat.setTheater(theater);
                }
                theater.getSeats().clear();
                theater.getSeats().addAll(newSeats);
                log.info("Locked seat configuration for Theater {}: {}x{}", theater.getId(), theater.getTotalRows(),
                        theater.getTotalColumns());
            }
        }

        if (theaterResource.getName() != null)
            theater.setName(theaterResource.getName());
        if (theaterResource.getCity() != null)
            theater.setCity(theaterResource.getCity());
        if (theaterResource.getAddress() != null)
            theater.setAddress(theaterResource.getAddress());
        if (theaterResource.getShowTimings() != null)
            theater.setShowTimings(theaterResource.getShowTimings());

        theater = theaterRepository.save(theater);

        return Theater.toResource(theater);
    }

    private List<TheaterSeats> getTheaterSeats(int totalRows, int totalColumns) {

        List<TheaterSeats> seats = new ArrayList<>();

        // Generate rows dynamically from 'A'
        // If more than 26 rows, we might need AA, AB logic, but for now assuming A-Z is
        // enough
        for (int i = 0; i < totalRows; i++) {
            char rowChar = (char) ('A' + i);
            SeatType seatType = getSeatTypeForRow(i, totalRows);

            for (int col = 1; col <= totalColumns; col++) {
                String seatNumber = "" + rowChar + col;
                seats.add(getTheaterSeat(seatNumber, seatType));
            }
        }

        return seats; // 🚨 NO SAVE HERE
    }

    private SeatType getSeatTypeForRow(int rowIndex, int totalRows) {
        if (totalRows <= 2) {
            return SeatType.FIRST_CLASS;
        }
        if (totalRows <= 5) {
            if (rowIndex == 0) {
                return SeatType.RECLINER;
            } else if (rowIndex == totalRows - 1) {
                return SeatType.SECOND_CLASS;
            } else {
                return SeatType.FIRST_CLASS;
            }
        }
        // totalRows >= 6
        if (rowIndex < 2) {
            return SeatType.RECLINER;
        } else if (rowIndex >= totalRows - 1) {
            return SeatType.SECOND_CLASS;
        } else {
            return SeatType.FIRST_CLASS;
        }
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

    public List<String> getAllCities() {
        return theaterRepository.findDistinctCities();
    }

    public List<TheaterResource> getAllTheaters() {
        List<Theater> theaters = theaterRepository.findAll();
        List<TheaterResource> theaterResources = new ArrayList<>();
        for (Theater theater : theaters) {
            theaterResources.add(Theater.toResource(theater));
        }
        return theaterResources;
    }

}