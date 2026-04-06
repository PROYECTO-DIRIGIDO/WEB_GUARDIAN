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
        // Limpiar base de datos para inicio fresco
        gloveDataRepository.deleteAll();
        surveyResponseRepository.deleteAll();
        surveyRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();

        System.out.println(">>> Base de datos limpiada. Generando credenciales base...");

        // 1. Administrador Central
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setCanExport(true);
        admin.setFullName("Administrador Central");
        admin.setProfilePicture("https://ui-avatars.com/api/?name=Admin&background=008080&color=fff");
        userRepository.save(admin);
        System.out.println(" - [ADMIN]: admin / admin123");

        // 2. Investigador Senior
        User testResearcher = new User();
        testResearcher.setUsername("inv");
        testResearcher.setPassword(passwordEncoder.encode("inv123"));
        testResearcher.setRole(Role.RESEARCHER);
        testResearcher.setCanExport(true);
        testResearcher.setFullName("Investigador Senior");
        testResearcher.setPosition("Líder de Proyecto");
        testResearcher.setWorkplace("Laboratorio Central");
        testResearcher.setProfilePicture("https://ui-avatars.com/api/?name=Investigador&background=008080&color=fff");
        userRepository.save(testResearcher);
        System.out.println(" - [RESEARCHER]: inv / inv123");

        // 3. Paciente de Prueba
        User testPatient = new User();
        testPatient.setUsername("test");
        testPatient.setPassword(passwordEncoder.encode("test123"));
        testPatient.setRole(Role.PATIENT);
        testPatient.setCanExport(false);
        testPatient.setFullName("Paciente de Prueba");
        testPatient.setProfilePicture("https://ui-avatars.com/api/?name=Paciente&background=40E0D0&color=fff");
        userRepository.save(testPatient);
        System.out.println(" - [PATIENT]: test / test123");

        // Vincular el paciente 'test' al investigador 'inv'
        Patient patient = new Patient();
        patient.setStudyCode("test");
        patient.setResearcher(testResearcher);
        patient.setRegistrationDate(LocalDateTime.now());
        patientRepository.save(patient);

        // Crear una encuesta de prueba estructurada (Protocolo Vigente)
        Survey survey = new Survey();
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

        System.out.println(">>> Entorno listo para pruebas de ingesta del guante.");
    }
}
