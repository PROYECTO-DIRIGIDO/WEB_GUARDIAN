package com.guardian.app.service;

import com.guardian.app.dto.GloveDataRequest;
import com.guardian.app.model.GloveData;
import com.guardian.app.model.Patient;
import com.guardian.app.model.Role;
import com.guardian.app.model.User;
import com.guardian.app.repository.GloveDataRepository;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de negocio desacoplado para la ingesta y persistencia de telemetría del guante IoMT.
 * Extrae la lógica de persistencia y resolución de pacientes fuera de la capa web/controlador.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GloveDataService {

    private final GloveDataRepository gloveDataRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional
    public int processGloveData(List<GloveDataRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return 0;
        }

        // Obtener o registrar automáticamente el paciente por studyCode
        String rawCode = requests.get(0).getStudyCode();
        final String studyCode = (rawCode != null && !rawCode.isBlank()) ? rawCode.trim() : "test";

        Patient patient = patientRepository.findByStudyCode(studyCode)
                .orElseGet(() -> {
                    log.info("Auto-registrando paciente para telemetría: {}", studyCode);
                    User researcher = userRepository.findByRole(Role.RESEARCHER)
                            .stream().findFirst().orElse(null);
                    Patient newPatient = Patient.builder()
                            .studyCode(studyCode)
                            .registrationDate(LocalDateTime.now())
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
                .timestamp(req.getTimestamp() != null ? req.getTimestamp() : LocalDateTime.now())
                .build()
        ).collect(Collectors.toList());

        gloveDataRepository.saveAll(gloveDataList);
        return gloveDataList.size();
    }
}
