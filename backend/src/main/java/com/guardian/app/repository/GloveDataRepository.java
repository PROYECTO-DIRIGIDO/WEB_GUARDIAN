package com.guardian.app.repository;

import com.guardian.app.model.GloveData;
import com.guardian.app.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GloveDataRepository extends JpaRepository<GloveData, Long> {
    List<GloveData> findByPatientOrderByTimestampDesc(Patient patient);
}
