# =============================================================
# ESTÁGIO 1: Compilação (Maven + JDK)
# Compila o projeto Java automaticamente — sem necessidade de
# rodar 'mvn package' manualmente antes do docker compose up
# =============================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copia o pom.xml primeiro para aproveitar o cache de dependências
# (se apenas o código mudar, o Maven não baixa as dependências de novo)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copia o código-fonte e compila
COPY src ./src
RUN mvn package -DskipTests -q

# =============================================================
# ESTÁGIO 2: Imagem final (apenas JRE — mais leve)
# =============================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/biblioteca-prompts-api-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]