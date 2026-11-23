# Visão Arquitetural do Backend — Biblioteca de Prompts

> **Documento:** Análise estrutural e de padrões do projeto `biblioteca-prompts-api`
> **Data:** 2026-06-14
> **Stack:** Java 17 · Spring Boot 3.3.5 · JPA/Hibernate · PostgreSQL · ModelMapper · Spring Security (OAuth2/JWT via Keycloak) · Apache Tika · Ollama (LLM Local)

---

## 1. Estrutura e Padrão Arquitetural

### 1.1. Padrão de organização adotado

O projeto segue uma **Layered Architecture / N-Tier** com organização **"Package by Layer"** (pacote por camada técnica). A árvore principal do código-fonte (`src/main/java/br/uerj/dgti/bibliotecaprompts`) é dividida horizontalmente:

```
br.uerj.dgti.bibliotecaprompts
 ├── BibliotecaPromptsApplication.java          (bootstrap Spring Boot — @SpringBootApplication)
 ├── config/                           (Beans de configuração — segurança, CORS, ModelMapper)
 │    ├── CorsConfig.java              (SecurityFilterChain + CORS + OAuth2 Resource Server)
 │    └── ModelMapperConfig.java        (Bean de mapeamento objeto-objeto)
 ├── controller/                       (Camada de Apresentação — @RestController)
 │    ├── PromptController.java         (CRUD de Prompts + Comentários + Histórico de Versões)
 │    ├── DiagnosticoController.java    (Pesquisa Institucional — Fase 1)
 │    ├── IAController.java             (Arquiteto Virtual — integração Ollama)
 │    ├── FeedbackController.java       (Avaliações por estrelas)
 │    ├── FeedbackIAController.java     (Feedback pós-uso da IA)
 │    ├── FeedbackPlataformaController  (Satisfação geral do sistema)
 │    ├── FavoritoController.java       (Gestão de favoritos)
 │    ├── HistoricoUsoController.java   (Histórico pessoal de uso)
 │    ├── NotificacaoController.java    (Sistema de notificações)
 │    └── StatsController.java          (Dashboard de estatísticas)
 ├── service/                          (Camada de Negócio — @Service)
 │    ├── PromptService.java            (Orquestra CRUD, Comentários, Versões e Mapeamento)
 │    ├── OllamaService.java            (Comunicação HTTP direta com Ollama via RestTemplate)
 │    ├── DiagnosticoService.java       (Regras do Diagnóstico Institucional)
 │    ├── NotificacaoService.java       (Lógica de notificações e leitura)
 │    ├── StatsService.java             (Agregações para o Dashboard Admin)
 │    └── ... (Feedback, Favorito, HistoricoUso)
 ├── model/                            (Entidades JPA — @Entity)
 │    ├── Prompt.java                   (Entidade central — 11 campos + 4 relacionamentos)
 │    ├── Diagnostico.java              (Pesquisa institucional — 15+ campos)
 │    ├── HistoricoEdicao.java          (Versionamento de prompts)
 │    ├── Comentario.java               (Comentários em prompts)
 │    ├── Feedback.java                 (Avaliação por estrelas)
 │    ├── HistoricoUso.java             (Registro de uso pessoal)
 │    ├── Notificacao.java              (Notificações do sistema)
 │    └── ... (Favorito, FeedbackIA, FeedbackPlataforma, PromptVisualizacao)
 ├── dto/                              (Data Transfer Objects)
 │    ├── entidadeDTO/                  (DTOs 1:1 com entidades — PromptDTO, FeedbackDTO, etc.)
 │    ├── RetornoFrontendListaDTO.java  (Envelope de resposta para o frontend)
 │    ├── RetornoPadraoFrontendObjetoDTO.java
 │    ├── RetornoFrontendListaPaginadaDTO.java
 │    ├── PaginacaoInfoDTO.java         (Metadados de paginação)
 │    └── DiagnosticoDTO.java           (DTO do formulário de diagnóstico)
 ├── repository/                       (Spring Data JPA Repositories)
 │    ├── PromptRepository.java         (JPQL customizado para busca e paginação)
 │    └── ... (11 repositories no total)
 ├── exception/                        (Exceptions de domínio customizadas)
 │    ├── exceptionhandler/
 │    │    └── ApiExceptionHandler.java  (@ControllerAdvice global)
 │    ├── RegistroNaoEncontradoException
 │    ├── RegraDeNegocioException
 │    ├── ValidacaoCamposException
 │    ├── ValidacaoTokenException
 │    ├── RegistroJaExistenteException
 │    └── DAOException
 └── util/                             (Helpers, validadores, utilitários)
      ├── UtilRespostaGenerico.java     (Envelope de resposta HTTP padronizado)
      ├── Util.java                     (Mensagens internacionalizáveis)
      ├── CPFValidator.java             (Validação de CPF)
      ├── StringUtils.java / DateUtils.java
      ├── Constantes.java
      └── enums/UsuarioInfo.java
```

### 1.2. Camadas e responsabilidades

| Camada | Pacote | Anotações típicas | Responsabilidade |
|---|---|---|---|
| **Apresentação / API** | `controller` | `@RestController`, `@RequestMapping`, `@CrossOrigin` | Recebe requisições HTTP, extrai parâmetros, delega ao Service e devolve `ResponseEntity`. |
| **Negócio** | `service` | `@Service`, `@Transactional` | Orquestração de regras de negócio, validações, mapeamento Entidade ↔ DTO, integração com Ollama. |
| **Persistência** | `repository` | `@Repository` (interface estendendo `JpaRepository`) | Acesso a dados via Spring Data JPA. Métodos derivados e queries JPQL com `@Query`. |
| **Modelo de Domínio** | `model` | `@Entity`, `@Table`, `@OneToMany`, `@ManyToOne` | Entidades JPA com chave simples (`@GeneratedValue(IDENTITY)`). |
| **Transporte (DTO)** | `dto/entidadeDTO` | Classes POJO | Contratos de entrada/saída. Bean Validation presente nas Entidades (não nos DTOs). |
| **Infra / Cross-Cutting** | `config`, `util`, `exception` | `@Configuration`, `@Component`, `@ControllerAdvice` | Segurança, CORS, exceções globais, helpers e envelope de resposta. |

### 1.3. Fluxo de comunicação entre camadas

```
Controller  ──►  Service  ──►  Repository (JpaRepository)  ──►  PostgreSQL
     ▲                │
     │                ▼
ResponseEntity   OllamaService  ──►  RestTemplate  ──►  Ollama (Llama 3.2 local)
                      │
                      ▼
                 Apache Tika  ──►  Extração de texto (PDF/DOCX)
```

O fluxo é **unidirecional descendente**. Diferente do SAG, alguns Controllers da Biblioteca de Prompts ainda recebem entidades JPA diretamente (ex: `buscarPorId` retorna `Prompt` em vez de `PromptDTO`).

---

## 2. Modelagem de Domínio (JPA/Hibernate)

### 2.1. Entidades centrais

| Entidade | Papel no domínio | Campos-chave |
|---|---|---|
| **Prompt** | Entidade central — armazena prompts técnicos da biblioteca | `titulo`, `categoria`, `textoPrompt`, `autor`, `vezesUsado`, `mediaAvaliacao`, `totalAvaliacoes` |
| **HistoricoEdicao** | Versionamento — snapshots do texto a cada edição | `textoVersao`, `editadoPor`, `motivoEdicao`, `numeroVersao` |
| **Comentario** | Discussões colaborativas por prompt | `texto`, `autor`, `dataCriacao` |
| **Feedback** | Avaliação por estrelas (1-5) vinculada a prompts | `nota`, `comentario`, `usuario` |
| **Diagnostico** | Pesquisa institucional (Fase 1 do projeto) — 15+ campos | `papelPrincipal`, `nivelConhecimentoIA`, `horasPerdidasSemana`, `satisfacaoFerramental` |
| **HistoricoUso** | Registro automático de uso de prompts por usuário | `usuario`, `prompt`, `observacao`, `dataUso` |
| **Notificacao** | Sistema de notificações (comentários, avaliações, marcos) | `tipo`, `mensagem`, `lida`, `usuarioDestino` |
| **Favorito** | Marcação de prompts favoritos por usuário | `promptId`, `usuario` |
| **PromptVisualizacao** | Controle de visualização única (1 contagem por usuário) | `prompt`, `usuario` |
| **FeedbackIA** | Avaliação da qualidade da IA pós-geração | `nota`, `comentario`, `usuario`, `categoria` |
| **FeedbackPlataforma** | Satisfação geral com o sistema | `nota`, `comentario`, `usuario` |

### 2.2. Estratégia de chave primária

Todas as entidades usam **chave simples** com `@GeneratedValue(strategy = GenerationType.IDENTITY)` — delegando a geração de IDs ao PostgreSQL (auto-incremento). Não há uso de chaves compostas (`@EmbeddedId`).

### 2.3. Relacionamentos

A entidade `Prompt` é o **centro gravitacional** do modelo. Ela possui 4 relacionamentos `@OneToMany` bidirecionais com cascata completa:

```
Prompt (1) ──► (N) HistoricoEdicao    (cascade ALL, orphanRemoval)
Prompt (1) ──► (N) Comentario          (cascade ALL, orphanRemoval)
Prompt (1) ──► (N) PromptVisualizacao  (cascade ALL, orphanRemoval)
Prompt (1) ──► (N) Feedback            (cascade ALL, orphanRemoval)
```

- **Fetch:** `FetchType.LAZY` implícito nos `@OneToMany` (padrão JPA).
- **Deleção:** `orphanRemoval = true` garante que ao deletar um Prompt, todos os dados filhos são removidos automaticamente.
- A entidade `Prompt` contém um método de negócio `atualizarEstatisticasAvaliacao()` que recalcula `mediaAvaliacao` e `totalAvaliacoes` com base na coleção `feedbacks`.

### 2.4. Estratégia de persistência

- **Spring Data JPA** sobre **Hibernate**.
- Repositórios são **interfaces** estendendo `JpaRepository<Entidade, Long>`.
- Combinação de:
  - **Query Methods** derivados: `findByAutor`, `existsByPromptIdAndUsuario`, `findByPromptIdOrderByDataEdicaoDesc`.
  - **JPQL via `@Query`**: busca global em múltiplos campos (`buscarPorTermoPaginado`), consultas agregadas (`findMaxNumeroVersaoByPromptId`).
- **Paginação** nativa via `Pageable` + `Page<T>` com DTO de resposta customizado (`PaginaRespostaDTO`).
- **Timestamps automáticos:** `@CreationTimestamp` e `@UpdateTimestamp` nas entidades.

---

## 3. Padrões de Projeto Identificados

| Padrão | Como aparece | Localização |
|---|---|---|
| **DTO (Data Transfer Object)** | Comunicação entre camadas via DTOs. Distinção entre `entidadeDTO/` (CRUD) e DTOs de resposta/paginação. | `dto/entidadeDTO/`, `dto/` |
| **Mapper (manual)** | Mapeamento `Prompt → PromptDTO` feito manualmente nos Services (método `converterParaPaginaDTO` e blocos inline). ModelMapper configurado mas pouco utilizado. | `PromptService.java` |
| **Repository (Spring Data)** | Interfaces sem implementação. 11 repositories cobrindo todo o domínio. | `repository/*.java` |
| **Response Wrapper / Envelope** | `UtilRespostaGenerico` padroniza respostas HTTP com headers customizados (`status`, `mensagem`, `detalhes`). Atualmente usado apenas no `ApiExceptionHandler`. | `util/UtilRespostaGenerico.java` |
| **Strategy (leve)** | `OllamaService.obterPapel()` e `obterContextoCategoria()` usam `switch expressions` para despachar comportamento por categoria — conceitualmente é Strategy. | `OllamaService.java` |
| **Template Method** | `ApiExceptionHandler extends ResponseEntityExceptionHandler` sobrescreve `handleMethodArgumentNotValid`. | `ApiExceptionHandler.java` |
| **Singleton (via Spring)** | Todos os beans `@Component`/`@Service` são singletons gerenciados pelo container. | Toda a aplicação |
| **Builder (consumido)** | Builders nativos do Spring (`HttpSecurity DSL`, `PageRequest.of()`). O projeto não declara Builders próprios. | configs, services |

---

## 4. Uso do Ecossistema Spring

### 4.1. Injeção de Dependência

- Padrão **Constructor Injection** nos Services e Controllers principais (`PromptService`, `PromptController`).
- Padrão **Field Injection com `@Autowired`** no `ApiExceptionHandler` e `UtilRespostaGenerico` (legado herdado do SFS/SAG).
- Sem uso de Lombok (`@RequiredArgsConstructor`).

### 4.2. Transações

- `@Transactional` aplicado **na classe** `PromptService` (escopo global).
- Métodos de leitura anotados individualmente com `@Transactional(readOnly = true)` — política correta para otimização de performance.
- Métodos de escrita herdam o `@Transactional` da classe sem controle fino por método.

### 4.3. Tratamento de Exceções

`ApiExceptionHandler.java` é o `@ControllerAdvice` global que estende `ResponseEntityExceptionHandler`. Mapeamento:

| Exception | HTTP Status | Tipo |
|---|---|---|
| `RegistroNaoEncontradoException` | 404 | Customizada do domínio |
| `ValidacaoCamposException` | 400 | Customizada |
| `ValidacaoTokenException` | 400 | Customizada (token JWT) |
| `RegistroJaExistenteException` | 400 | Customizada |
| `RegraDeNegocioException` | 400 | Customizada (regras de negócio) |
| `MethodArgumentNotValidException` | 400 | Bean Validation (override do Spring) |
| `DataIntegrityViolationException` | 409 | Spring (violação de FK/UK) |
| `Exception` (fallback) | 500 | Captura genérica com tradução de `"is null"` |

Cada handler delega para `UtilRespostaGenerico.exceptionPadraoFrontend_4XX/5XX(...)`, mantendo o envelope de erro consistente.

### 4.4. Validações

- **Bean Validation** (`@NotBlank`, `@Size`) está declarada **nas Entidades** (`Prompt.java`), e **não nos DTOs** (`PromptDTO.java`).
- `@Valid` **não é utilizado** nos `@RequestBody` dos Controllers (as validações só disparam no `persist`/`merge` do JPA, não na entrada HTTP).
- **Validações de regra de negócio** ficam nos Services (verificação de visualização duplicada, proteção da versão original, segurança de pertencimento prompt↔versão).

### 4.5. Segurança

`CorsConfig.java` configura **Spring Security stateless com OAuth2/JWT via Keycloak**:

- `SessionCreationPolicy` implícito stateless (padrão OAuth2 Resource Server).
- `csrf.disable()` — apropriado para API REST.
- `oauth2ResourceServer(jwt(Customizer.withDefaults()))` — validação automática de tokens JWT do Keycloak.
- Endpoint aberto: `/actuator/**`. Todos os demais exigem autenticação.
- CORS configurado para `localhost:3000`, `localhost:5173`, `localhost:5174`, `localhost:5175`, `localhost:8180`.

### 4.6. Integração com IA (Ollama)

O `OllamaService.java` é a peça-chave da integração com IA local:

- **Comunicação:** `RestTemplate` fazendo POST direto para `http://localhost:11434/api/generate`.
- **Modelo:** `llama3.2` (configurável via `application.properties`).
- **Parâmetros:** `temperature: 0.3` (factual), `top_p: 0.85`, `num_predict: 4000`.
- **Extração de documentos:** Apache Tika para ler PDFs/DOCX anexados pelo usuário.
- **System Prompt:** Cada categoria (Documentação, Arquitetura, Testes, etc.) tem um papel e diretrizes específicas injetados automaticamente antes da pergunta do usuário.
- **8 categorias** com papéis especializados (Strategy via `switch expression`).

---

## 5. Fluxo de Dados Típico (do HTTP ao Banco)

Tomando como exemplo a **criação de um Prompt** (`POST /api/prompts`):

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ 1. CLIENTE → HTTP POST + Bearer Token (Keycloak) + JSON (PromptDTO)          │
└───────────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ 2. Spring Security (OAuth2 Resource Server)                                   │
│    - Valida JWT contra Keycloak (issuer-uri).                                │
│    - Se falhar → 401 Unauthorized.                                           │
└───────────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ 3. PromptController.criar(@RequestBody PromptDTO dto)                        │
│    - Recebe o DTO do frontend.                                               │
│    - NÃO usa @Valid (validação não é disparada na entrada HTTP).              │
│    - Delega diretamente para o Service.                                      │
└───────────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ 4. PromptService.criar(dto)  @Transactional (herdado da classe)              │
│    a. Cria nova instância de Prompt (Entidade JPA).                          │
│    b. Copia campos do DTO para a entidade (mapeamento manual inline).        │
│    c. promptRepository.save(entidade) → Hibernate INSERT.                    │
│    d. salvarHistorico(prompt, autor, "Criação inicial") → cria versão 1.     │
│    e. Retorna a ENTIDADE Prompt (não o DTO).                                 │
└───────────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ 5. Controller retorna diretamente o Prompt (Entidade JPA serializada).       │
│    O Jackson converte para JSON incluindo TODOS os campos e coleções lazy.   │
│    Retorno: HTTP 200 OK (sem envelope UtilRespostaGenerico).                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Pontos-chave do fluxo (Diferenças em relação ao SAG)

- **Validação:** Apenas via JPA (`@NotBlank` na Entidade dispara no `save()`), não na entrada do Controller (sem `@Valid` no DTO).
- **Sem trilha de auditoria formal:** Diferente do SAG, não há `LogService` nem `GeradorLogManutencao`. O versionamento de prompts (`HistoricoEdicao`) serve como log parcial.
- **Vazamento de entidade JPA:** Em vários endpoints, o Controller retorna a entidade JPA diretamente, expondo a estrutura interna do banco.
- **Resposta sem envelope:** O retorno de sucesso não usa `UtilRespostaGenerico` — o envelope é usado apenas nos erros (via `ApiExceptionHandler`).

---

## 6. Comparativo Arquitetural: Biblioteca de Prompts vs SAG

| Aspecto | SAG | Biblioteca de Prompts | Status |
|---|---|---|---|
| Organização de pacotes | Package by Layer | Package by Layer | Alinhado |
| Chave primária | `@EmbeddedId` (composta) | `@GeneratedValue(IDENTITY)` (simples) | Adequado ao domínio |
| Injeção de dependência | Field Injection (`@Autowired`) | Constructor Injection (nos principais) | Divergência deliberada |
| Controller retorna DTO | Sim (100% DTO) | Parcial (mistura Entidade e DTO) | Lacuna |
| Bean Validation nos DTOs | Sim (`@NotBlank`, `@Size`, `@Pattern`) | Não (validação nas Entidades) | Lacuna |
| `@Valid` nos Controllers | Sim | Não | Lacuna |
| Envelope de resposta | Sempre via `UtilRespostaGenerico` | Apenas nos erros | Lacuna |
| Mapeamento `toDTO()`/`toEntity()` | Centralizado (método privado único) | Repetido 4x inline | Lacuna |
| Documentação Swagger | Sim (SpringDoc + `@Tag` + `@Operation`) | Não configurado | Lacuna |
| Trilha de auditoria | `LogService` + `GeradorLogManutencao` | Não existe (versionamento parcial) | Opcional |
| Tratamento de exceções | `@ControllerAdvice` completo | `@ControllerAdvice` completo | Alinhado |
| Segurança | JWT interno (`br.uerj:autenticador`) | OAuth2/JWT via Keycloak | Divergência deliberada |
| Multi-DataSource | Sybase + PostgreSQL | Apenas PostgreSQL | Adequado |
| Caching | `@EnableCaching` + `@Cacheable` | Não utilizado | Opcional |
| Integração com IA | Não existe | Ollama + Apache Tika | Sem equivalente no SAG |

---

## Conclusões

A arquitetura do `biblioteca-prompts-api` segue o **Layered Architecture** e compartilha os
mesmos pilares do SAG (Controller → Service → Repository). As divergências em
relação ao padrão de referência são deliberadas e se justificam pelo domínio:

1. **Autenticação delegada.** OAuth2/JWT via Keycloak em lugar do autenticador
   interno, porque o SSO precisa ser compartilhado com o Open WebUI, que é um
   serviço de terceiros e não poderia consumir um token proprietário.
2. **Constructor Injection** nos componentes principais, em lugar do Field
   Injection do SAG — escolha que torna as dependências explícitas e os serviços
   instanciáveis em teste sem contexto Spring.
3. **Integração com modelo local** via Ollama, sem equivalente no SAG por não
   fazer parte do escopo daquele sistema.
4. **Módulo de diagnóstico** para coleta das respostas da equipe.

As lacunas da tabela acima — DTOs, Bean Validation e envelope de resposta — são
pontos em que o `biblioteca-prompts-api` ainda não atingiu o padrão do SAG, e não
divergências intencionais.

Para **alinhamento completo com o padrão SAG**, as seguintes ações são recomendadas (em ordem de prioridade):

1. Mover as anotações de Bean Validation (`@NotBlank`, `@Size`) para os DTOs e ativar `@Valid` nos Controllers.
2. Centralizar o mapeamento `Prompt → PromptDTO` em um método privado `toDTO()` no Service.
3. Eliminar o retorno de entidades JPA nos Controllers (criar `ComentarioDTO`, `HistoricoEdicaoDTO`).
4. Remover blocos de código morto (comentados) no `PromptService` e `PromptController`.
5. Configurar SpringDoc/Swagger para documentação visual da API.

---

## Confirmação da Operação

- **Arquivo criado:** `visao_arquitetural_biblioteca_prompts_api.md` (este documento) na raiz do projeto.
- **Nenhum outro arquivo do sistema foi modificado, refatorado ou excluído.** O mapeamento foi estritamente de leitura.
