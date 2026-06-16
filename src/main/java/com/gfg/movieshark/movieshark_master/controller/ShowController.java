package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.ShowResource;
import com.gfg.movieshark.movieshark_master.service.ShowService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/show")
public class ShowController {

    @Autowired
    private ShowService showService;

    @GetMapping("/search")
    public ResponseEntity<List<ShowResource>> search(
            @RequestParam(name = "city", required = false) String cityName,
            @RequestParam(name = "movieName", required = false) String movieName,
            @RequestParam(name = "theaterName", required = false) String theaterName) {
        return ResponseEntity.ok(showService.searchShows(movieName, cityName, theaterName));
    }

    @PostMapping("/add")
    public ResponseEntity<ShowResource> addShow(@RequestBody ShowResource showResource) {
        showService.addShow(showResource);
        return ResponseEntity.ok(showResource);
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<com.gfg.movieshark.movieshark_master.resource.ShowSeatsResource>> getShowSeats(
            @PathVariable(name = "id") long id) {
        return ResponseEntity.ok(showService.getShowSeats(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowResource> getShowById(@PathVariable(name = "id") long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<String>> getSlots(
            @RequestParam(name = "theaterId", required = false) Long theaterId,
            @RequestParam(name = "theatreId", required = false) Long theatreId,
            @RequestParam(name = "date") String date) {
        long id = (theaterId != null) ? theaterId : (theatreId != null ? theatreId : 0L);
        return ResponseEntity.ok(showService.getAvailableSlots(id, date));
    }

    // ✅ ADD THIS
    @GetMapping("/all")
    public ResponseEntity<?> getAllShows() {
        return ResponseEntity.ok(showService.getAllShows());
    }
}