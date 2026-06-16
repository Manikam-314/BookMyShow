package com.gfg.movieshark.movieshark_master.repository;

import com.gfg.movieshark.movieshark_master.domain.TheatreApplication;
import com.gfg.movieshark.movieshark_master.enums.TheatreStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TheatreApplicationRepository extends JpaRepository<TheatreApplication, Long> {
    List<TheatreApplication> findByStatus(TheatreStatus status);

    Optional<TheatreApplication> findByEmail(String email);

    boolean existsByEmail(String email);

    List<TheatreApplication> findByOwner_Id(Long userId);
}
