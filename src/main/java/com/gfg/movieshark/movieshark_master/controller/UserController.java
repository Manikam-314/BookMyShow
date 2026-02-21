package com.gfg.movieshark.movieshark_master.controller;

import com.gfg.movieshark.movieshark_master.resource.UserResource;
import com.gfg.movieshark.movieshark_master.service.UserService;
import jakarta.validation.constraints.Min;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<UserResource> addUser(@RequestBody UserResource userResource) {
        return ResponseEntity.ok(userService.addUser(userResource));
    }

    // ✅ ADD THIS
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ KEEP THIS
    @GetMapping("/{id}")
    public ResponseEntity<UserResource> getUser(
            @PathVariable @Min(value = 1, message = "User Id Cannot be -ve") long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResource> login(@RequestBody UserResource loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest.getEmail(), loginRequest.getPassword()));
    }
}
