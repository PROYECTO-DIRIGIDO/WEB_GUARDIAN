package com.guardian.app.controller;

import com.guardian.app.model.GloveData;
import com.guardian.app.model.Patient;
import com.guardian.app.model.SurveyResponse;
import com.guardian.app.repository.GloveDataRepository;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.SurveyResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/researcher/history")
@RequiredArgsConstructor
public class HistoryController {

    private final PatientRepository patientRepository;
    private final GloveDataRepository gloveDataRepository;
    private final SurveyResponseRepository surveyResponseRepository;

    @GetMapping("/{patientId}")
    public Map<String, Object> getPatientHistory(@PathVariable Long patientId) {
        Patient patient = patientRepository.findById(patientId).orElseThrow();
        
        List<GloveData> gloveData = gloveDataRepository.findByPatientOrderByTimestampDesc(patient);
        List<SurveyResponse> surveyResponses = surveyResponseRepository.findByPatientOrderByTimestampDesc(patient);

        // Calcular Estadísticas (Medias)
        double avgHrv = gloveData.stream().mapToDouble(d -> d.getHrvValue() != null ? d.getHrvValue() : 0.0).average().orElse(0.0);
        double avgPulse = gloveData.stream().mapToDouble(d -> d.getHeartRate() != null ? d.getHeartRate() : 0.0).average().orElse(0.0);
        double avgSdnn = gloveData.stream().mapToDouble(d -> d.getSdnn() != null ? d.getSdnn() : 0.0).average().orElse(0.0);
        double avgRmssd = gloveData.stream().mapToDouble(d -> d.getRmssd() != null ? d.getRmssd() : 0.0).average().orElse(0.0);

        Map<String, Object> history = new HashMap<>();
        history.put("glove", gloveData);
        history.put("surveys", surveyResponses);
        
        Map<String, Double> statistics = new HashMap<>();
        statistics.put("avgHrv", Math.round(avgHrv * 100.0) / 100.0);
        statistics.put("avgPulse", Math.round(avgPulse * 10.0) / 10.0);
        statistics.put("avgSdnn", Math.round(avgSdnn * 100.0) / 100.0);
        statistics.put("avgRmssd", Math.round(avgRmssd * 100.0) / 100.0);
        history.put("statistics", statistics);
        
        return history;
    }
}
