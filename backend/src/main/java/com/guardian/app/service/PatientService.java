package com.guardian.app.service;

import com.guardian.app.dto.PatientDTO;
import com.guardian.app.model.Patient;
import com.guardian.app.model.User;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.SurveyResponseRepository;
import com.guardian.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final SurveyResponseRepository surveyResponseRepository;

    @Transactional(readOnly = true)
    public List<PatientDTO> getPatientsForResearcher(String researcherUsername) {
        User researcher = userRepository.findByUsername(researcherUsername)
                .orElseThrow(() -> new IllegalArgumentException("Investigador no encontrado: " + researcherUsername));

        List<Patient> patients = patientRepository.findByResearcher(researcher);
        LocalDateTime todayStart = LocalDateTime.now().minusHours(24);

        return patients.stream().map(p -> {
            User patientUser = userRepository.findByUsername(p.getStudyCode()).orElse(null);
            boolean completedToday = surveyResponseRepository.existsByPatientAndTimestampAfter(p, todayStart);

            return PatientDTO.builder()
                    .id(p.getId())
                    .studyCode(p.getStudyCode())
                    .registrationDate(p.getRegistrationDate())
                    .fullName(patientUser != null ? patientUser.getFullName() : null)
                    .profilePicture(patientUser != null ? patientUser.getProfilePicture() : null)
                    .dailySurveyCompleted(completedToday)
                    .build();
        }).toList();
    }

    @Transactional
    public Patient registerPatient(String studyCode, String researcherUsername) {
        User researcher = userRepository.findByUsername(researcherUsername)
                .orElseThrow(() -> new IllegalArgumentException("Investigador no encontrado: " + researcherUsername));

        Patient patient = Patient.builder()
                .studyCode(studyCode)
                .registrationDate(LocalDateTime.now())
                .researcher(researcher)
                .build();

        return patientRepository.save(patient);
    }
}
