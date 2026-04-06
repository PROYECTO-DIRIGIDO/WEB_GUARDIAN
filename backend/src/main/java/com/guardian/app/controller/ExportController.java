package com.guardian.app.controller;

import com.guardian.app.model.GloveData;
import com.guardian.app.model.Patient;
import com.guardian.app.model.SurveyResponse;
import com.guardian.app.repository.GloveDataRepository;
import com.guardian.app.repository.PatientRepository;
import com.guardian.app.repository.SurveyResponseRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/researcher/export")
@RequiredArgsConstructor
public class ExportController {

    private final PatientRepository patientRepository;
    private final GloveDataRepository gloveDataRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/glove/{patientId}")
    public ResponseEntity<byte[]> exportGloveData(@PathVariable Long patientId) throws IOException {
        Patient patient = patientRepository.findById(patientId).orElseThrow();
        List<GloveData> dataList = gloveDataRepository.findByPatientOrderByTimestampDesc(patient);

        try (Workbook workbook = new XSSFWorkbook()) {
            // Agrupar por fecha
            Map<String, List<GloveData>> groupedData = dataList.stream()
                .collect(java.util.stream.Collectors.groupingBy(d -> d.getTimestamp().toLocalDate().toString()));

            for (Map.Entry<String, List<GloveData>> entry : groupedData.entrySet()) {
                Sheet sheet = workbook.createSheet(entry.getKey());
                
                // Header
                Row header = sheet.createRow(0);
                String[] columns = {"Hora", "HRV (ms)", "Pulso (bpm)", "SDNN", "RMSSD", "Temperatura (C)"};
                for (int i = 0; i < columns.length; i++) {
                    Cell cell = header.createCell(i);
                    cell.setCellValue(columns[i]);
                    CellStyle style = workbook.createCellStyle();
                    Font font = workbook.createFont();
                    font.setBold(true);
                    style.setFont(font);
                    cell.setCellStyle(style);
                }

                // Data
                int rowIdx = 1;
                for (GloveData data : entry.getValue()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(data.getTimestamp().toLocalTime().toString());
                    row.createCell(1).setCellValue(data.getHrvValue() != null ? data.getHrvValue() : 0.0);
                    row.createCell(2).setCellValue(data.getHeartRate() != null ? data.getHeartRate() : 0);
                    row.createCell(3).setCellValue(data.getSdnn() != null ? data.getSdnn() : 0.0);
                    row.createCell(4).setCellValue(data.getRmssd() != null ? data.getRmssd() : 0.0);
                    row.createCell(5).setCellValue(data.getTemperature() != null ? data.getTemperature() : 0.0);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            
            String filename = "Scientific_GloveData_" + patient.getStudyCode() + ".xlsx";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        }
    }

    @GetMapping("/surveys/{patientId}")
    public ResponseEntity<byte[]> exportSurveyData(@PathVariable Long patientId) throws IOException {
        Patient patient = patientRepository.findById(patientId).orElseThrow();
        List<SurveyResponse> responses = surveyResponseRepository.findByPatientOrderByTimestampDesc(patient);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Dataset de Encuestas");

            if (responses.isEmpty()) {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                workbook.write(out);
                return ResponseEntity.ok().body(out.toByteArray());
            }

            // Identificar todas las preguntas únicas para las columnas
            List<String> questions = responses.stream()
                .flatMap(r -> r.getAnswers().keySet().stream())
                .distinct()
                .toList();

            // Header
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Fecha");
            header.createCell(1).setCellValue("Hora");
            header.createCell(2).setCellValue("Protocolo");
            for (int i = 0; i < questions.size(); i++) {
                header.createCell(i + 3).setCellValue(questions.get(i));
            }

            // Data rows
            int rowIdx = 1;
            for (SurveyResponse resp : responses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(resp.getTimestamp().toLocalDate().toString());
                row.createCell(1).setCellValue(resp.getTimestamp().toLocalTime().toString());
                row.createCell(2).setCellValue(resp.getSurvey().getTitle());
                
                for (int i = 0; i < questions.size(); i++) {
                    String answer = resp.getAnswers().get(questions.get(i));
                    row.createCell(i + 3).setCellValue(answer != null ? answer : "-");
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            String filename = "Survey_Matrix_" + patient.getStudyCode() + ".xlsx";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        }
    }
}
