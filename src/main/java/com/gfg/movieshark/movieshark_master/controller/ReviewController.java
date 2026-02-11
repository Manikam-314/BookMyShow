package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.domain.Review;
import com.gfg.movieshark.movieshark_master.resource.ReviewResource;
import com.gfg.movieshark.movieshark_master.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/add")
    public void addReview(@RequestBody ReviewResource reviewResource){
        reviewService.addReview(Review.toEntity(reviewResource));
    }

    @GetMapping("/find")
    public ReviewResource getReview(@RequestParam Long reviewId){
        return reviewService.getReviewById(reviewId);
    }
}
