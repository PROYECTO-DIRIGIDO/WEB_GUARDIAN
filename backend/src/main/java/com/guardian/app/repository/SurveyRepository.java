package com.guardian.app.repository;

import com.guardian.app.model.Patient;
import com.guardian.app.model.Survey;
import com.guardian.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    List<Survey> findByCreator(User creator);
    List<Survey> findByStatus(Survey.SurveyStatus status);
    List<Survey> findByCreatorAndStatus(User creator, Survey.SurveyStatus status);
}
