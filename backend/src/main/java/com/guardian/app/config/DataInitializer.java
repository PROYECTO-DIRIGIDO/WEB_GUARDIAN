package com.guardian.app.config;

import com.guardian.app.model.*;
import com.guardian.app.repository.*;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final GloveDataRepository gloveDataRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final SurveyRepository surveyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = userRepository.findByUsername("admin").orElse(new User());
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setCanExport(true);
        admin.setFullName("Administrador Central");
        admin.setProfilePicture("https://ui-avatars.com/api/?name=Admin&background=008080&color=fff");
        userRepository.save(admin);
        System.out.println(">>> Credenciales de 'admin' sincronizadas: admin / admin123");

        // Crear paciente de prueba universal
        User testPatient = userRepository.findByUsername("test").orElse(new User());
        testPatient.setUsername("test");
        testPatient.setPassword(passwordEncoder.encode("test123"));
        testPatient.setRole(Role.PATIENT);
        testPatient.setCanExport(false);
        testPatient.setFullName("Paciente de Prueba");
        testPatient.setProfilePicture("https://ui-avatars.com/api/?name=Paciente&background=40E0D0&color=fff");
        userRepository.save(testPatient);
        System.out.println(">>> Paciente de prueba sincronizado: test / test123");

        // Crear investigador de prueba universal
        User testResearcher = userRepository.findByUsername("inv").orElse(new User());
        testResearcher.setUsername("inv");
        testResearcher.setPassword(passwordEncoder.encode("inv123"));
        testResearcher.setRole(Role.RESEARCHER);
        testResearcher.setCanExport(true);
        testResearcher.setFullName("Investigador Senior");
        testResearcher.setPosition("Líder de Proyecto");
        testResearcher.setWorkplace("Laboratorio Central");
        testResearcher.setProfilePicture("https://ui-avatars.com/api/?name=Investigador&background=008080&color=fff");
        userRepository.save(testResearcher);
        System.out.println(">>> Investigador de prueba sincronizado: inv / inv123");

        // Vincular el paciente 'test' al investigador 'inv'
        Patient patient = patientRepository.findByStudyCode("test").orElse(new Patient());
        patient.setStudyCode("test");
        patient.setResearcher(testResearcher);
        patient.setRegistrationDate(LocalDateTime.now().minusDays(5));
        patientRepository.save(patient);

        // Crear una encuesta de prueba estructurada
        Survey survey = surveyRepository.findAll().stream().findFirst().orElse(new Survey());
        survey.setTitle("Protocolo de Bienestar");
        survey.setDescription("Evaluación diaria multicriterio");
        survey.setStatus(Survey.SurveyStatus.VIGENTE);
        survey.setCreator(testResearcher);
        
        List<SurveyQuestion> questions = List.of(
            SurveyQuestion.builder().text("¿Cómo se siente de ánimo hoy?").type(QuestionType.ANIMO).options(List.of("Bien", "Regular", "Mal")).survey(survey).build(),
            SurveyQuestion.builder().text("¿Ha tenido pensamientos de riesgo?").type(QuestionType.SI_NO).options(List.of("Sí", "No")).survey(survey).build(),
            SurveyQuestion.builder().text("¿Con qué frecuencia entrena con el guante?").type(QuestionType.MULTIPLE).options(List.of("Diario", "3 veces/semana", "Rara vez")).survey(survey).build(),
            SurveyQuestion.builder().text("Describa su estado emocional actual").type(QuestionType.TEXTO).survey(survey).build()
        );
        survey.setQuestions(questions);
        surveyRepository.save(survey);

        // Insertar datos históricos del guante (Científicos)
        if (gloveDataRepository.findByPatientOrderByTimestampDesc(patient).isEmpty()) {
            // Día 1
            gloveDataRepository.save(GloveData.builder()
                    .patient(patient)
                    .hrvValue(65.4)
                    .heartRate(72)
                    .sdnn(45.2)
                    .rmssd(38.5)
                    .temperature(36.5)
                    .timestamp(LocalDateTime.now().minusHours(2))
                    .build());
            
            gloveDataRepository.save(GloveData.builder()
                    .patient(patient)
                    .hrvValue(68.1)
                    .heartRate(70)
                    .sdnn(48.5)
                    .rmssd(40.2)
                    .temperature(36.4)
                    .timestamp(LocalDateTime.now().minusHours(4))
                    .build());

            // Día 2 (Ayer)
            gloveDataRepository.save(GloveData.builder()
                    .patient(patient)
                    .hrvValue(58.2)
                    .heartRate(78)
                    .sdnn(35.8)
                    .rmssd(32.1)
                    .temperature(36.7)
                    .timestamp(LocalDateTime.now().minusDays(1).withHour(10))
                    .build());
        }

        // Insertar respuesta a encuesta
        if (surveyResponseRepository.findByPatientOrderByTimestampDesc(patient).isEmpty()) {
            surveyResponseRepository.save(SurveyResponse.builder()
                    .patient(patient)
                    .survey(survey)
                    .answers(Map.of(
                        "¿Cómo se siente hoy?", "Bien", 
                        "¿Ha tenido pensamientos negativos?", "No",
                        "¿Nivel de estrés?", "Bajo"
                    ))
                    .timestamp(LocalDateTime.now().minusHours(1))
                    .build());

            surveyResponseRepository.save(SurveyResponse.builder()
                    .patient(patient)
                    .survey(survey)
                    .answers(Map.of(
                        "¿Cómo se siente hoy?", "Regular", 
                        "¿Ha tenido pensamientos negativos?", "A veces",
                        "¿Nivel de estrés?", "Medio"
                    ))
                    .timestamp(LocalDateTime.now().minusDays(1).withHour(15))
                    .build());
        }
    }
}
