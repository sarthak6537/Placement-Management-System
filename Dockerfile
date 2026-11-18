# Multi-stage Dockerfile to build and run the PlacementManagement Spring Boot app

# Build stage - use Maven with JDK 21
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy pom and sources
COPY pom.xml ./
COPY src ./src

# Build the jar (skip tests during image build; use CI to run tests)
RUN mvn -B package -DskipTests

# Run stage - use a JRE image
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy jar from build stage
COPY --from=build /workspace/target/PlacementManagement-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
