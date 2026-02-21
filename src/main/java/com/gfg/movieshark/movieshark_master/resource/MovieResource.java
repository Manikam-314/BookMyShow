package com.gfg.movieshark.movieshark_master.resource;

import com.gfg.movieshark.movieshark_master.enums.Genre;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@Builder
@AllArgsConstructor
@Data
public class MovieResource {

	private long id;

	private String title;

	private Double rating;

	private String imageUrl;

	private String bannerUrl;

	private String votes;

	private Genre genre;

	private List<ReviewResource> reviews;

}