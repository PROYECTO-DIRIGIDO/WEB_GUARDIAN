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
    private final com.guardian.app.repository.UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitGloveData(@RequestBody List<GloveDataRequest> requests) {
        if (requests.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "No hay datos para procesar"));
        }

        // Obtener o registrar automáticamente el paciente por studyCode
        String rawCode = requests.get(0).getStudyCode();
        final String studyCode = (rawCode != null && !rawCode.isBlank()) ? rawCode.trim() : "test";
        
        Patient patient = patientRepository.findByStudyCode(studyCode)
                .orElseGet(() -> {
                    System.out.println(">>> Auto-registrando paciente para telemetría: " + studyCode);
                    com.guardian.app.model.User researcher = userRepository.findByRole(com.guardian.app.model.Role.RESEARCHER)
                            .stream().findFirst().orElse(null);
                    Patient newPatient = Patient.builder()
                            .studyCode(studyCode)
                            .registrationDate(java.time.LocalDateTime.now())
                            .researcher(researcher)
                            .build();
                    return patientRepository.save(newPatient);
                });

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
