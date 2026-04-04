package com.guardian.app.controller;

import com.guardian.app.model.Role;
import com.guardian.app.model.User;
import com.guardian.app.repository.UserRepository;
import com.guardian.app.model.Patient;
import com.guardian.app.repository.PatientRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("El usuario ya existe");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole()))
                .canExport(request.isCanExport())
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok("Usuario " + request.getUsername() + " creado con éxito");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("Usuario eliminado");
    }

    @PostMapping("/patients")
    public ResponseEntity<?> createPatient(@RequestBody PatientRequest request) {
        if (userRepository.findByUsername(request.getStudyCode()).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un acceso creado para este código de estudio");
        }

        // 1. Registro de Usuario (PATIENT)
        User patientUser = User.builder()
                .username(request.getStudyCode())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .canExport(false)
                .build();
        userRepository.save(patientUser);

        // 2. Registro de Paciente (sin investigador inicial)
        Patient patient = Patient.builder()
                .studyCode(request.getStudyCode())
                .registrationDate(LocalDateTime.now())
                .researcher(null)
                .build();
        patientRepository.save(patient);

        return ResponseEntity.ok("Paciente " + request.getStudyCode() + " registrado con acceso para App.");
    }

    @PostMapping("/assign-patient")
    public ResponseEntity<?> assignPatient(@RequestBody PatientAssignmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
                
        User researcher = userRepository.findById(request.getResearcherId())
                .orElseThrow(() -> new RuntimeException("Investigador no encontrado"));

        if (!researcher.getRole().equals(Role.RESEARCHER)) {
            return ResponseEntity.badRequest().body("El usuario seleccionado no es un investigador");
        }

        patient.setResearcher(researcher);
        patientRepository.save(patient);
        
        return ResponseEntity.ok("Paciente " + patient.getStudyCode() + " vinculado a " + researcher.getUsername());
    }

    @PostMapping("/unassign-patient/{id}")
    public ResponseEntity<?> unassignPatient(@PathVariable Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
        patient.setResearcher(null);
        patientRepository.save(patient);
        
        return ResponseEntity.ok("Paciente " + patient.getStudyCode() + " desvinculado con éxito");
    }

    @GetMapping("/patients")
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        patientRepository.deleteById(id);
        return ResponseEntity.ok("Registro de paciente eliminado");
    }

    @Data
    public static class PatientAssignmentRequest {
        private Long patientId;
        private Long researcherId;
    }

    @Data
    public static class PatientRequest {
        private String studyCode;
        private String password;
    }

    @Data
    public static class UserRequest {
        private String username;
        private String password;
        private String role;
        private boolean canExport;
    }
}
