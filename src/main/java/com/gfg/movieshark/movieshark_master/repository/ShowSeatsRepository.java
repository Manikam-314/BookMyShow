package com.gfg.movieshark.movieshark_master.repository;


import com.gfg.movieshark.movieshark_master.domain.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Date;
import com.gfg.movieshark.movieshark_master.enums.SeatStatus;

@Repository
public interface ShowSeatsRepository extends JpaRepository<ShowSeat, Long> {
    List<ShowSeat> findBySeatStatusAndLockExpiresAtBefore(SeatStatus status, Date date);
}