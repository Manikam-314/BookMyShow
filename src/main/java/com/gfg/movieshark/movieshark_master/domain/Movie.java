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

	@Lob
	@Column(name = "image_url", columnDefinition = "LONGTEXT")
	private String imageUrl;

	@Lob
	@Column(name = "banner_url", columnDefinition = "LONGTEXT")
	private String bannerUrl;

	private String votes;

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
				.rating(movieRequest.getRating())
				.imageUrl(movieRequest.getImageUrl())
				.bannerUrl(movieRequest.getBannerUrl())
				.votes(movieRequest.getVotes())
				.build();

	}

	public static MovieResource toResource(Movie movie) {

		return MovieResource.builder()
				.id(movie.getId())
				.title(movie.getTitle())
				.genre(movie.getGenre())
				.rating(movie.getRating())
				.imageUrl(movie.getImageUrl())
				.bannerUrl(movie.getBannerUrl())
				.votes(movie.getVotes())
				.reviews(Review.toResource(movie.getReviews()))
				.build();
	}
}