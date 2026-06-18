package com.gfg.movieshark.movieshark_master;

import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.enums.Genre;
import com.gfg.movieshark.movieshark_master.enums.Role;
import com.gfg.movieshark.movieshark_master.repository.UserRepository;
import com.gfg.movieshark.movieshark_master.resource.MovieResource;
import com.gfg.movieshark.movieshark_master.service.MovieService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
// import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
// @EnableElasticsearchRepositories(basePackages = "com.gfg.movieshark.movieshark_master.search")
public class MoviesharkMasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoviesharkMasterApplication.class, args);
    }

    @Bean
    CommandLineRunner runner(MovieService movieService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("RUNNER IS EXECUTING 🔥");

            // Seed Admin User — only if none exists yet
            if (!userRepository.existsByEmail("admin@gmail.com")) {
                User user = new User();
                user.setName("admin");
                user.setPassword(passwordEncoder.encode("1234")); // always BCrypt
                user.setMobile("9999999999");
                user.setEmail("admin@gmail.com");
                user.setRole(Role.ADMIN);
                userRepository.save(user);
                System.out.println("Admin user seeded ✅");
            } else {
                System.out.println("Admin user already exists — skipping seed.");
            }

            // Seed Movies
            seedMovies(movieService);
        };
    }

    private void seedMovies(com.gfg.movieshark.movieshark_master.service.MovieService movieService) {
        try {
            createMovieIfNotExists(movieService, "Captain Miller",
                    com.gfg.movieshark.movieshark_master.enums.Genre.ACTION, 8.8,
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/captain-miller-et00363419-1704958104.jpg",
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/captain-miller-et00363419-1704958104.jpg",
                    "145K");

            createMovieIfNotExists(movieService, "Ayalaan", com.gfg.movieshark.movieshark_master.enums.Genre.SCI_FI,
                    8.4,
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/ayalaan-et00072624-1704957643.jpg",
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/ayalaan-et00072624-1704957643.jpg",
                    "120K");

            createMovieIfNotExists(movieService, "Merry Christmas",
                    com.gfg.movieshark.movieshark_master.enums.Genre.THRILLER, 8.2,
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/merry-christmas-et00348719-1704870404.jpg",
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/merry-christmas-et00348719-1704870404.jpg",
                    "95K");

            createMovieIfNotExists(movieService, "Mission: Chapter 1",
                    com.gfg.movieshark.movieshark_master.enums.Genre.ACTION, 8.6,
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/mission-chapter-1-et00373206-1704797072.jpg",
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/mission-chapter-1-et00373206-1704797072.jpg",
                    "45K");

            createMovieIfNotExists(movieService, "Guntur Kaaram",
                    com.gfg.movieshark.movieshark_master.enums.Genre.ACTION, 7.5,
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/guntur-kaaram-et00311266-1704955379.jpg",
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/guntur-kaaram-et00311266-1704955379.jpg",
                    "210K");

            createMovieIfNotExists(movieService, "Hanuman", com.gfg.movieshark.movieshark_master.enums.Genre.ACTION,
                    9.2,
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/hanuman-et00311673-1704954533.jpg",
                    "https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/hanuman-et00311673-1704954533.jpg",
                    "320K");

        } catch (Exception e) {
            System.out.println("Error seeding movies: " + e.getMessage());
        }
    }

    private void createMovieIfNotExists(MovieService movieService,
            String title, Genre genre, Double rating, String imageUrl,
            String bannerUrl, String votes) {
        try {
            MovieResource movie = new MovieResource();
            movie.setTitle(title);
            movie.setGenre(genre);
            movie.setRating(rating);
            movie.setImageUrl(imageUrl);
            movie.setBannerUrl(bannerUrl);
            movie.setVotes(votes);
            movieService.addMovie(movie);
        } catch (Exception e) {
            System.out.println("Skipping movie " + title + ": " + e.getMessage());
        }
    }

}
