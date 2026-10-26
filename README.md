# 🌐 Ecosistema Guardian · Capa Cloud (Plataforma Web y API Analítica)

Plataforma web analítica centralizada del **Ecosistema Guardian**, diseñada bajo arquitectura monolítica desacoplada (**Spring Boot 3 + PostgreSQL + React 18 / Vite**) para la ingesta telemétrica de bioseñales vestibles, administración de evaluaciones ecológicas momentáneas (EMA), trazabilidad de pacientes y exportación bioestadística para entornos clínicos hospitalarios.

---

## 📌 Tabla de Contenidos
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Módulos y Funcionalidades](#-módulos-y-funcionalidades)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Despliegue con Docker y Docker Compose](#-despliegue-con-docker-y-docker-compose)
- [Despliegue en Servidor de Producción](#-despliegue-en-servidor-de-producción)
- [Documentación de la API REST](#-documentación-de-la-api-rest)
- [Seguridad y Privacidad de Datos](#-seguridad-y-privacidad-de-datos)
- [Autores y Licencia](#-autores-y-licencia)

---

## 🏛️ Arquitectura del Sistema

El sistema opera como la **Capa Cloud** dentro de la arquitectura IoMT de 3 niveles, recibiendo datos sincronizados desde la pasarela móvil Android (*Gateway*) y ofreciendo interfaces especializadas para investigadores y clínicos.

```mermaid
graph TD
    GW["App Android Guardian<br>(Gateway Móvil)"]
    
    subgraph Cloud["Plataforma Cloud (WEB_GUARDIAN)"]
        NGINX["Servidor Web / Proxy<br>(Port 8080 / Tailscale Funnel)"]
        API["API REST Spring Boot 3<br>(Java 17 · Spring Security JWT)"]
        FE["SPA Frontend React 18<br>(Vite · Tailwind · Recharts)"]
        DB[(Base de Datos PostgreSQL 15<br>Relacional · Series Temporales)]
    end
    
    RESEARCHER["Investigadores / Psiquiatras<br>(Panel de Control Web)"]
    SPSS["Herramientas Estadísticas<br>(R · SPSS · Python Pandas)"]

    GW -->|POST /api/glove-data/sync (TLS 1.3)| API
    GW -->|POST /api/surveys/.../response| API
    
    FE <-->|Axios REST + JWT| API
    API <-->|Spring Data JPA / Hibernate| DB
    
    RESEARCHER -->|Dashboard & Monitoreo| FE
    API -->|GET /api/export/.../excel| SPSS
```

---

## 🛠️ Stack Tecnológico

### Backend
* **Lenguaje:** Java 17 LTS
* **Framework:** Spring Boot 3.2.x (Spring Web, Spring Data JPA, Spring Validation)
* **Seguridad:** Spring Security con autenticación sin estado mediante **JWT (JSON Web Tokens)**
* **Base de Datos:** PostgreSQL 15 (gestión transaccional y persistencia de series temporales)
* **Exportación Bioestadística:** Apache POI (generación de libros `.xlsx` para R y SPSS)
* **Build Tool:** Apache Maven 3.9+

### Frontend
* **Librería UI:** React 18 con Vite (compilación ultrarrápida)
* **Estilos y Componentes:** Tailwind CSS, Heroicons
* **Visualización de Bioseñales:** Recharts (curvas de acoplamiento bimodal HRV vs. EMA)
* **Cliente HTTP:** Axios con interceptores automáticos de cabeceras `Authorization: Bearer <token>`
* **Enrutamiento:** React Router DOM v6

### Infraestructura y DevOps
* **Contenedores:** Docker multi-stage builds (OpenJDK 17 Alpine + Node 20 Alpine)
* **Orquestación:** Docker Compose (redes aisladas puente y volúmenes persistentes)
* **Túnel Seguro de Producción:** Tailscale Funnel / HTTPS TLS 1.3

---

## 🚀 Módulos y Funcionalidades

### 1. Control de Acceso Basado en Roles (RBAC)
* **`ROLE_ADMIN`:** Gestión integral de usuarios (creación, edición, activación/bloqueo de clínicos e investigadores), asignación de pacientes y auditoría del sistema.
* **`ROLE_RESEARCHER`:** Visualización de pacientes asignados, análisis de series de tiempo fisiológicas, monitor de adherencia EMA y exportación de matrices de datos.
* **`ROLE_PATIENT`:** Consulta de perfil personal, historial de evaluaciones y estado de conectividad de su dispositivo vestible.

### 2. Ingesta Telemétrica de Bioseñales
* Recepción por lotes de paquetes empaquetados desde la app móvil (`POST /api/glove-data/sync`).
* Almacenamiento desacoplado con índices por paciente y marca de tiempo (`timestamp` con zona horaria `America/Bogota`).

### 3. Gestión y Ejecución de Encuestas EMA
* Creación y activación de cuestionarios psicométricos parametrizados (preguntas de escala analógica 0–100, escalas discretas 0–4 y texto libre).
* Registro centralizado de respuestas vinculadas al paciente.

### 4. Exportador Científico Multivariable
* Generación automatizada de reportes en hojas de cálculo Excel (`.xlsx`) estructuradas para análisis estadístico en **SPSS** y paquetes bioestadísticos en **R** (`readxl`, `tidyverse`).

---

## 📂 Estructura del Proyecto

```text
WEB_GUARDIAN/
├── docker-compose.yml                         # Orquestación de desarrollo local (App + DB)
├── docker-compose.prod.yml                    # Orquestación para servidor de producción
├── Dockerfile                                 # Multi-stage build del monolito completo
├── deploy_to_sabio.sh                         # Script de sincronización y despliegue automatizado
├── README.md                                  # Documentación técnica de la plataforma
├── backend/                                   # Servicio Spring Boot 3
│   ├── pom.xml                                # Manifiesto de dependencias Maven
│   ├── Dockerfile                             # Contenedor dedicado de la API Java
│   └── src/main/
│       ├── java/com/guardian/app/
│       │   ├── config/                        # Seguridad JWT, CORS y DataInitializer demo
│       │   ├── controller/                    # Controladores REST (Auth, GloveData, Admin, Surveys)
│       │   ├── dto/                           # Data Transfer Objects
│       │   ├── model/                         # Entidades JPA (User, Patient, GloveData, Survey)
│       │   ├── repository/                    # Interfaces Spring Data JPA
│       │   └── security/                      # UserDetailsService y filtro JwtRequestFilter
│       └── resources/
│           └── application.properties         # Configuración de base de datos y JWT
└── frontend/                                  # Aplicación SPA React
    ├── package.json                           # Dependencias Node.js y scripts Vite
    ├── vite.config.js                         # Configuración del bundler Vite
    ├── tailwind.config.js                     # Configuración de diseño Tailwind
    └── src/
        ├── components/                        # Dashboards, formularios y tablas analíticas
        ├── config.js                          # Configuración de URL base de la API
        └── App.jsx                            # Enrutador principal y control de sesión
```

---

## 📋 Requisitos Previos

* **Java Development Kit (JDK):** Versión 17 o superior.
* **Node.js:** Versión 18 LTS o 20 LTS.
* **PostgreSQL:** Versión 14 o 15 local (o a través de Docker).
* **Docker & Docker Compose:** Si se desea ejecutar en contenedores aislados.

---

## ⚙️ Instalación y Configuración

### Opción A: Ejecución con Docker Compose (Recomendada)

1. Clonar el repositorio y acceder al directorio:
   ```bash
   git clone https://github.com/PROYECTO-DIRIGIDO/WEB_GUARDIAN.git
   cd WEB_GUARDIAN
   ```

2. Iniciar el clúster (Base de datos PostgreSQL + Monolito Web):
   ```bash
   docker compose up --build -d
   ```

3. Verificar que los contenedores estén en estado saludable:
   ```bash
   docker compose ps
   ```

4. Acceder al aplicativo web en: `http://localhost:8080`

---

### Opción B: Ejecución en Entorno Local de Desarrollo

#### 1. Configurar la Base de Datos PostgreSQL
Crear la base de datos en PostgreSQL local:
```sql
CREATE DATABASE guardian_db;
```

#### 2. Compilar y Ejecutar el Backend (Spring Boot)
```bash
cd backend
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/guardian_db"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="TU_PASSWORD_LOCAL"
export GUARDIAN_JWT_SECRET="clave_secreta_hexadecimal_de_al_menos_256_bits_para_firmar_jwt"

./mvnw spring-boot:run
```
*El backend iniciará en `http://localhost:8080` y precargará usuarios de prueba gracias a `DataInitializer.java`.*

#### 3. Ejecutar el Frontend (React + Vite)
En una terminal separada:
```bash
cd frontend
npm install
npm run dev
```
*El frontend iniciará en `http://localhost:5173` y consumirá la API en el puerto 8080.*

---

## 🔐 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto de enlace del servidor web HTTP | `8080` |
| `SPRING_DATASOURCE_URL` | Cadena de conexión JDBC hacia PostgreSQL | `jdbc:postgresql://db:5432/guardian_db` |
| `SPRING_DATASOURCE_USERNAME` | Usuario administrador de la base de datos | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de autenticación de PostgreSQL | `admin123` |
| `GUARDIAN_JWT_SECRET` | Clave secreta simétrica HMAC-SHA256 para JWT | Clave aleatoria segura de 256 bits |
| `GUARDIAN_JWT_EXPIRATION` | Tiempo de vida del token JWT en milisegundos | `86400000` (24 horas) |

---

## 🌐 Despliegue en Servidor de Producción

El repositorio incluye el script automatizado [`deploy_to_sabio.sh`](deploy_to_sabio.sh) para sincronización y despliegue continuo hacia el servidor central con **Tailscale Funnel**:

```bash
# Otorgar permisos de ejecución y desplegar hacia el host de producción
chmod +x deploy_to_sabio.sh
./deploy_to_sabio.sh juan
```

El script ejecuta las siguientes fases:
1. Verifica la existencia del directorio remoto vía SSH.
2. Sincroniza el código fuente excluyendo `node_modules/` y binarios compilados `target/`.
3. Levanta los contenedores en producción mediante `docker-compose.prod.yml`.
4. Ejecuta un health-check contra la API REST sobre el puerto 8085.

---

## 📡 Documentación de la API REST

Todos los endpoints (a excepción de `/api/auth/**`) requieren la cabecera:
```http
Authorization: Bearer <TOKEN_JWT_VALIDO>
```

### Autenticación (`AuthController`)
| Método | Endpoint | Roles | Descripción |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Público | Autentica usuario y retorna token JWT y rol. |
| `POST` | `/api/auth/register` | Público | Registro de nuevo usuario. |

### Telemetría de Bioseñales (`GloveDataController`)
| Método | Endpoint | Roles | Descripción |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/glove-data/sync` | Gateway / Paciente | Recibe y persiste un lote de tramas telemétricas del guante. |
| `GET` | `/api/glove-data/patient/{patientId}` | Investigador / Admin | Obtiene las series temporales de un paciente en rango de fechas. |

### Evaluaciones Ecológicas Momentáneas (`SurveyController`)
| Método | Endpoint | Roles | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/surveys` | Investigador / Admin | Lista todas las encuestas creadas. |
| `POST` | `/api/surveys` | Investigador / Admin | Crea una nueva encuesta con preguntas ponderadas. |
| `GET` | `/api/surveys/active` | Paciente / Todos | Consulta encuestas activas asignadas para diligenciar. |
| `POST` | `/api/surveys/{id}/response` | Paciente | Registra las respuestas psicométricas a una evaluación. |

### Exportación Científica (`ExportController`)
| Método | Endpoint | Roles | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/export/patient/{id}/excel` | Investigador / Admin | Descarga archivo `.xlsx` con todas las bioseñales del paciente. |
| `GET` | `/api/export/survey/{id}/excel` | Investigador / Admin | Descarga archivo `.xlsx` con respuestas EMA tabuladas. |
| `GET` | `/api/export/research/excel` | Investigador / Admin | Matriz bioestadística consolidada para R / SPSS. |

---

## 🔒 Seguridad y Privacidad de Datos

* **Protección Criptográfica en Tránsito:** Comunicaciones aseguradas bajo **TLS 1.3**.
* **Gestión de Identidad:** Cifrado de contraseñas mediante **BCrypt** con factor de costo configurable.
* **Seudonimización de Pacientes:** Los registros fisiológicos y psicométricos se indexan mediante identificadores anónimos disociados de la identidad civil de los sujetos, conforme a la **Ley Estatutaria 1581 de 2012 de Colombia** y los lineamientos éticos de la **Declaración de Helsinki**.

---

## 👥 Autores y Licencia

* **Desarrollador Principal:** Juan Pablo Nieto Cortés (`juan.nieto-co@mail.escuelaing.edu.co`)
* **Director / Asesor del Proyecto:** Mario Julián Cañón Ayala
* **Institución:** Escuela Colombiana de Ingeniería Julio Garavito · Centro de Estudios Informáticos (CEI) · Semillero de Bases de Datos.
* **Licencia:** [MIT License](https://opensource.org/licenses/MIT) · Plataforma de Código Abierto para Investigación en Salud Mental Digital.

