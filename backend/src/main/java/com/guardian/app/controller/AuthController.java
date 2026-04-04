package com.guardian.app.controller;

import com.guardian.app.model.User;
import com.guardian.app.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        
        // Simplificado para el demo inicial: Retornamos el rol y un "token" dummy
        return ResponseEntity.ok(new LoginResponse("dummy-jwt-token", user.getRole().name()));
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @RequiredArgsConstructor
    public static class LoginResponse {
        private final String token;
        private final String role;
    }
}
