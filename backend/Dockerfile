# Multi-stage Dockerfile for CampusCare Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S campuscare && adduser -S campuscare -G campuscare \
    && mkdir -p /app/data /app/uploads \
    && chown -R campuscare:campuscare /app
USER campuscare
COPY --from=builder --chown=campuscare:campuscare /app/target/campuscare-backend-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
