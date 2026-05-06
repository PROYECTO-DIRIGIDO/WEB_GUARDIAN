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

    private Long ts;      // Uptime en ms del dispositivo
    private Integer ir;   // PPG Infrarrojo
    private Integer red;  // PPG Rojo
    
    // Acelerómetro
    private Integer ax;
    private Integer ay;
    private Integer az;
    
    // Giroscopio
    private Integer gx;
    private Integer gy;
    private Integer gz;
    
    // Temperaturas
    private Double obj;   // Temperatura Persona (ºC)
    private Double amb;   // Temperatura Ambiente (ºC)

    @Column(nullable = false)
    private LocalDateTime timestamp;  // Fecha/Hora del Celular al recibir
}
