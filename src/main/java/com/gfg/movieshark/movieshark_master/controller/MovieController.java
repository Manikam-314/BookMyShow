package com.gfg.movieshark.movieshark_master.controller;


import com.gfg.movieshark.movieshark_master.resource.MovieResource;
import com.gfg.movieshark.movieshark_master.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/movie")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @PostMapping("/add")
    public ResponseEntity<MovieResource> addMovie(@RequestBody MovieResource movieRequest) {

        //return ResponseEntity.ok(movieService.addMovie(movieRequest));
        return new ResponseEntity<>(movieService.addMovie(movieRequest), HttpStatus.CREATED); // 201 CREATED;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResource> getMovieById(@PathVariable(name = "id") long id) {

        return ResponseEntity.ok(movieService.getMovie(id));
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/title")
    public ResponseEntity<MovieResource> getMovieByTitle(@RequestParam String title) {

        return ResponseEntity.ok(movieService.getMovie(title));
    }
}