# --- ETAPA 1: Construcción del Frontend (React) ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- ETAPA 2: Construcción del Backend (Spring Boot + Frontend) ---
FROM maven:3.8.4-openjdk-17-slim AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline

COPY backend/src ./src
# Copiamos la web construida a la carpeta de recursos estáticos de Spring Boot
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests

# --- ETAPA 3: Imagen de Ejecución Final ---
FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
