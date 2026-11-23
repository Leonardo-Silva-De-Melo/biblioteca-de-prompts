# Plano de Implementação: Chat Interno V2.0 (Spring AI + React)

Este plano detalha a evolução do recurso "Gerar Internamente" da Biblioteca de Prompts, transformando-o de um gerador estático em um Chat Interativo de Alto Padrão (estilo ChatGPT) utilizando os recursos corporativos do Spring AI.

## 1. O Novo Fluxo de Trabalho
As funcionalidades atuais do Open WebUI e os seus Prompts já salvos não serão afetados. Esta é uma evolução isolada da comunicação entre o React e a API Java. A comunicação deixará de ser um HTTP manual simples para adotar a biblioteca oficial da VMware: `spring-ai-ollama-spring-boot-starter`.

---

## 2. Passo a Passo Técnico

### Backend (Java / Spring Boot)

A API passará a usar o motor do Spring AI para gerenciar a conversação.

#### `pom.xml`
- Adicionar dependência do Spring AI Ollama Starter.
- Adicionar BOM (Bill of Materials) do Spring AI para gerenciamento de versões.

#### `application.properties`
- Configurar as propriedades nativas `spring.ai.ollama.base-url` apontando para o IP do Ollama.

#### `OllamaService.java`
- Substituir o uso de `RestTemplate` manual pelo `OllamaChatModel` injetado pelo Spring.
- Implementar **ChatMemory** (`InMemoryChatMemory`) usando o padrão `Advisor` do Spring AI para interceptar requisições e garantir que a IA lembre do histórico da conversa ativa (sem pesar no banco de dados).

#### `OllamaController.java`
- Criar um novo endpoint `/api/v1/ollama/chat/stream`. Este endpoint retornará um fluxo contínuo de dados (`Flux<String>`) via protocolo SSE (Server-Sent Events), permitindo o efeito "máquina de escrever" no Frontend.
- Criar um endpoint `/api/v1/ollama/models` para listar os modelos dinamicamente (consumindo a rota nativa `/api/tags` do computador executando o Ollama).

---

### Frontend (React)

A interface de resultados do Modal será totalmente reconstruída.

#### `src/services/api.js`
- Adicionar um novo método `streamChatOllama` para consumir o endpoint de SSE, atualizando o estado do React a cada nova palavra recebida.

#### `src/components/prompts/ModalIA/ModalIA.jsx`
- **Etapa 2 (Dropdown):** Adicionar um `<select>` buscando os modelos dinamicamente do backend, permitindo ao usuário escolher o "Cérebro" da operação (ex: `llama3.2` ou `gemma3:27b`).
- **Etapa 3 (Chat UI):** Substituir a caixa de texto gigante por uma área de chat rolável com mensagens.
- **Interação:** Adicionar um input no rodapé para o usuário poder conversar e refinar a resposta da IA.
- **Salvar na Biblioteca:** Conectar o botão "Salvar na Biblioteca" para pegar a última mensagem gerada pela IA e enviar um `POST` para a API de Prompts oficial do sistema.

---

## 3. Benefícios Alcançados
- **Experiência de Usuário:** Tela não congela. O texto flui de forma nativa.
- **Transparência:** O usuário sabe exatamente com qual modelo (LLM) está interagindo e pode escolher a potência da máquina.
- **Rastreabilidade e Retenção:** A integração contínua com a "Biblioteca de Prompts" transforma as respostas voláteis da IA em capital intelectual oficial da UERJ.
