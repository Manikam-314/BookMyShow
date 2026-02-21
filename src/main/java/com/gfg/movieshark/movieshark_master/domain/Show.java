package com.gfg.movieshark.movieshark_master.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.gfg.movieshark.movieshark_master.resource.ShowResource;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.util.CollectionUtils;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "shows")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Show {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSS][.SS][.S]")
	@JsonSerialize(using = LocalDateTimeSerializer.class)
	@JsonDeserialize(using = LocalDateTimeDeserializer.class)
	@Column(name = "show_time", nullable = false)
	private LocalDateTime showTime;

	@Temporal(TemporalType.TIMESTAMP)
	@CreationTimestamp
	@Column(name = "created_at")
	private Date createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private Date updatedAt;

	@ManyToOne
	@JsonIgnore
	private Movie movie;

	@ManyToOne
	@JsonIgnore
	private Theater theater;

	@OneToMany(mappedBy = "show", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<Ticket> tickets;

	@OneToMany(mappedBy = "show", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JsonIgnore
	private List<ShowSeat> seats;

	public static List<ShowResource> toResource(List<Show> show) {

		if (!CollectionUtils.isEmpty(show)) {
			return show.stream().map(Show::toResource).collect(Collectors.toList());
		}

		return new ArrayList<>();
	}

	public static ShowResource toResource(Show show) {
		return ShowResource.builder()
				.id(show.getId())
				.showTime(show.getShowTime())
				.movieId(show.getMovie() != null ? show.getMovie().getId() : null)
				.movieResource(show.getMovie() != null ? Movie.toResource(show.getMovie()) : null)
				.theaterId(show.getTheater() != null ? show.getTheater().getId() : null)
				.theaterResource(show.getTheater() != null ? Theater.toResource(show.getTheater()) : null)
				.seats(show.getSeats() != null
						? ShowSeat.toResource(show.getSeats())
						: new ArrayList<>())
				.createdAt(show.getCreatedAt())
				.updatedAt(show.getUpdatedAt())
				.build();
	}

	public static Show toEntity(ShowResource showResource) {

		return Show.builder()
				.showTime(showResource.getShowTime())
				.movie(Movie.builder().id(showResource.getMovieId()).build())
				.theater(Theater.builder().id(showResource.getTheaterId()).build())
				.build();
	}

}
