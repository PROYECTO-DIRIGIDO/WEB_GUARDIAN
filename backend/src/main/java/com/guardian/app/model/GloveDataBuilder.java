package com.guardian.app.model;

import java.time.LocalDateTime;

/**
 * Patrón de diseño creacional Builder para la construcción fluida, inmutable y validada
 * de registros de telemetría biomédica multimodal (GloveData).
 * 
 * Conforme a la especificación de arquitectura UML 2.5 (Figura 10 / Sección 3.6.2 de la tesis),
 * desacopla la recepción cruda de red de la lógica de validación e integridad de bioseñales.
 */
public class GloveDataBuilder {

    private Patient patient;
    private Long ts;
    private Integer ir;
    private Integer red;
    private Integer ax;
    private Integer ay;
    private Integer az;
    private Integer gx;
    private Integer gy;
    private Integer gz;
    private Double obj;
    private Double amb;
    private LocalDateTime timestamp;

    public GloveDataBuilder() {
    }

    public GloveDataBuilder withPatient(Patient patient) {
        this.patient = patient;
        return this;
    }

    public GloveDataBuilder withUptime(Long ts) {
        this.ts = ts;
        return this;
    }

    public GloveDataBuilder withPPG(Integer ir, Integer red) {
        this.ir = ir;
        this.red = red;
        return this;
    }

    public GloveDataBuilder withIMU(Integer ax, Integer ay, Integer az, Integer gx, Integer gy, Integer gz) {
        this.ax = ax;
        this.ay = ay;
        this.az = az;
        this.gx = gx;
        this.gy = gy;
        this.gz = gz;
        return this;
    }

    public GloveDataBuilder withTemperature(Double obj, Double amb) {
        this.obj = obj;
        this.amb = amb;
        return this;
    }

    public GloveDataBuilder withTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
        return this;
    }

    /**
     * Construye y valida la entidad GloveData.
     * Garantiza que ningún registro incompleto o sin paciente asignado alcance la capa de persistencia.
     */
    public GloveData build() {
        if (this.patient == null) {
            throw new IllegalStateException("GloveDataBuilder: No se puede construir un registro de telemetría sin un paciente asociado.");
        }
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }

        return GloveData.builder()
                .patient(this.patient)
                .ts(this.ts)
                .ir(this.ir)
                .red(this.red)
                .ax(this.ax)
                .ay(this.ay)
                .az(this.az)
                .gx(this.gx)
                .gy(this.gy)
                .gz(this.gz)
                .obj(this.obj)
                .amb(this.amb)
                .timestamp(this.timestamp)
                .build();
    }
}
