package com.gfg.movieshark.movieshark_master;

import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.enums.Role;
import com.gfg.movieshark.movieshark_master.service.UserAuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MoviesharkMasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoviesharkMasterApplication.class, args);
    }

    @Bean
    CommandLineRunner runner(UserAuthService userAuthService) {
        return args -> {
            System.out.println("RUNNER IS EXECUTING 🔥");

            User user = new User();
            user.setName("admin");
            user.setPassword("1234");
            user.setMobile("9999999999");
            user.setEmail("admin@gmail.com");
            user.setRole(Role.ADMIN);

            userAuthService.addUser(user);
        };
    }

}
