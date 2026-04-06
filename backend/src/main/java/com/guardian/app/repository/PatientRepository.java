package com.guardian.app.repository;

import com.guardian.app.model.Patient;
import com.guardian.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByResearcher(User researcher);
    Optional<Patient> findByStudyCode(String studyCode);
}
