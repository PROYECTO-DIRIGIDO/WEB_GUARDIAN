package com.guardian.app.service;

import com.guardian.app.controller.SurveyController.QuestionRequest;
import com.guardian.app.controller.SurveyController.SurveyRequest;
import com.guardian.app.controller.SurveyController.SurveyResponseRequest;
import com.guardian.app.controller.SurveyController.SurveyStatusResponse;
import com.guardian.app.model.*;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.SurveyRepository;
import com.guardian.app.repository.SurveyResponseRepository;
import com.guardian.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio de negocio para la gestión de protocolos psicométricos EMA y registro de respuestas.
 * Desacoplado de la capa web conforme al modelo C4 / Diagrama de Componentes UML 2.5.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final SurveyResponseRepository surveyResponseRepository;

    public List<Survey> getSurveysForResearcher(String username) {
        User researcher = userRepository.findByUsername(username).orElseThrow();
        return surveyRepository.findByCreator(researcher);
    }

    @Transactional
    public Map<String, String> createSurvey(SurveyRequest request, String username) {
        User researcher = userRepository.findByUsername(username).orElseThrow();

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
        return response;
    }

    @Transactional
    public Map<String, String> activateSurvey(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));
        survey.setStatus(Survey.SurveyStatus.VIGENTE);
        surveyRepository.save(survey);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Protocolo '" + survey.getTitle() + "' ahora está VIGENTE.");
        return response;
    }

    @Transactional
    public Map<String, String> deactivateSurvey(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));
        survey.setStatus(Survey.SurveyStatus.PENSADA);
        surveyRepository.save(survey);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Protocolo '" + survey.getTitle() + "' movido a borradores.");
        return response;
    }

    @Transactional
    public Map<String, String> deleteSurvey(Long id) {
        surveyRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Protocolo eliminado correctamente.");
        return response;
    }

    public List<SurveyStatusResponse> getActiveSurveysForPatient(String studyCode) {
        String code = (studyCode != null && !studyCode.isBlank()) ? studyCode.trim() : "test";
        Patient patient = patientRepository.findByStudyCode(code)
                .orElseGet(() -> {
                    log.info("Auto-registrando paciente al consultar encuestas: {}", code);
                    User researcher = userRepository.findByRole(Role.RESEARCHER)
                            .stream().findFirst().orElse(null);
                    Patient newPatient = Patient.builder()
                            .studyCode(code)
                            .registrationDate(LocalDateTime.now())
                            .researcher(researcher)
                            .build();
                    return patientRepository.save(newPatient);
                });

        List<Survey> activeSurveys = (patient.getResearcher() != null)
                ? surveyRepository.findByCreatorAndStatus(patient.getResearcher(), Survey.SurveyStatus.VIGENTE)
                : surveyRepository.findByStatus(Survey.SurveyStatus.VIGENTE);

        if (activeSurveys == null || activeSurveys.isEmpty()) {
            activeSurveys = surveyRepository.findByStatus(Survey.SurveyStatus.VIGENTE);
        }

        return activeSurveys.stream().map(s -> {
            LocalDateTime last = surveyResponseRepository.findTopByPatientAndSurveyOrderByTimestampDesc(patient, s)
                    .map(SurveyResponse::getTimestamp)
                    .orElse(null);
            return new SurveyStatusResponse(s, last);
        }).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, String> submitSurveyResponse(SurveyResponseRequest request, String fallbackUsername) {
        String rawCode = (request.getStudyCode() != null && !request.getStudyCode().isBlank())
                ? request.getStudyCode().trim()
                : (fallbackUsername != null ? fallbackUsername.trim() : "test");
        final String studyCode = rawCode;

        Patient patient = patientRepository.findByStudyCode(studyCode)
                .orElseGet(() -> {
                    log.info("Auto-registrando paciente para encuesta: {}", studyCode);
                    User researcher = userRepository.findByRole(Role.RESEARCHER)
                            .stream().findFirst().orElse(null);
                    Patient newPatient = Patient.builder()
                            .studyCode(studyCode)
                            .registrationDate(LocalDateTime.now())
                            .researcher(researcher)
                            .build();
                    return patientRepository.save(newPatient);
                });

        Survey survey = (request.getSurveyId() != null ? surveyRepository.findById(request.getSurveyId()) : java.util.Optional.<Survey>empty())
                .orElseGet(() -> surveyRepository.findByStatus(Survey.SurveyStatus.VIGENTE).stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("Encuesta no encontrada")));

        SurveyResponse response = SurveyResponse.builder()
                .patient(patient)
                .survey(survey)
                .answers(request.getAnswers())
                .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                .build();

        surveyResponseRepository.save(response);

        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Encuesta '" + survey.getTitle() + "' enviada correctamente.");
        return resp;
    }
}
