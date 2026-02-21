package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.TheaterResource;
import com.gfg.movieshark.movieshark_master.service.TheaterService;
import jakarta.validation.constraints.Min;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/theater")
public class TheaterController {

    @Autowired
    private TheaterService theaterService;

    @PostMapping("/add")
    public ResponseEntity<TheaterResource> addUser(@RequestBody TheaterResource theaterResource) {

        return ResponseEntity.ok(theaterService.addTheater(theaterResource));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<TheaterResource> deleteUser(
            @PathVariable(name = "id") @Min(value = 1, message = "Theater Id Cannot be -ve") long id) {

        return ResponseEntity.ok(theaterService.deleteTheater(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TheaterResource> updateTheater(
            @PathVariable(name = "id") @Min(value = 1, message = "Theater Id Cannot be -ve") long id,
            @RequestBody TheaterResource theaterResource) {
        return ResponseEntity.ok(theaterService.updateTheater(id, theaterResource));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheaterResource> getUser(
            @PathVariable(name = "id") @Min(value = 1, message = "Theater Id Cannot be -ve") long id) {

        return ResponseEntity.ok(theaterService.getTheater(id));
    }

    @GetMapping("/cities")
    public ResponseEntity<java.util.List<String>> getCities() {
        return ResponseEntity.ok(theaterService.getAllCities());
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<TheaterResource>> getAllTheaters() {
        return ResponseEntity.ok(theaterService.getAllTheaters());
    }
}
