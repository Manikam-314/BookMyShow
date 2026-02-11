package com.gfg.movieshark.movieshark_master.service;


import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * This service will create an implementation of a UserDetailsService Bean and same will be
 * used by spring to call get the user details from the custom implementation (here our mysql).*/

@Service
public class UserAuthService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository.findByName(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getName())
                .password(user.getPassword())
                .roles(String.valueOf(user.getRole()))   // make sure role is like "ADMIN"
                .build();
    }

    public void addUser(User user) {
        try {
            System.out.println("Saving user...");
            user.setPassword(encoder.encode(user.getPassword()));
            userRepository.save(user);
            System.out.println("User saved successfully!");
        } catch (Exception e) {
            System.out.println("ERROR while saving user:");
            e.printStackTrace();
        }
    }
}