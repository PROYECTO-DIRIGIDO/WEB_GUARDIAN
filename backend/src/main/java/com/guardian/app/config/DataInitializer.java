package com.guardian.app.config;

import com.guardian.app.model.Role;
import com.guardian.app.model.User;
import com.guardian.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .canExport(true)
                    .build();
            userRepository.save(admin);
            System.out.println(">>> 'Admin Supremo' creado con éxito: admin/admin123");
        }
    }
}
