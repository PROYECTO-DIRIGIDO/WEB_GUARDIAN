package com.guardian.app.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GloveDataRequest {
    private String studyCode;
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
}
