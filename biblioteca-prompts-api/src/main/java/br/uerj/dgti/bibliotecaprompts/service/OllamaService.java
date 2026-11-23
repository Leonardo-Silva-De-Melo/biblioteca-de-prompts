package br.uerj.dgti.bibliotecaprompts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.tika.Tika;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.ollama.api.OllamaOptions;
import reactor.core.publisher.Flux;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class OllamaService {

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${spring.ai.ollama.chat.model:llama3.1:latest}")
    private String defaultModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private Util util;

    private final ChatClient chatClient;
    private final InMemoryChatMemory chatMemory = new InMemoryChatMemory();

    public OllamaService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
                .build();
    }

    /**
     * Verifica se o Ollama está disponível
     */
    public RetornoPadraoFrontendObjetoDTO verificarStatus() {
        boolean disponivel;
        try {
            restTemplate.getForObject(ollamaUrl + "/api/tags", String.class);
            disponivel = true;
        } catch (Exception e) {
            disponivel = false;
        }
        Map<String, Object> body = Map.of(
            "disponivel", disponivel,
            "mensagem", disponivel 
                ? "IA Ollama conectada e pronta!" 
                : "Ollama offline. Execute: ollama serve"
        );
        return util.prepararRetornoObjetoFront(body, 200, "Status obtido com sucesso");
    }

    /**
     * Obtém os modelos disponíveis na máquina executando o Ollama
     */
    public RetornoPadraoFrontendObjetoDTO obterModelosDisponiveis() {
        try {
            String json = restTemplate.getForObject(ollamaUrl + "/api/tags", String.class);
            JsonNode root = objectMapper.readTree(json);
            JsonNode modelsNode = root.path("models");
            List<String> nomes = new ArrayList<>();
            for (JsonNode modelNode : modelsNode) {
                nomes.add(modelNode.path("name").asText());
            }
            Map<String, Object> body = Map.of("modelos", nomes);
            return util.prepararRetornoObjetoFront(body, 200, "Modelos obtidos com sucesso");
        } catch (Exception e) {
            System.err.println("Erro ao obter modelos: " + e.getMessage());
            Map<String, Object> body = Map.of("modelos", List.of(defaultModel));
            return util.prepararRetornoObjetoFront(body, 200, "Usando modelo fallback");
        }
    }

    /**
     * Extrai texto de arquivos anexados (PDF, DOCX, etc)
     */
    private String extrairTextoDoArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            return "";
        }
        try {
            Tika tika = new Tika();
            String textoExtraido = tika.parseToString(arquivo.getInputStream());
            return "\n\n[INSTRUÇÃO DO SISTEMA OBRIGATÓRIA: O usuário anexou um arquivo (PDF, DOC, etc.). O conteúdo deste arquivo foi extraído com sucesso pelo sistema e está colado abaixo. Você DEVE ler e considerar o texto abaixo como sendo o conteúdo exato do arquivo enviado pelo usuário. NUNCA diga que você não pode ler o arquivo, pois o texto já está disponível abaixo.]\n\n### CONTEÚDO DO ARQUIVO ANEXADO:\n" + textoExtraido;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao ler o documento técnico: " + e.getMessage());
        }
    }

    /**
     * Stream Chat com suporte a memória de conversação e arquivos
     */
    public Flux<String> streamChat(String chatId, String promptUsuario, MultipartFile arquivo, String modelo) {
        String conteudoArquivo = extrairTextoDoArquivo(arquivo);
        String promptFinal = promptUsuario + conteudoArquivo;
        
        var request = this.chatClient.prompt()
            .system("Você é um assistente de IA prestativo. Responda SEMPRE em português do Brasil (pt-BR), independentemente do idioma em que a pergunta for feita.")
            .user(promptFinal);
        
        if (modelo != null && !modelo.isBlank()) {
            request = request.options(OllamaOptions.builder().withModel(modelo).build());
        }
        
        return request
                .advisors(a -> a.param(MessageChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY, chatId))
                .stream()
                .content();
    }

    public RetornoPadraoFrontendObjetoDTO gerarEspecificacaoPorCategoria(String categoria, String descricao, MultipartFile arquivo) {
        String contextoCategoria = obterContextoCategoria(categoria);
        String conteudoArquivo = extrairTextoDoArquivo(arquivo);
        
        String instrucao = String.format("""
            ATUE COMO: %s
            
            OBJETIVO: Analisar o pedido do usuário e o documento anexo (se houver), e gerar uma ESPECIFICAÇÃO TÉCNICA DE SOFTWARE rigorosa, profissional e estruturada.
            
            PEDIDO DO USUÁRIO: "%s"
            %s 
            
            DIRETRIZES DA CATEGORIA:
            %s
            
            STACK OBRIGATÓRIA DA DGTI (Baseie-se nestas tecnologias para a arquitetura):
            - Linguagem: Java 17 (LTS) / Frontend: React 18
            - Framework: Spring Boot 3.2+ / Vite
            - Banco de Dados: PostgreSQL 15+
            - Documentação: Swagger/OpenAPI 3.0
            - Testes: JUnit 5, Mockito, Jest
            
            FORMATO DE SAÍDA EXIGIDO (Siga esta estrutura exata usando formatação Markdown avançada):
            
            # 1. Visão Geral e Escopo
            [Resumo executivo claro do que será construído e qual problema resolve]
            
            # 2. Arquitetura Proposta
            [Descreva a arquitetura de alto nível, justificando o uso da stack da DGTI para este caso específico]
            
            # 3. Mapeamento de Requisitos
            ## 3.1. Requisitos Funcionais (RF)
            [Crie uma tabela Markdown com colunas: ID | Descrição | Regra de Negócio Associada | Prioridade]
            ## 3.2. Requisitos Não Funcionais (RNF)
            [Liste requisitos de Desempenho, Escalabilidade e Disponibilidade]
            
            # 4. Modelo de Domínio / Estrutura de Dados
            [Descreva as principais entidades, seus relacionamentos e atributos críticos]
            
            # 5. Contratos de API (Endpoints principais)
            [Se aplicável, liste as rotas REST usando tabelas ou blocos de código indicando Método, URL e Payload JSON de exemplo]
            
            # 6. Considerações de Segurança e LGPD
            [Pontue riscos de segurança e como mitigá-los (ex: Autenticação, Proteção de Dados Sensíveis)]
            
            # 7. Estrutura de Repositório Sugerida
            [Exiba a árvore de pastas em formato de texto para padronização do projeto]
            
            REGRAS ESTRITAS:
            1. NÃO GERE LÓGICA DE CÓDIGO (ex: não escreva o corpo de classes Java). O foco é o planejamento e a arquitetura.
            2. Seja extremamente detalhista e técnico. Não use linguagem redundante.
            3. Se uma informação faltar no pedido original, assuma o padrão de melhores práticas de Engenharia de Software da UERJ.
            """, 
            obterPapel(categoria),
            descricao,
            conteudoArquivo, 
            contextoCategoria
        );
        
        // Chamada síncrona usando Spring AI
        String especificacao = this.chatClient.prompt()
                .user(instrucao)
                .call()
                .content();

        Map<String, Object> body = Map.of(
            "sucesso", true,
            "especificacao", especificacao,
            "categoria", categoria
        );
        return util.prepararRetornoObjetoFront(body, 200, util.sucesso());
    }

    private String obterPapel(String categoria) {
        return switch (categoria) {
            case "Documentação" -> "Analista de Requisitos e Engenheiro de Software Sênior DGTI/UERJ";
            case "Arquitetura" -> "Arquiteto de Soluções Corporativas Sênior DGTI/UERJ";
            case "Desenvolvimento" -> "Tech Lead de Desenvolvimento Full-Stack DGTI/UERJ";
            case "Testes" -> "Engenheiro de Qualidade de Software (QA) Sênior DGTI/UERJ";
            case "DevOps" -> "Engenheiro Cloud e DevOps Sênior DGTI/UERJ";
            case "Banco de Dados" -> "Arquiteto de Dados e DBA Sênior DGTI/UERJ";
            case "Segurança" -> "Especialista em Segurança da Informação e Compliance LGPD DGTI/UERJ";
            case "Onboarding" -> "Gestor de Conhecimento Técnico DGTI/UERJ";
            default -> "Arquiteto de Software Corporativo DGTI/UERJ";
        };
    }

    private String obterContextoCategoria(String categoria) {
        return switch (categoria) {
            case "Documentação" -> "DIRETRIZES DOCUMENTAÇÃO DGTI:\n- Seguir padrão ABNT NBR 6023 para referências\n- Incluir glossário de termos técnicos\n- Documentar decisões arquiteturais (ADR)\n- Versionamento semântico obrigatório\n- Diagramas UML quando aplicável\n- README.md completo no repositório";
            case "Arquitetura" -> "DIRETRIZES ARQUITETURA DGTI:\n- Seguir princípios SOLID\n- Design Patterns (GoF)\n- Arquitetura em camadas\n- API REST seguindo padrões Richardson Maturity Model\n- Considerar escalabilidade horizontal\n- Cache estratégico\n- Message Queue";
            case "Desenvolvimento" -> "DIRETRIZES DESENVOLVIMENTO DGTI:\n- Clean Code\n- Princípios SOLID\n- Repository Pattern + Service Layer\n- DTOs para transferência de dados\n- Validação com Bean Validation\n- Tratamento global de exceções\n- Logs estruturados\n- Swagger/OpenAPI para APIs";
            case "Testes" -> "DIRETRIZES TESTES DGTI:\n- Cobertura mínima: 80% do código\n- Testes unitários: JUnit 5 + Mockito\n- Testes de integração: TestContainers\n- Testes E2E: Selenium/Cypress\n- TDD quando possível\n- Pirâmide de testes\n- CI/CD com testes automatizados";
            case "DevOps" -> "DIRETRIZES DEVOPS DGTI:\n- Docker para containerização\n- Docker Compose para orquestração local\n- CI/CD com GitLab CI ou GitHub Actions\n- Infraestrutura como Código\n- Monitoramento com Prometheus + Grafana\n- Logs centralizados\n- Health checks obrigatórios\n- Estratégia de rollback definida";
            case "Banco de Dados" -> "DIRETRIZES BANCO DE DADOS DGTI:\n- PostgreSQL 15+ obrigatório\n- Versionamento de banco com Flyway ou Liquibase\n- Estratégia de Índices\n- Normalização até 3FN\n- Uso rigoroso de Constraints\n- Evitar N+1 queries";
            case "Segurança" -> "DIRETRIZES SEGURANÇA DGTI:\n- Autenticação: OAuth2/JWT padronizado\n- Autorização: RBAC\n- HTTPS obrigatório\n- Criptografia de senhas\n- Proteção contra OWASP Top 10\n- Validação estrita de input no backend\n- Rate limiting\n- Logs de auditoria\n- Compliance com LGPD";
            case "Onboarding" -> "DIRETRIZES ONBOARDING DGTI:\n- Estruturar curva de aprendizado\n- Guia de setup do ambiente local\n- Documentação de arquitetura base\n- Padrões de commits convencionais\n- Fluxo de Git\n- Políticas de Code Review";
            default -> "DIRETRIZES GERAIS DGTI:\n- Foco em robustez, manutenibilidade e escalabilidade\n- Código e documentação seguindo melhores práticas";
        };
    }

    public String melhorarPrompt(String promptOriginal) {
        String instrucao = String.format("""
            Você é um especialista em Engenharia de Prompt para documentação de software.
            
            Prompt original: "%s"
            
            Refine este prompt para que ele exija respostas mais ricas, técnicas e estruturadas, adicionando o contexto DGTI/UERJ.
            Retorne APENAS o prompt melhorado.
            """, promptOriginal);
        
        return this.chatClient.prompt().user(instrucao).call().content();
    }
}