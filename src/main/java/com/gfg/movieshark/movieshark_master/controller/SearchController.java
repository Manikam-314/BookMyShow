// package com.gfg.movieshark.movieshark_master.controller;

// // import com.gfg.movieshark.movieshark_master.search.MovieIndex;
// import com.gfg.movieshark.movieshark_master.service.SearchService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import java.util.List;

// /**
//  * Controller to handle movie, theater, and location search queries.
//  */
// @RestController
// @RequestMapping("/api/search")
// @RequiredArgsConstructor
// public class SearchController {

//     private final SearchService searchService;

//     @GetMapping
//     public ResponseEntity<List<MovieIndex>> search(@RequestParam String q) {
//         List<MovieIndex> results = searchService.search(q);
//         return ResponseEntity.ok(results);
//     }
// }
