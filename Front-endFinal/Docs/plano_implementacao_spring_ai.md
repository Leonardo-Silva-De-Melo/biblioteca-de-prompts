# Plano de Implementação: Integração Spring AI com Ollama

Este documento detalha o roteiro técnico arquitetural para acoplar o **Spring AI** à API da Biblioteca de Prompts (`biblioteca-prompts-api`). O objetivo é substituir requisições manuais ao Ollama por uma integração nativa e padronizada.

## 1. Atualização de Dependências (pom.xml)

O Spring AI utiliza um *Bill of Materials* (BOM) para garantir que todas as versões dos pacotes sejam compatíveis. Sendo a aplicação baseada no Spring Boot 3.3.5, devemos adicionar a versão compatível do Spring AI.

**Ações no `pom.xml`:**
1. Adicionar o bloco `<dependencyManagement>` com o `spring-ai-bom`.
2. Adicionar a dependência do starter específico do Ollama: `spring-ai-ollama-spring-boot-starter`.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.0.0-M3</version> <!-- Usar a versão milestone/release mais estável -->
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Starter do Ollama -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

> **Nota:** Como as bibliotecas do Spring AI ainda estão frequentemente em *Milestone*, pode ser necessário adicionar o repositório da Spring (Milestone) no `pom.xml`.

## 2. Configuração de Ambiente (application.properties)

Configurar as credenciais e o modelo padrão que o Spring AI usará ao se comunicar com a infraestrutura local (Docker).

**Ações em `src/main/resources/application.properties`:**
```properties
# ========================================================
# CONFIGURAÇÃO OLLAMA (SPRING AI)
# ========================================================
# URL onde o container do Ollama está escutando (Ajustar para o IP do Docker se necessário)
spring.ai.ollama.base-url=http://localhost:11434

# Qual modelo LLM o Spring AI deve usar por padrão
spring.ai.ollama.chat.options.model=llama3.2
# Controla a criatividade do modelo (0.0 = muito estrito, 1.0 = criativo)
spring.ai.ollama.chat.options.temperature=0.3
```

## 3. Criação da Camada de Serviço (ArquitetoIAService.java)

O serviço Spring será responsável por injetar o `ChatClient`, que é a interface moderna (builder) do Spring AI para comunicação fluida com a IA.

**Classe `br.uerj.dgti.bibliotecaprompts.service.ArquitetoIAService`:**
```java
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ArquitetoIAService {

    private final ChatClient chatClient;

    // Injeção de dependência via construtor (Best Practice)
    public ArquitetoIAService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
            // Podemos definir um System Prompt padrão que TODA requisição terá
            .defaultSystem("Você é um Engenheiro de Software Sênior da DGTI da UERJ. O código gerado deve usar Java 17 e Spring Boot 3.")
            .build();
    }

    public String gerarCodigoExpresso(String instrucaoUsuario) {
        return this.chatClient.prompt()
                .user(instrucaoUsuario)
                .call()
                .content(); // Retorna o texto formatado (Markdown) da IA
    }
}
```

## 4. Criação do Endpoint (Controller)

Disponibilizar o serviço para o frontend (React - Gerador Expresso) consumir.

**Classe `br.uerj.dgti.bibliotecaprompts.controller.GeradorIAController`:**
```java
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/ia/gerador")
public class GeradorIAController {

    @Autowired
    private ArquitetoIAService arquitetoIAService;

    @PostMapping("/expresso")
    public String solicitarGeracao(@RequestBody String promptDoReact) {
        // Recebe o comando do React, envia para o Ollama e devolve a resposta
        return arquitetoIAService.gerarCodigoExpresso(promptDoReact);
    }
}
```

## 5. Próximos Passos (Evoluções Futuras)

Após o acoplamento básico acima, o projeto estará apto a usar funcionalidades avançadas:
1. **Saídas em Objetos (Structured Output):** Fazer a requisição devolver um DTO do Java em vez de texto bruto.
2. **Histórico e Memória:** Utilizar o `MessageChatMemoryAdvisor` do Spring AI para que a IA se lembre das perguntas anteriores do mesmo usuário na sessão.
3. **Métricas Autogeradas:** Integrar o Micrometer para rastrear automaticamente quanto tempo o Ollama levou para responder cada requisição.
