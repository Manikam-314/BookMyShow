package com.gfg.movieshark.movieshark_master.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gfg.movieshark.movieshark_master.resource.ReviewResource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "review_table")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String movieReview;

    private double rating;

    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    @JsonIgnore
    private Movie movie;

    @CreationTimestamp
    private Date createdDate;

    @UpdateTimestamp
    private Date updatedDate;

    // ✅ Convert Resource → Entity
    public static Review toEntity(ReviewResource reviewResource) {
        return Review.builder()
                .movieReview(reviewResource.getMovieReview())
                .rating(reviewResource.getRating())
                .movie(Movie.builder()
                        .id(reviewResource.getMovieId())
                        .build())
                .build();
    }

    // ✅ Convert Entity → Resource
    public static ReviewResource toResource(Review review) {
        return ReviewResource.builder()
                .movieReview(review.getMovieReview())
                .rating(review.getRating())
                .movieId(review.getMovie().getId())
                .build();
    }

    // ✅ Convert List<Entity> → List<Resource>
    public static List<ReviewResource> toResource(List<Review> reviews) {
        if (CollectionUtils.isEmpty(reviews))
            return new ArrayList<>();
        else
            return reviews.stream()
                    .map(Review::toResource)
                    .collect(Collectors.toList());
    }
}
