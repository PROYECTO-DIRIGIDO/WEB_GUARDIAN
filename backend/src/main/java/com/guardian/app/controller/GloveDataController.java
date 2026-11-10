package com.guardian.app.controller;

import com.guardian.app.dto.GloveDataRequest;
import com.guardian.app.service.GloveDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para recepción de telemetría biomédica desde el Gateway Móvil.
 * Delegación limpia hacia GloveDataService siguiendo principios SOLID y Clean Architecture.
 */
@RestController
@RequestMapping("/api/researcher/glove")
@RequiredArgsConstructor
public class GloveDataController {

    private final GloveDataService gloveDataService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitGloveData(@RequestBody List<GloveDataRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "No hay datos para procesar"));
        }

        int processedCount = gloveDataService.processGloveData(requests);

        return ResponseEntity.ok(Map.of(
            "message", "Datos de telemetría procesados con éxito",
            "count", processedCount
        ));
    }
}
