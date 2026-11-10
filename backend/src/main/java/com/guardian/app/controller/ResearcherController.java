package com.guardian.app.controller;

import com.guardian.app.dto.PatientDTO;
import com.guardian.app.model.Patient;
import com.guardian.app.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/researcher")
@RequiredArgsConstructor
public class ResearcherController {

    private final PatientService patientService;

    @GetMapping("/patients")
    public List<PatientDTO> getMyPatients(Authentication authentication) {
        return patientService.getPatientsForResearcher(authentication.getName());
    }

    @PostMapping("/patients")
    public ResponseEntity<?> createPatient(@RequestBody PatientRequest request, Authentication authentication) {
        Patient patient = patientService.registerPatient(request.getStudyCode(), authentication.getName());
        return ResponseEntity.ok("Paciente " + patient.getStudyCode() + " registrado exitosamente");
    }

    @lombok.Data
    public static class PatientRequest {
        private String studyCode;
    }
}
