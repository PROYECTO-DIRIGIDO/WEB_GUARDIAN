package com.guardian.app.controller;

import com.guardian.app.model.Patient;
import com.guardian.app.model.User;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.UserRepository;
import com.guardian.app.repository.SurveyResponseRepository;
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
    private final SurveyResponseRepository surveyResponseRepository;

    @GetMapping("/patients")
    public List<com.guardian.app.dto.PatientDTO> getMyPatients(Authentication authentication) {
        User researcher = userRepository.findByUsername(authentication.getName()).orElseThrow();
        List<Patient> patients = patientRepository.findByResearcher(researcher);
        // Usar una ventana rodante de 24 horas para evitar problemas de desfase de zona horaria (UTC vs Local) en el servidor.
        java.time.LocalDateTime todayStart = java.time.LocalDateTime.now().minusHours(24);
        
        return patients.stream().map(p -> {
            User patientUser = userRepository.findByUsername(p.getStudyCode()).orElse(null);
            boolean completedToday = surveyResponseRepository.existsByPatientAndTimestampAfter(p, todayStart);
            
            return com.guardian.app.dto.PatientDTO.builder()
                    .id(p.getId())
                    .studyCode(p.getStudyCode())
                    .registrationDate(p.getRegistrationDate())
                    .fullName(patientUser != null ? patientUser.getFullName() : null)
                    .profilePicture(patientUser != null ? patientUser.getProfilePicture() : null)
                    .dailySurveyCompleted(completedToday)
                    .build();
        }).toList();
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
