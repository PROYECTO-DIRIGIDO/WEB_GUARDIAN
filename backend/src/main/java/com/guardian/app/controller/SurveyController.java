package com.guardian.app.controller;

import com.guardian.app.model.QuestionType;
import com.guardian.app.model.Survey;
import com.guardian.app.service.SurveyService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para administración y consumo de protocolos psicométricos EMA.
 * Delega la lógica de negocio a SurveyService conforme a Clean Architecture.
 */
@RestController
@RequestMapping("/api/researcher/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @GetMapping
    public List<Survey> getMySurveys(Authentication authentication) {
        return surveyService.getSurveysForResearcher(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<?> createSurvey(@RequestBody SurveyRequest request, Authentication authentication) {
        Map<String, String> response = surveyService.createSurvey(request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateSurvey(@PathVariable Long id, Authentication authentication) {
        Map<String, String> response = surveyService.activateSurvey(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateSurvey(@PathVariable Long id, Authentication authentication) {
        Map<String, String> response = surveyService.deactivateSurvey(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSurvey(@PathVariable Long id) {
        Map<String, String> response = surveyService.deleteSurvey(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active/{studyCode}")
    public List<SurveyStatusResponse> getActiveSurveysForPatient(@PathVariable String studyCode) {
        return surveyService.getActiveSurveysForPatient(studyCode);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitSurvey(@RequestBody SurveyResponseRequest request, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        Map<String, String> resp = surveyService.submitSurveyResponse(request, username);
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
        private String studyCode;
        private Long surveyId;
        private Map<String, String> answers;
        private LocalDateTime timestamp;
    }

    @Data
    @lombok.AllArgsConstructor
    public static class SurveyStatusResponse {
        private Survey survey;
        private LocalDateTime lastResponse;
    }
}
