// package com.gfg.movieshark.movieshark_master.service;

// import com.gfg.movieshark.movieshark_master.domain.Movie;
// import com.gfg.movieshark.movieshark_master.domain.Show;
// import com.gfg.movieshark.movieshark_master.domain.Theater;
// import com.gfg.movieshark.movieshark_master.repository.ShowRepository;
// import com.gfg.movieshark.movieshark_master.search.MovieIndex;
// import com.gfg.movieshark.movieshark_master.search.MovieSearchRepository;
// import jakarta.annotation.PostConstruct;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.stereotype.Service;

// import java.util.ArrayList;
// import java.util.List;
// import java.util.stream.Collectors;

// /**
//  * Service to manage Elasticsearch indexing and complex queries.
//  */
// @Slf4j
// @Service
// public class SearchService {

//     @org.springframework.beans.factory.annotation.Autowired
//     private ShowRepository showRepository;

//     @org.springframework.beans.factory.annotation.Autowired
//     private MovieSearchRepository movieSearchRepository;

//     /**
//      * Syncs all active shows/movies into the Elasticsearch index.
//      * In a production environment, this might be triggered by events (Kafka/CDC) or a scheduled job.
//      */
//     @PostConstruct
//     public void syncAllToElasticsearch() {
//         try {
//             log.info("Starting Search Index Sync with Elasticsearch...");
            
//             List<Show> activeShows = showRepository.findAll();
//             if (activeShows.isEmpty()) {
//                 log.warn("No active shows found in database to sync.");
//                 return;
//             }

//             List<MovieIndex> indices = activeShows.stream()
//                     .map(this::mapToShowIndex)
//                     .collect(Collectors.toList());

//             if (movieSearchRepository != null) {
//                 movieSearchRepository.saveAll(indices);
//                 log.info("🎉 SUCCESS: Search Index Sync Complete. Total documents indexed: {}", indices.size());
//             } else {
//                 log.warn("❌ ERROR: Search Index Sync Failed: Repository is null.");
//             }
//         } catch (Exception e) {
//             log.warn("❌ Elasticsearch sync failed: {}. Search functionality will be unavailable.", e.getMessage());
//         }
//     }

//     private MovieIndex mapToShowIndex(Show show) {
//         Movie movie = show.getMovie();
//         Theater theater = show.getTheater();

//         return MovieIndex.builder()
//                 .id(movie.getId() + "_" + theater.getId())
//                 .movieId(movie.getId())
//                 .movieTitle(movie.getTitle())
//                 .genre(movie.getGenre() != null ? movie.getGenre().name() : "N/A")
//                 .rating(movie.getRating())
//                 .theaterId(theater.getId())
//                 .theaterName(theater.getName())
//                 .city(theater.getCity())
//                 .address(theater.getAddress())
//                 .build();
//     }

//     /**
//      * Search movies, theatres, or locations across the unified index.
//      */
//     public List<MovieIndex> search(String query) {
//         if (query == null || query.isBlank()) {
//             return new ArrayList<>();
//         }

//         if (movieSearchRepository == null) {
//             log.warn("Search requested but movieSearchRepository is not available.");
//             return new ArrayList<>();
//         }

//         // Search in title AND city AND theater name using repository method naming or custom queries
//         // Simplified search for demo
//         List<MovieIndex> results = movieSearchRepository.findByMovieTitleContaining(query);
//         results.addAll(movieSearchRepository.findByCityContaining(query));
//         results.addAll(movieSearchRepository.findByTheaterNameContaining(query));

//         // Return distinct results based on ID
//         return results.stream()
//                 .collect(Collectors.toMap(MovieIndex::getId, p -> p, (p, q) -> p))
//                 .values()
//                 .stream()
//                 .collect(Collectors.toList());
//     }
// }
package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.domain.Movie;
import com.gfg.movieshark.movieshark_master.domain.Show;
import com.gfg.movieshark.movieshark_master.domain.Theater;
import com.gfg.movieshark.movieshark_master.repository.ShowRepository;
import com.gfg.movieshark.movieshark_master.search.MovieIndex;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class SearchService {

```
@Autowired
private ShowRepository showRepository;

private MovieIndex mapToShowIndex(Show show) {
    Movie movie = show.getMovie();
    Theater theater = show.getTheater();

    return MovieIndex.builder()
            .id(movie.getId() + "_" + theater.getId())
            .movieId(movie.getId())
            .movieTitle(movie.getTitle())
            .genre(movie.getGenre() != null ? movie.getGenre().name() : "N/A")
            .rating(movie.getRating())
            .theaterId(theater.getId())
            .theaterName(theater.getName())
            .city(theater.getCity())
            .address(theater.getAddress())
            .build();
}

public List<MovieIndex> search(String query) {
    log.warn("Elasticsearch is temporarily disabled.");
    return new ArrayList<>();
}
```

}
