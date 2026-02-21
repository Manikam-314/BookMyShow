/**
 * 
 */
package com.gfg.movieshark.movieshark_master.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gfg.movieshark.movieshark_master.resource.TheaterResource;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "theaters")
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Data
public class Theater {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "city", nullable = false)
	private String city;

	@Column(name = "address", nullable = false)
	private String address;

	@Column(name = "total_rows")
	private Integer totalRows;

	@Column(name = "total_columns")
	private Integer totalColumns;

	@Transient
	private Integer capacity;

	@Column(name = "show_timings")
	private String showTimings; // Comma separated: "10:00,14:00,18:00"

	@OneToMany(mappedBy = "theater", cascade = CascadeType.ALL)
	@JsonIgnore
	@Builder.Default
	private List<Show> shows = new ArrayList<>();

	@OneToMany(mappedBy = "theater", cascade = CascadeType.ALL)
	@JsonIgnore
	@Builder.Default
	private List<TheaterSeats> seats = new ArrayList<>();

	public static Theater toEntity(TheaterResource theaterResource) {

		return Theater.builder()
				.name(theaterResource.getName())
				.city(theaterResource.getCity())
				.address(theaterResource.getAddress())
				.totalRows(theaterResource.getTotalRows())
				.totalColumns(theaterResource.getTotalColumns())
				.showTimings(theaterResource.getShowTimings())
				.build();
	}

	public static TheaterResource toResource(Theater theater) {

		return TheaterResource.builder()
				.id(theater.getId())
				.name(theater.getName())
				.city(theater.getCity())
				.address(theater.getAddress())
				.totalRows(theater.getTotalRows() != null ? theater.getTotalRows() : 10) // Default for existing data
				.totalColumns(theater.getTotalColumns() != null ? theater.getTotalColumns() : 15) // Default for
																									// existing data
				.capacity(theater.getCapacity())
				.showTimings(theater.getShowTimings())
				.build();
	}

	public Integer getCapacity() {
		return (totalRows != null && totalColumns != null) ? totalRows * totalColumns : 0;
	}

}
