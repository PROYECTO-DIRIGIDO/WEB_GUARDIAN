package com.guardian.app.controller;

import com.guardian.app.model.Survey;
import com.guardian.app.model.SurveyQuestion;
import com.guardian.app.model.QuestionType;
import com.guardian.app.model.User;
import com.guardian.app.model.Patient;
import com.guardian.app.model.SurveyResponse;
import com.guardian.app.repository.SurveyRepository;
import com.guardian.app.repository.UserRepository;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.SurveyResponseRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/researcher/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final SurveyResponseRepository surveyResponseRepository;

    @GetMapping
    public List<Survey> getMySurveys(Authentication authentication) {
        User researcher = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return surveyRepository.findByCreator(researcher);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createSurvey(@RequestBody SurveyRequest request, Authentication authentication) {
        User researcher = userRepository.findByUsername(authentication.getName()).orElseThrow();

        Survey survey = new Survey();
        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());
        survey.setStatus(Survey.SurveyStatus.PENSADA);
        survey.setCreator(researcher);


        List<SurveyQuestion> questions = request.getQuestions().stream()
                .map(qReq -> SurveyQuestion.builder()
                        .text(qReq.getText())
                        .type(qReq.getType())
                        .options(qReq.getOptions())
                        .survey(survey)
                        .build())
                .collect(Collectors.toList());
        
        survey.setQuestions(questions);

        surveyRepository.save(survey);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Protocolo '" + request.getTitle() + "' guardado.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/activate")
    @Transactional
    public ResponseEntity<?> activateSurvey(@PathVariable Long id, Authentication authentication) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        survey.setStatus(Survey.SurveyStatus.VIGENTE);
        surveyRepository.save(survey);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Protocolo '" + survey.getTitle() + "' ahora está VIGENTE.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/deactivate")
    @Transactional
    public ResponseEntity<?> deactivateSurvey(@PathVariable Long id, Authentication authentication) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        survey.setStatus(Survey.SurveyStatus.PENSADA);
        surveyRepository.save(survey);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Protocolo '" + survey.getTitle() + "' movido a borradores.");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSurvey(@PathVariable Long id) {
        surveyRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Protocolo eliminado correctamente.");
        return ResponseEntity.ok(response);
    }

    // Endpoint para que el paciente consuma sus encuestas activas con su estado de cumplimiento
    @GetMapping("/active/{studyCode}")
    public List<SurveyStatusResponse> getActiveSurveysForPatient(@PathVariable String studyCode) {
        Patient patient = patientRepository.findByStudyCode(studyCode)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
        List<Survey> activeSurveys = surveyRepository.findByCreatorAndStatus(patient.getResearcher(), Survey.SurveyStatus.VIGENTE);
        
        return activeSurveys.stream().map(s -> {
            LocalDateTime last = surveyResponseRepository.findTopByPatientAndSurveyOrderByTimestampDesc(patient, s)
                    .map(SurveyResponse::getTimestamp)
                    .orElse(null);
            return new SurveyStatusResponse(s, last);
        }).collect(Collectors.toList());
    }

    @PostMapping("/submit")
    @Transactional
    public ResponseEntity<?> submitSurvey(@RequestBody SurveyResponseRequest request, Authentication authentication) {
        String studyCode = authentication.getName();
        Patient patient = patientRepository.findByStudyCode(studyCode)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));
        
        SurveyResponse response = SurveyResponse.builder()
                .patient(patient)
                .survey(survey)
                .answers(request.getAnswers())
                .timestamp(LocalDateTime.now())
                .build();
        
        surveyResponseRepository.save(response);
        
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Encuesta '" + survey.getTitle() + "' enviada correctamente.");
        return ResponseEntity.ok(resp);
    }

    @Data
    public static class SurveyRequest {
        private String title;
        private String description;
        private List<QuestionRequest> questions;
    }

    @Data
    public static class QuestionRequest {
        private String text;
        private QuestionType type;
        private List<String> options;
    }

    @Data
    public static class SurveyResponseRequest {
        private Long surveyId;
        private Map<String, String> answers;
    }

    @Data
    @lombok.AllArgsConstructor
    public static class SurveyStatusResponse {
        private Survey survey;
        private LocalDateTime lastResponse;
    }
}
