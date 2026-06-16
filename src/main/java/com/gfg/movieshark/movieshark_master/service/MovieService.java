package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.domain.Movie;
import com.gfg.movieshark.movieshark_master.exception.NotFoundException;
import com.gfg.movieshark.movieshark_master.repository.MovieRepository;
import com.gfg.movieshark.movieshark_master.resource.MovieResource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
public class MovieService {

	@Autowired
	private MovieRepository movieRepository;

	public MovieResource addMovie(MovieResource movieRequest) {

		Movie movie = Movie.toEntity(movieRequest);

		if (movieRepository.existsByTitle(movieRequest.getTitle())) {
			return Movie.toResource(movieRepository.findByTitle(movieRequest.getTitle()));
		}

		movie = movieRepository.save(movie);

		log.info("Added New Movie" + movie.toString());

		return Movie.toResource(movie);
	}

	public MovieResource getMovie(long id) {
		// add id check if valid
		Optional<Movie> movie = movieRepository.findById(id);

		if (movie.isEmpty()) {
			throw new EntityNotFoundException("Movie not found:" + id);
		}

		return Movie.toResource(movie.get());
	}

	public List<MovieResource> getAllMovies() {
		return movieRepository.findAll()
				.stream()
				.map(Movie::toResource)
				.toList(); // Java 16+
	}

	public MovieResource getMovie(String title) {
		// add id check if valid
		Movie movie = movieRepository.findByTitle(title);

		if (Objects.isNull(movie)) {
			throw new NotFoundException("Movie not found:" + title);
		}

		return Movie.toResource(movie);
	}

}