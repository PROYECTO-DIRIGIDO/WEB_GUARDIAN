package com.guardian.app.controller;

import com.guardian.app.dto.GloveDataRequest;
import com.guardian.app.model.GloveData;
import com.guardian.app.model.Patient;
import com.guardian.app.repository.GloveDataRepository;
import com.guardian.app.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/researcher/glove")
@RequiredArgsConstructor
public class GloveDataController {

    private final GloveDataRepository gloveDataRepository;
    private final PatientRepository patientRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitGloveData(@RequestBody List<GloveDataRequest> requests) {
        if (requests.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "No hay datos para procesar"));
        }

        // Obtener el paciente por el studyCode del primer registro (asumiendo que todos son del mismo)
        String studyCode = requests.get(0).getStudyCode();
        Patient patient = patientRepository.findByStudyCode(studyCode)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con código: " + studyCode));

        List<GloveData> gloveDataList = requests.stream().map(req -> GloveData.builder()
                .patient(patient)
                .ts(req.getTs())
                .ir(req.getIr())
                .red(req.getRed())
                .ax(req.getAx())
                .ay(req.getAy())
                .az(req.getAz())
                .gx(req.getGx())
                .gy(req.getGy())
                .gz(req.getGz())
                .obj(req.getObj())
                .amb(req.getAmb())
                .timestamp(req.getTimestamp())
                .build()
        ).collect(Collectors.toList());

        gloveDataRepository.saveAll(gloveDataList);

        return ResponseEntity.ok(Map.of(
            "message", "Datos de telemetría procesados con éxito",
            "count", gloveDataList.size()
        ));
    }
}
