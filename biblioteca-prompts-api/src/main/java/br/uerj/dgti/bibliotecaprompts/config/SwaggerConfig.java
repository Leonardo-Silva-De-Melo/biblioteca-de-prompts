package br.uerj.dgti.bibliotecaprompts.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI bibliotecaPromptsOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Biblioteca de Prompts API")
                        .description("API REST da Biblioteca de Prompts de IA da UERJ/DGTI")
                        .version("v1.0.0")
                        .contact(new Contact().name("DGTI UERJ")));
    }
}
