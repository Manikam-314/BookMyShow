package com.gfg.movieshark.movieshark_master.service;


import com.gfg.movieshark.movieshark_master.domain.User;
import com.gfg.movieshark.movieshark_master.repository.UserRepository;
import com.gfg.movieshark.movieshark_master.resource.UserResource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResource addUser(UserResource userResource) {

        if (userRepository.existsByMobile(userResource.getMobile())) {
            return userResource;
        }

        User user = User.toEntity(userResource);
        user = userRepository.save(user);

        log.info("Added New User " + user);

        return User.toResource(user);
    }

    public UserResource getUser(long id) {
        return userRepository.findById(id)
                .map(User::toResource)
                .orElseThrow(() ->
                        new EntityNotFoundException("User Not Found with ID: " + id)
                );
    }

    // ✅ ADD THIS
    public List<UserResource> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(User::toResource)
                .collect(Collectors.toList());
    }
}
