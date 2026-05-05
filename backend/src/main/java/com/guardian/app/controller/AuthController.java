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
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";
        
        try {
            System.out.println(">>> Intentando login manual para: [" + username + "]");
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (passwordEncoder.matches(password, user.getPassword())) {
                String token = user.getUsername() + ":" + user.getRole().name() + ":" + System.currentTimeMillis();
                System.out.println(">>> LOGIN EXITOSO: " + username);
                return ResponseEntity.ok(new LoginResponse(token, user.getRole().name(), user.getUsername()));
            } else {
                System.err.println("!!! Password incorrecto para: " + username);
                return ResponseEntity.status(401).body("Credenciales inválidas");
            }
        } catch (Exception e) {
            System.err.println("!!! Error crítico en login: " + e.getMessage());
            return ResponseEntity.status(500).body("Error del servidor: " + e.getMessage());
        }
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
        private final String username;
    }
}
