package com.guardian.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDTO {
    private Long id;
    private String studyCode;
    private String fullName;
    private String profilePicture;
    private LocalDateTime registrationDate;
    private boolean dailySurveyCompleted;
}
