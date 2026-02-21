package com.gfg.movieshark.movieshark_master.resource;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
@ToString
public class TheaterResource {

	private long id;

	private String name;

	private String city;

	private String address;

	private int totalRows;

	private int totalColumns;

	private int capacity;

	private String showTimings;

	private List<ShowResource> shows;
}
