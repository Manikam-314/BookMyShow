package com.gfg.movieshark.movieshark_master.repository;


import com.gfg.movieshark.movieshark_master.domain.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShowSeatsRepository extends JpaRepository<ShowSeat, Long> {

}