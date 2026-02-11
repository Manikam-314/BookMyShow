package com.gfg.movieshark.movieshark_master.resource;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResource {

    private String movieReview;
    private double rating;
    private Long movieId;

}
