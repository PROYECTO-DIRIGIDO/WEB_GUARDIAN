package com.guardian.app.repository;

import com.guardian.app.model.Patient;
import com.guardian.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByResearcher(User researcher);
}
