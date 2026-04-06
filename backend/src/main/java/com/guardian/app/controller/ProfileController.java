package com.guardian.app.controller;

import com.guardian.app.model.User;
import com.guardian.app.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<User> getMyProfile(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        
        user.setFullName(request.getFullName());
        user.setPosition(request.getPosition());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setWorkplace(request.getWorkplace());
        
        // Mantener la foto generica si no se envía una
        if (request.getProfilePicture() != null && !request.getProfilePicture().isEmpty()) {
            user.setProfilePicture(request.getProfilePicture());
        }

        userRepository.save(user);
        return ResponseEntity.ok("Perfil actualizado con éxito");
    }

    @Data
    public static class ProfileUpdateRequest {
        private String fullName;
        private String position;
        private String phone;
        private String email;
        private String workplace;
        private String profilePicture;
    }
}
