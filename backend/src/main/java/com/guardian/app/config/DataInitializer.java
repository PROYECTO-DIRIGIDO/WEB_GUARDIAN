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
        if (userRepository.count() > 0) {
            System.out.println(">>> Base de datos ya inicializada con usuarios existentes. Verificando protocolos EMA...");
            User researcher = userRepository.findByRole(Role.RESEARCHER).stream().findFirst().orElse(null);
            if (researcher != null) {
                seedEMASurveys(researcher);
            }
            return;
        }

        System.out.println(">>> Base de datos vacía. Generando credenciales base de inicialización...");

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

        // 4. Investigador Mario
        User mario = new User();
        mario.setUsername("mario");
        mario.setPassword(passwordEncoder.encode("mario123"));
        mario.setRole(Role.RESEARCHER);
        mario.setCanExport(true);
        mario.setFullName("Mario Cañón");
        mario.setPosition("Investigador Co-Director");
        mario.setProfilePicture("https://ui-avatars.com/api/?name=Mario&background=008080&color=fff");
        userRepository.save(mario);
        System.out.println(" - [RESEARCHER]: mario / mario123");

        // 5. Paciente Juan
        User juan = new User();
        juan.setUsername("juan");
        juan.setPassword(passwordEncoder.encode("juan123"));
        juan.setRole(Role.PATIENT);
        juan.setCanExport(false);
        juan.setFullName("Juan Pablo Nieto");
        juan.setProfilePicture("https://ui-avatars.com/api/?name=Juan&background=40E0D0&color=fff");
        userRepository.save(juan);
        System.out.println(" - [PATIENT]: juan / juan123");

        Patient patientJuan = new Patient();
        patientJuan.setStudyCode("juan");
        patientJuan.setResearcher(mario);
        patientJuan.setRegistrationDate(LocalDateTime.now());
        patientRepository.save(patientJuan);

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

        seedEMASurveys(testResearcher);

        System.out.println(">>> Entorno listo para pruebas de ingesta del guante.");
    }

    private void seedEMASurveys(User researcher) {
        // 1. EMA Matutino
        if (surveyRepository.findByTitle("EMA - Registro Matutino (Sueño y Estado Basal)").isEmpty()) {
            Survey morning = new Survey();
            morning.setTitle("EMA - Registro Matutino (Sueño y Estado Basal)");
            morning.setDescription("Evaluación al despertar: calidad del sueño, latencia, pesadillas y estado basal.");
            morning.setStatus(Survey.SurveyStatus.VIGENTE);
            morning.setCreator(researcher);

            List<SurveyQuestion> mQ = List.of(
                SurveyQuestion.builder().text("¿Cómo calificarías la calidad de tu sueño anoche?").type(QuestionType.MULTIPLE).options(List.of("0 - Muy mala", "1 - Mala", "2 - Regular", "3 - Buena", "4 - Muy buena")).survey(morning).build(),
                SurveyQuestion.builder().text("¿Cuánto tiempo te tomó quedarte dormido ayer?").type(QuestionType.MULTIPLE).options(List.of("Menos de 15 min", "15 a 30 min", "30 a 60 min", "Más de 60 min")).survey(morning).build(),
                SurveyQuestion.builder().text("¿Tuviste pesadillas durante la noche?").type(QuestionType.SI_NO).options(List.of("Sí", "No")).survey(morning).build(),
                SurveyQuestion.builder().text("En este momento, ¿cómo te sientes de ánimo?").type(QuestionType.ANIMO).options(List.of("Bien", "Regular", "Mal")).survey(morning).build(),
                SurveyQuestion.builder().text("¿Cuál es tu nivel de energía para iniciar el día?").type(QuestionType.MULTIPLE).options(List.of("0 - Sin energía", "1 - Poca energía", "2 - Moderada", "3 - Mucha energía")).survey(morning).build(),
                SurveyQuestion.builder().text("Actualmente, ¿te sientes desesperanzado/a?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Un poco", "2 - Moderadamente", "3 - Bastante", "4 - Extremadamente")).survey(morning).build(),
                SurveyQuestion.builder().text("En este momento, ¿piensas en quitarte la vida o hacerte daño?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Pensamiento leve/pasajero", "2 - Moderado", "3 - Fuerte", "4 - Muy intenso")).survey(morning).build()
            );
            morning.setQuestions(mQ);
            surveyRepository.save(morning);
            System.out.println(" + [EMA]: Creado protocolo Matutino");
        }

        // 2. EMA Continuo (Mediodía/Tarde)
        if (surveyRepository.findByTitle("EMA - Registro Diario (Afecto, Carga y Desesperanza)").isEmpty()) {
            Survey daily = new Survey();
            daily.setTitle("EMA - Registro Diario (Afecto, Carga y Desesperanza)");
            daily.setDescription("Evaluaciones breves durante el día: afecto inmediato, soledad, carga percibida y riesgo.");
            daily.setStatus(Survey.SurveyStatus.VIGENTE);
            daily.setCreator(researcher);

            List<SurveyQuestion> dQ = List.of(
                SurveyQuestion.builder().text("¿Cómo te sientes en este momento?").type(QuestionType.ANIMO).options(List.of("Bien", "Regular", "Mal")).survey(daily).build(),
                SurveyQuestion.builder().text("¿Te sientes tranquilo o agitado/tenso?").type(QuestionType.MULTIPLE).options(List.of("0 - Muy calmado", "1 - Tranquilo", "2 - Algo tenso", "3 - Agitado / Muy tenso")).survey(daily).build(),
                SurveyQuestion.builder().text("Actualmente, ¿te sientes solo/a o aislado/a?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Un poco", "2 - Moderadamente", "3 - Mucho", "4 - Extremadamente")).survey(daily).build(),
                SurveyQuestion.builder().text("Actualmente, ¿sientes que eres una carga para los demás?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Un poco", "2 - Moderadamente", "3 - Bastante", "4 - Extremadamente")).survey(daily).build(),
                SurveyQuestion.builder().text("Actualmente, ¿te sientes desesperanzado/a?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Un poco", "2 - Moderadamente", "3 - Bastante", "4 - Extremadamente")).survey(daily).build(),
                SurveyQuestion.builder().text("¿Sientes que la vida vale la pena vivirla en este instante?").type(QuestionType.MULTIPLE).options(List.of("Completamente", "En su mayoría", "Poco", "Para nada")).survey(daily).build(),
                SurveyQuestion.builder().text("En este momento, ¿quieres morir o desaparecer?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Deseo leve", "2 - Moderado", "3 - Fuerte", "4 - Extremadamente alto")).survey(daily).build()
            );
            daily.setQuestions(dQ);
            surveyRepository.save(daily);
            System.out.println(" + [EMA]: Creado protocolo Diario Continuo");
        }

        // 3. EMA Nocturno
        if (surveyRepository.findByTitle("EMA - Registro Nocturno (Cierre, Interacción y Control)").isEmpty()) {
            Survey night = new Survey();
            night.setTitle("EMA - Registro Nocturno (Cierre, Interacción y Control)");
            night.setDescription("Cierre del día: balance afectivo, satisfacción, relaciones interpersonales y locus de control.");
            night.setStatus(Survey.SurveyStatus.VIGENTE);
            night.setCreator(researcher);

            List<SurveyQuestion> nQ = List.of(
                SurveyQuestion.builder().text("¿Cómo termina tu estado de ánimo general hoy?").type(QuestionType.ANIMO).options(List.of("Bien", "Regular", "Mal")).survey(night).build(),
                SurveyQuestion.builder().text("Nivel de satisfacción o placer experimentado hoy:").type(QuestionType.MULTIPLE).options(List.of("0 - Ninguno", "1 - Bajo", "2 - Moderado", "3 - Alto", "4 - Muy alto")).survey(night).build(),
                SurveyQuestion.builder().text("¿Sentiste que tuviste control sobre las cosas que te pasaron hoy?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Poco", "2 - Moderado", "3 - Bastante", "4 - Control total")).survey(night).build(),
                SurveyQuestion.builder().text("¿Tuviste contacto o interacción con personas hoy?").type(QuestionType.SI_NO).options(List.of("Sí", "No")).survey(night).build(),
                SurveyQuestion.builder().text("Si interactuaste, ¿te sentiste apoyado/a y comprendido/a?").type(QuestionType.MULTIPLE).options(List.of("No aplica", "0 - Para nada", "1 - Poco", "2 - Moderadamente", "3 - Mucho")).survey(night).build(),
                SurveyQuestion.builder().text("¿Experimentaste algún conflicto interpersonal hoy?").type(QuestionType.SI_NO).options(List.of("Sí", "No")).survey(night).build(),
                SurveyQuestion.builder().text("En este momento, ¿sientes que tienes más razones para morir que para vivir?").type(QuestionType.MULTIPLE).options(List.of("0 - Para nada", "1 - Raras veces", "2 - Frecuentemente", "3 - Casi todo el tiempo", "4 - Todo el tiempo")).survey(night).build()
            );
            night.setQuestions(nQ);
            surveyRepository.save(night);
            System.out.println(" + [EMA]: Creado protocolo Nocturno");
        }
    }
}
