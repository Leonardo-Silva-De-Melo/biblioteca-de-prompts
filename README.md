# Biblioteca de Prompts

Plataforma institucional da Diretoria Geral de Tecnologia da Informação (DGTI) da
Universidade do Estado do Rio de Janeiro (UERJ) para uso de inteligência artificial
no trabalho técnico.

Reúne um acervo compartilhado de prompts, organizado por área de atuação, e um
assistente que executa modelos de linguagem em infraestrutura da própria
Universidade. Nenhum código ou dado institucional sai do perímetro da rede da UERJ:
a inferência ocorre em servidor interno via Ollama, e não em serviços de nuvem.

---

## Arquitetura

A stack sobe com um único `docker compose up`. São sete serviços:

| Serviço | Imagem | Porta padrão | Função |
|---|---|---|---|
| `postgres` | `pgvector/pgvector:pg16` | 5433 | Dados da aplicação, schema do Keycloak e embeddings do RAG |
| `keycloak` | `quay.io/keycloak/keycloak` | 8180 | Identidade, SSO e OIDC (realm `biblioteca-prompts`) |
| `oidc-proxy` | `nginx:alpine` | interna | Normaliza o discovery OIDC entre a rede do Docker e o navegador |
| `backend` | build local | 8080 | API REST (Spring Boot 3.3.5, Java 21) |
| `frontend` | build local | 3001 | Interface web (React 18 + Vite), servida por Nginx |
| `docling` | `docling-serve-cpu` | 5001 (apenas localhost) | Extração de texto de documentos para o RAG |
| `open-webui` | `ghcr.io/open-webui/open-webui` | 3000 | Interface de conversa com os modelos, autenticada pelo Keycloak |

O Ollama **não** faz parte da stack por padrão. Ele roda em servidor externo
apontado por `OLLAMA_BASE_URL`. Há um serviço `ollama` comentado no
`docker-compose.yml` para quem quiser rodá-lo como container — só vale a pena se a
máquina tiver GPU com os drivers configurados, caso contrário a inferência cai para
CPU silenciosamente.

---

## Pré-requisitos

- **Docker Desktop** (ou Docker Engine + Compose v2)
- **Acesso a um servidor Ollama** com os modelos baixados. Pode ser a sua própria
  máquina (`http://host.docker.internal:11434`), outro servidor da rede, ou o
  container opcional da stack.

---

## Como subir

### 1. Configure o ambiente

```bash
cp .env.example .env
```

Abra o `.env` e preencha, no mínimo:

| Variável | Observação |
|---|---|
| `POSTGRES_PASSWORD` | Obrigatória. O compose falha se estiver vazia. |
| `KEYCLOAK_ADMIN_PASSWORD` | Obrigatória. |
| `OLLAMA_BASE_URL` | Obrigatória. Endereço do servidor Ollama. |
| `OLLAMA_MODEL` | Opcional. Padrão: `llama3.2:latest`. |

O `.env` está no `.gitignore` e não deve ser versionado em hipótese alguma.
O `.env.example` documenta todas as variáveis disponíveis.

### 2. Suba a stack

```bash
docker compose up -d --build
```

A primeira execução demora — o Docker precisa baixar as imagens base e compilar
backend e frontend.

### 3. Acesse

| Endereço | Serviço |
|---|---|
| http://localhost:3001 | Biblioteca de Prompts (interface principal) |
| http://localhost:8080 | API REST |
| http://localhost:8180 | Console administrativo do Keycloak |
| http://localhost:3000 | Open WebUI |

O acesso à aplicação é feito por SSO no Keycloak. O banco é PostgreSQL — não há
console H2.

---

## Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `docker compose up -d --build` | Sobe tudo recompilando (use após alterar código) |
| `docker compose up -d` | Sobe sem recompilar |
| `docker compose down` | Para e remove os containers (volumes preservados) |
| `docker compose ps` | Status dos containers |
| `docker compose logs -f backend` | Acompanha os logs do backend |
| `docker compose up -d --build frontend` | Recompila apenas o frontend |

---

## Estrutura

```
Front-Back/
├── docker-compose.yml           orquestra os sete serviços
├── .env.example                 modelo de configuração
├── biblioteca-prompts-api/      backend Spring Boot (Java 21)
├── Front-endFinal/
│   ├── biblioteca-prompts-frontend/   frontend React + Vite
│   └── Docs/                    documentação técnica e relatórios
├── keycloak-config/             realm e configuração do SSO
└── docs/                        guias de implantação e operação
```

---

## Documentação

**Implantação e operação** (`docs/`)

- `PASSO_A_PASSO.md` — implantação da stack do zero
- `CONFIGURACAO_RAG.md` — configuração do RAG no Open WebUI
- `GUIA_DOCLING.md` — extração de documentos com Docling
- `PROMPT_SISTEMA.md` — system prompt e parâmetros dos modelos
- `TESTE_ACEITACAO.md` — roteiro de teste de aceitação

**Arquitetura** (`Front-endFinal/Docs/`)

- `visao_arquitetural_biblioteca_prompts_api.md` — visão geral do backend
- `arquitetura-oidc.md` — login via OIDC entre Keycloak e Open WebUI
- `plano_implementacao_spring_ai.md` — integração Spring AI com Ollama
- `plano_open_webui.md` — integração Open WebUI + Keycloak + Ollama
- `guia_comandos_docker.md` — referência de comandos

---

## Problemas comuns

**`port is already allocated`** — alguma porta já está ocupada. Ajuste a variável
de porta correspondente no `.env` (`FRONTEND_PORT`, `BACKEND_PORT`, etc.).

**`Cannot connect to the Docker daemon`** — o Docker Desktop não está em execução.

**A IA não responde** — verifique se `OLLAMA_BASE_URL` aponta para um servidor
alcançável a partir de dentro do container. Dentro do Docker, `localhost` é o
próprio container; para alcançar o host use `http://host.docker.internal:11434`.

**Alterações no código não aparecem** — o container serve o build anterior. Rode
com `--build`.

---

## Roadmap

Itens projetados e ainda não implementados:

- Log estruturado em JSON com correlação de requisições
- Processamento assíncrono de tarefas longas (fila de mensagens)
- Docker Secrets no lugar de variáveis de ambiente para credenciais
- Dashboards gerenciais com indicadores de uso
- Diagnóstico contínuo a partir das respostas do formulário de entrada

---

Desenvolvido por Leonardo Silva de Melo — DGTI/UERJ.
