# 🌐 Guardian Web (Monolito Java + React)

Esta es la plataforma central del ecosistema **Guardian**, diseñada como un monolito integral para la gestión y análisis de datos de investigación en salud mental.

## 🛠️ Stack Tecnológico
- **Backend:** Java 17+, Spring Boot 3.x, Spring Data JPA, Spring Security (JWT).
- **Frontend:** React (Vite), Tailwind CSS, Recharts (Visualización).
- **Base de Datos:** PostgreSQL.

## 📂 Organización del Proyecto
El proyecto sigue una estructura de **Monolito Separado** para mayor orden:

```text
/backend            # Lógica de servidor y API REST
  ├── /controller   # Endpoints (Auth, Data, Research)
  ├── /service      # Algoritmos de análisis y procesamiento
  ├── /model        # Entidades de PostgreSQL
  └── /security     # Configuración de JWT y seguridad
/frontend           # Interfaz de usuario para investigadores
  ├── /components   # Gráficos de HRV, tablas de usuarios
  ├── /hooks        # Lógica de consumo de API (Axios)
  └── /pages        # Vistas principales (Dashboard, Perfil Usuario)
```

## 🚀 Funcionalidades para Investigadores
1. **Dashboard de Correlación:** Superposición de gráficas de pulso (HRV) y reportes de ánimo (EMA).
2. **Exportador Científico:** Descarga de datos en formato CSV listos para ser usados en **SPSS o R**.
3. **Monitor de Adherencia:** Vista rápida para saber qué participantes están recolectando datos activamente.
4. **Alertas de Seguridad:** Notificaciones automáticas ante caídas críticas en la variabilidad de la frecuencia cardíaca.

## ⚙️ Configuración Inicial (Discovery Phase)
1. **Base de Datos:** PostgreSQL debe estar configurado con el esquema detallado en `database_schema.md`.
2. **API Contract:** El backend expondrá una API REST protegida por JWT.

---
*Plataforma de análisis científico para el proyecto de tesis sobre prevención de crisis basado en HRV.*
