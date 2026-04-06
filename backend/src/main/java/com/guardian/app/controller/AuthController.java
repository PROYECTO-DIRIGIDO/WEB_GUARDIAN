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
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();
        try {
            System.out.println(">>> Intento de login: [" + username + "] (longitud clave: " + password.length() + ")");
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            
            User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
            
            // Retornamos el nombre de usuario y rol concatenados como token para el prototipo
            String token = user.getUsername() + ":" + user.getRole().name();
            System.out.println(">>> Login exitoso para: " + request.getUsername());
            return ResponseEntity.ok(new LoginResponse(token, user.getRole().name(), user.getUsername()));
        } catch (Exception e) {
            System.err.println("!!! Error en autenticación: " + e.getMessage());
            e.printStackTrace(); // Esto nos dará todo el detalle en el log de Docker
            return ResponseEntity.status(401).body("Error: " + e.getMessage());
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
