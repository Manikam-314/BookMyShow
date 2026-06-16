package com.gfg.movieshark.movieshark_master.repository;

import com.gfg.movieshark.movieshark_master.domain.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    @Query("SELECT s FROM Show s JOIN FETCH s.theater JOIN FETCH s.movie WHERE lower(s.movie.title) like lower(concat('%', ?1, '%')) AND lower(s.theater.city) like lower(concat('%', ?2, '%'))")
    List<Show> findByMovieNameAndCity(String movieName, String city);

    @Query("SELECT s FROM Show s JOIN FETCH s.theater WHERE lower(s.theater.city) like lower(concat('%', ?1, '%'))")
    List<Show> findByCity(String city);

    @Query("SELECT s FROM Show s JOIN FETCH s.theater WHERE lower(s.theater.name) like lower(concat('%', ?1, '%')) AND lower(s.theater.city) like lower(concat('%', ?2, '%'))")
    List<Show> findByTheaterAndCity(String theaterName, String cityName);

    @Query("select s from Show s where lower(s.movie.title) like lower(concat('%', ?1, '%'))")
    List<Show> findByMovieName(String movieName);

    @Query("SELECT s FROM Show s WHERE s.theater.id = ?1 AND CAST(s.showTime AS string) LIKE concat(?2, '%')")
    List<Show> findByTheaterIdAndShowTimeStartingWith(Long theaterId, String date);

    @Query("SELECT s FROM Show s JOIN FETCH s.theater WHERE lower(s.theater.name) LIKE lower(concat('%', ?1, '%'))")
    List<Show> findByTheaterName(String theaterName);
}