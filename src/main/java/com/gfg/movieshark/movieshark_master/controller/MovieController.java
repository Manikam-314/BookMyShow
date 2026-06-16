package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.MovieResource;
import com.gfg.movieshark.movieshark_master.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movie")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PostMapping("/add")
    public ResponseEntity<MovieResource> addMovie(@RequestBody MovieResource movieRequest) {
        return new ResponseEntity<>(movieService.addMovie(movieRequest), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResource> getMovieById(@PathVariable(name = "id") long id) {

        return ResponseEntity.ok(movieService.getMovie(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MovieResource>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/title")
    public ResponseEntity<MovieResource> getMovieByTitle(@RequestParam String title) {

        return ResponseEntity.ok(movieService.getMovie(title));
    }
}