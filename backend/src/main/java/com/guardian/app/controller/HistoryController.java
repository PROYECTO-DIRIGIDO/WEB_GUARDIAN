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
        double avgIr = gloveData.stream().mapToDouble(d -> d.getIr() != null ? d.getIr() : 0.0).average().orElse(0.0);
        double avgRed = gloveData.stream().mapToDouble(d -> d.getRed() != null ? d.getRed() : 0.0).average().orElse(0.0);
        double avgTemp = gloveData.stream().mapToDouble(d -> d.getObj() != null ? d.getObj() : 0.0).average().orElse(0.0);

        Map<String, Object> history = new HashMap<>();
        history.put("glove", gloveData);
        history.put("surveys", surveyResponses);
        
        Map<String, Double> statistics = new HashMap<>();
        statistics.put("avgIr", Math.round(avgIr * 100.0) / 100.0);
        statistics.put("avgRed", Math.round(avgRed * 100.0) / 100.0);
        statistics.put("avgTemp", Math.round(avgTemp * 100.0) / 100.0);
        history.put("statistics", statistics);
        
        return history;
    }
}
