package com.guardian.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "glove_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GloveData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private Double hrvValue;
    private Integer heartRate;
    private Double temperature;
    
    // Métricas Científicas
    private Double sdnn;
    private Double rmssd;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
