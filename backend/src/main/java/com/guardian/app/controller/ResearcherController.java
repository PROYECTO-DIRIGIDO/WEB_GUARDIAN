package com.guardian.app.controller;

import com.guardian.app.model.Patient;
import com.guardian.app.model.User;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/researcher")
@RequiredArgsConstructor
public class ResearcherController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @GetMapping("/patients")
    public List<Patient> getMyPatients(Authentication authentication) {
        User researcher = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return patientRepository.findByResearcher(researcher);
    }

    @PostMapping("/patients")
    public ResponseEntity<?> createPatient(@RequestBody PatientRequest request, Authentication authentication) {
        User researcher = userRepository.findByUsername(authentication.getName()).orElseThrow();
        
        Patient patient = Patient.builder()
                .studyCode(request.getStudyCode())
                .registrationDate(LocalDateTime.now())
                .researcher(researcher)
                .build();

        patientRepository.save(patient);
        return ResponseEntity.ok("Paciente " + request.getStudyCode() + " registrado");
    }

    @lombok.Data
    public static class PatientRequest {
        private String studyCode;
    }
}
