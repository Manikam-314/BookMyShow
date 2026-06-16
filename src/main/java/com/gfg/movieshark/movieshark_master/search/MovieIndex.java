package com.gfg.movieshark.movieshark_master.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * Elasticsearch document combining Movie and Theater info for fast cross-search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "movie_indices")
public class MovieIndex {

    @Id
    private String id; // Composite ID: MovieID_TheaterID

    @Field(type = FieldType.Text, name = "movie_title")
    private String movieTitle;

    @Field(type = FieldType.Keyword, name = "genre")
    private String genre;

    @Field(type = FieldType.Double, name = "rating")
    private Double rating;

    @Field(type = FieldType.Text, name = "theater_name")
    private String theaterName;

    @Field(type = FieldType.Text, name = "city")
    private String city;

    @Field(type = FieldType.Text, name = "address")
    private String address;

    @Field(type = FieldType.Long, name = "movie_id")
    private Long movieId;

    @Field(type = FieldType.Long, name = "theater_id")
    private Long theaterId;
}
