package com.gfg.movieshark.movieshark_master.repository;

import com.gfg.movieshark.movieshark_master.domain.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {

    @Query("SELECT DISTINCT t.city FROM Theater t")
    List<String> findDistinctCities();

    Optional<Theater> findFirstByNameIgnoreCase(String name);
}