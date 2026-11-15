# Stage 1: Build JAR with Maven & Eclipse Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE 21 Runtime (Optimized for Free Tier 512MB RAM)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy artifact from build stage
COPY --from=build /app/target/gharkhata-backend-1.0.0.jar app.jar

# Standard Render / Cloud Port environment
ENV PORT=8080
EXPOSE 8080

# Keep JVM heap within 384MB to prevent OOM kills on 512MB free instances
ENTRYPOINT ["java", "-Xmx384m", "-Xss512k", "-XX:+UseSerialGC", "-jar", "app.jar"]

