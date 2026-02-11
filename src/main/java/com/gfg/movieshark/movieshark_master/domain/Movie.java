package com.gfg.movieshark.movieshark_master.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gfg.movieshark.movieshark_master.enums.Genre;
import com.gfg.movieshark.movieshark_master.resource.MovieResource;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "movies")
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Data
public class Movie {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Enumerated(EnumType.STRING)
	private Genre genre;

	private Double rating;

	@OneToMany(mappedBy = "movie")
	private List<Review> reviews;

	@OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
	@JsonIgnore
	@Builder.Default
	private List<Show> shows = new ArrayList<>();

	public static Movie toEntity(MovieResource movieRequest) {

		return Movie.builder()
				.title(movieRequest.getTitle())
				.genre(movieRequest.getGenre())
				.build();

	}

	public static MovieResource toResource(Movie movie) {

		return MovieResource.builder()
				.id(movie.getId())
				.title(movie.getTitle())
				.genre(movie.getGenre())
				.reviews(Review.toResource(movie.getReviews()))
				.build();
	}
}