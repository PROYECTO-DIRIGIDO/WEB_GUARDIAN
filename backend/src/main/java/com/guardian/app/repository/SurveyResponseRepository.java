package com.guardian.app.repository;

import com.guardian.app.model.Patient;
import com.guardian.app.model.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    List<SurveyResponse> findByPatientOrderByTimestampDesc(Patient patient);
    
    // Obtener la respuesta más reciente a un protocolo específico
    Optional<SurveyResponse> findTopByPatientAndSurveyOrderByTimestampDesc(Patient patient, com.guardian.app.model.Survey survey);
    
    // Verificar si existe alguna respuesta desde una fecha específica (ej: hoy medianoche)
    boolean existsByPatientAndTimestampAfter(Patient patient, LocalDateTime timestamp);
}
