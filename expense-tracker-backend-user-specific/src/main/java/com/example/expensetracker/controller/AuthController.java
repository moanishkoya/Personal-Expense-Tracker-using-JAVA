package com.example.expensetracker.controller;

import com.example.expensetracker.entity.User;
import com.example.expensetracker.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    public static class SignupRequest {
        public String username;
        public String password;
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class AuthResponse {
        public Long id;
        public String username;
        public String message;

        public AuthResponse(Long id, String username, String message) {
            this.id = id;
            this.username = username;
            this.message = message;
        }
    }

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest request) {
        User user = userService.signup(request.username, request.password);
        return new AuthResponse(user.getId(), user.getUsername(), "User registered successfully");
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        User user = userService.login(request.username, request.password);
        return new AuthResponse(user.getId(), user.getUsername(), "Login successful");
    }
}
