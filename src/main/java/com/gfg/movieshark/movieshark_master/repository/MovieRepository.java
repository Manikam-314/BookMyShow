package com.gfg.movieshark.movieshark_master.repository;


import com.gfg.movieshark.movieshark_master.domain.Movie;
import com.gfg.movieshark.movieshark_master.enums.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long>{

	boolean existsByTitle(String title);

	public Movie findByTitle(String title);

	public List<Movie> findByGenre(Genre genre);
}