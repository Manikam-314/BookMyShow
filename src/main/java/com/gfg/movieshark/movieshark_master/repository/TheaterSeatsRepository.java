package com.gfg.movieshark.movieshark_master.repository;

import com.gfg.movieshark.movieshark_master.domain.Theater;
import com.gfg.movieshark.movieshark_master.domain.TheaterSeats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TheaterSeatsRepository extends JpaRepository<TheaterSeats, Long> {
    void deleteByTheater(Theater theater);
}