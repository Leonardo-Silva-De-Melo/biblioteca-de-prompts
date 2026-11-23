# Biblioteca de Prompts — Passo a passo de implantação da camada de IA

Validado com: Docker Engine 29.2.0, Compose v5.0.2, PostgreSQL 16.14,
Ollama 0.30.10, e um servidor de inferência com GPU de 16 GB de VRAM.
Ver `versoes_ambiente.txt`.

Cada fase tem um **critério de sucesso**. Não avance sem atingi-lo — as falhas
desta stack são silenciosas, e o custo de descobrir tarde é retrabalho de indexação.

---

## Fase 0 — Segurança e backup (~10 min)

### 0.1 Gerar o segredo do client no Keycloak

O realm é importado de `keycloak-config/`, então o segredo do client precisa ser
gerado na sua instalação — nunca reaproveite um valor de exemplo.

1. Abra o console do Keycloak (`KEYCLOAK_PUBLIC_URL`) e faça login como admin
2. Realm `biblioteca-prompts` → Clients → `open-webui` → aba **Credentials**
3. **Regenerate Secret** e copie o novo valor para `OAUTH_CLIENT_SECRET` no `.env`

### 0.2 Backup do banco

Obrigatório se você já tem dados: a Fase 3 troca a imagem do Postgres, e o
Keycloak vive nesse banco.

```bash
docker exec biblioteca-prompts-postgres pg_dump -U biblioteca_prompts bibliotecapromptsdb > backup_pre_ia.sql
```

Confira que o arquivo não está vazio antes de seguir.

> O padrão `backup_*.sql` está no `.gitignore`: o dump contém hashes de senha do
> Keycloak e o histórico de conversas, e não deve ir para o repositório.

> **Atenção ao nome do banco em instalações existentes.** O `POSTGRES_DB` e o
> `POSTGRES_USER` do `.env` só têm efeito na criação do volume: num volume que
> já existe, o banco criado originalmente continua lá, com o nome que tinha na
> primeira subida. Confira o nome real antes do `pg_dump` acima:
>
> ```bash
> docker exec biblioteca-prompts-postgres psql -U postgres -c "\l"
> ```
>
> Trocar os nomes exige recriar o volume (`docker compose down -v`), o que apaga
> o realm do Keycloak e as contas do Open WebUI — ver `keycloak-config/README.md`.

### 0.3 Criar o `.env`

Copie `.env.example` para `.env` e preencha todos os campos obrigatórios.
Para gerar chaves aleatórias:

```bash
openssl rand -base64 32
```

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Critério de sucesso:** `.env` com todos os campos obrigatórios preenchidos e,
se havia dados, um `backup_*.sql` com conteúdo.

---

## Fase 1 — Reunir o acervo (~5 min)

Coloque os PDFs em `arquivos_uerj/originais/`:

```powershell
# a partir da pasta Front-Back do projeto
New-Item -ItemType Directory -Force arquivos_uerj\originais
Move-Item arquivos_uerj\*.pdf arquivos_uerj\originais\
```

```bash
# equivalente em Linux/macOS
mkdir -p arquivos_uerj/originais
mv arquivos_uerj/*.pdf arquivos_uerj/originais/
```

`originais/` nunca é escrito por nada — é só a origem de onde você anexa os
documentos no Open WebUI. **Não existe mais a pasta `processados/`:** com o
Docling, a conversão acontece no momento do anexo, em memória, e não gera uma
segunda cópia em disco para manter em sincronia.

> A pasta está no `.gitignore`: documentos institucionais podem conter dados
> pessoais (CPF, matrícula, endereço) e não vão para o repositório.

**Critério de sucesso:** PDFs em `originais/`.

---

## Fase 2 — Subir o Docling (~15 min, quase tudo download)

Detalhes e armadilhas em `GUIA_DOCLING.md`. Aqui, o mínimo.

### 2.1 Conferir o espaço em disco — antes do pull

A imagem `docling-serve-cpu` tem **~4,4 GB**.

```bash
docker system df
```

Em Windows, o disco virtual do Docker fica no C: por padrão. Com o disco cheio,
o sintoma não é um erro claro: o `docker ps` e o `docker info` simplesmente
travam. Para mover, use **Docker Desktop → Settings → Resources → Advanced →
Disk image location**.

### 2.2 Baixar e subir

```bash
docker compose pull docling
```
```bash
docker compose up -d docling
```

### 2.3 Verificar

```bash
docker ps --filter name=docling --format "{{.Names}} | {{.Status}}"
```
```bash
curl -s http://localhost:5001/health
```

### 2.4 Testar a conversão sem o Open WebUI

Este é o teste que separa "o Docling está quebrado" de "o Open WebUI não o usa":

```bash
curl -s -X POST http://localhost:5001/v1/convert/file \
  -F "files=@arquivos_uerj/originais/LeiOrdinria6701-2014.pdf" \
  -F "to_formats=md" \
  -F "do_ocr=false" \
  | head -c 2000
```

Há também uma interface própria para conversão manual: **http://localhost:5001/ui**.

**Critério de sucesso:** o container em `Up` e o `curl` devolvendo Markdown com a
numeração de artigos preservada. Se vier Markdown **vazio**, o PDF é escaneado e
precisa de OCR — ver B.3 do `GUIA_DOCLING.md`.

---

## Fase 3 — Migrar para pgvector (~10 min) — FASE DE RISCO

Esta é a única fase que mexe em algo que já funciona. A imagem sai de
Alpine/musl para Debian/glibc; é o mesmo PostgreSQL 16 e o diretório de dados
normalmente é lido sem problema, mas a mudança de biblioteca C pode afetar regras
de *collation* e índices em colunas de texto. Como o Keycloak vive nesse banco,
o `backup_pre_ia.sql` da Fase 0 é a sua rede.

```bash
docker compose down
```
```bash
docker compose up -d postgres
```
```bash
docker exec -it biblioteca-prompts-postgres psql -U biblioteca_prompts -d bibliotecapromptsdb -c "CREATE EXTENSION IF NOT EXISTS vector;"
```
```bash
docker compose up -d
```

**Critério de sucesso:** você consegue **logar no Open WebUI pelo SSO**. É esse o
teste que prova que o Keycloak sobreviveu à migração. Se não logar, restaure:

```bash
docker compose down; docker volume rm front-back_postgres-data
```

e reimporte o dump em um Postgres novo.

---

## Fase 4 — Escolher os modelos

Para rodar localmente, basta o `llama3.2` (~2 GB):

```bash
ollama pull llama3.2
```

Em servidor com GPU, os modelos de chat ficam na máquina apontada por
`OLLAMA_BASE_URL`, e os embeddings rodam dentro do próprio Open WebUI.

### O que mudou: tool calling deixou de ser eliminatório

No desenho antigo (MCP), a leitura de documento dependia de o modelo **chamar
uma ferramenta**. Um modelo fraco em tool calling não lia documento nenhum —
respondia de memória, com fluência, e inventava. Isso descartava boa parte da
lista antes de qualquer discussão sobre qualidade.

Com o Docling, a extração é parte do pipeline de documentos: o texto chega ao
modelo pelo contexto do RAG, sem depender de tool calling. O critério agora é o
usual — compreensão de português e tamanho de contexto útil.

| Modelo | Serve aqui? |
|---|---|
| `llama3.2:latest` | **Uso local** — ~2 GB, suficiente para validar a stack |
| `qwen3:14b` | **Principal recomendado em servidor** — 8,6 GB, bom em português |
| `qwen3-vl:8b` | **Visão** — 5,7 GB, para imagens anexadas |
| `gpt-oss:20b` | Alternativa a testar — 12,8 GB, MoE, bom raciocínio |
| `qwen3:30b` | Não cabe: 17,3 GB não cabem em 16 GB de VRAM — vai fazer offload |
| `phi4:14b` | Fraco em português |
| `codellama`, `qwen3-coder`, `deepseek-coder-v2`, `devstral` | Modelos de código |

Orientação, não garantia. **Confirme na prática** com o teste de aceitação, com
os seus próprios documentos — não por benchmark genérico.

### Sobre o `qwen3:30b`

A observação de VRAM continua valendo, só que aplicada à máquina que hospeda os
modelos: 17,3 GB não cabem nos 16 GB da RTX 5070 Ti. O Ollama despeja a diferença
na RAM.

Atenuante: é MoE com ~3 B de parâmetros ativos por token, e essa arquitetura
tolera offload parcial bem melhor que um modelo denso. Deve ficar utilizável,
porém lento.

Comece pelo `qwen3:14b`, que cabe inteiro. Compare com o `qwen3:30b` e o
`gpt-oss:20b` usando o teste de aceitação, com os seus editais — não por
benchmark genérico.

### Embeddings

Nada a fazer aqui: `intfloat/multilingual-e5-large` é baixado automaticamente
pelo Open WebUI na primeira indexação (~1,1 GB).

Ele roda em CPU, porque esta máquina só tem Intel UHD integrada. A **indexação**
fica lenta; a consulta depois é rápida. Para o acervo atual é irrelevante. Se o
acervo crescer para milhares de PDFs, peça o `bge-m3` no Ollama da máquina com
GPU e troque o motor para `ollama` — lembrando que trocar o modelo obriga a
reindexar tudo.

**Critério de sucesso:** os modelos aparecem no seletor do Open WebUI e uma
pergunta simples responde.

---

## Fase 5 — Configurar a extração e o RAG (~10 min, interface)

Ver `CONFIGURACAO_RAG.md` e `GUIA_DOCLING.md`.

### 5.1 Confirmar que o Docling está ativo

**Admin Panel → Settings → Documents**

| Campo | Valor |
|---|---|
| Content Extraction Engine | `Docling` |
| Docling Server URL | `http://docling:5001` |
| OCR | desligado (ver B.3 do `GUIA_DOCLING.md`) |

**Isto não é opcional conferir pela interface.** As variáveis do Docling são
PersistentConfig: numa instalação que já subiu antes, o valor do `.env` é
ignorado e o que vale é o que está gravado no banco.

### 5.2 Parâmetros do RAG

Na mesma tela: chunk 1200 / overlap 300 / Top K 8 / embedding `bge-m3` /
busca híbrida ligada.

### 5.3 Criar as bases de conhecimento

Crie as Knowledge bases (`Editais`, `Legislação`, `Processos`) e suba os PDFs
direto de `arquivos_uerj/originais/`. O anexo demora mais que com o extrator
padrão — é o Docling trabalhando.

**Critério de sucesso 1 — a extração passou pelo Docling:**

```bash
docker logs biblioteca-prompts-docling --since 5m 2>&1 | grep "POST /"
```

`POST /v1/convert/file 200` confirma. **Log vazio com o anexo aparentemente
funcionando é o caso perigoso:** significa que o Open WebUI caiu no extrator
interno em silêncio — volte ao 5.1.

**Critério de sucesso 2 — o Postgres passa a mostrar as tabelas de vetores:**

```bash
docker exec -it biblioteca-prompts-postgres psql -U biblioteca_prompts -d bibliotecapromptsdb -c "\dt"
```

---

## Fase 6 — Modelos e prompt (~10 min, interface)

Ver `PROMPT_SISTEMA.md`. Crie dois perfis em Workspace → Models:

| Perfil | Modelo | Uso |
|---|---|---|
| Biblioteca de Prompts — Diário | `qwen3-vl:8b` | Chat, imagens, ofícios anexados |
| Biblioteca de Prompts — Análise Longa | `qwen3:14b` | Editais e pareceres |

(Para teste local, `llama3.2:latest` nos dois.)

Nos dois: system prompt do documento, `num_ctx 32768`, `temperature 0.1`,
Knowledge bases vinculadas.

**`num_ctx` é o item mais fácil de esquecer e o mais caro.** O default do Ollama
é 4096: sem alterá-lo, o edital é truncado em silêncio e o modelo analisa o
começo achando que viu o todo.

---

## Fase 7 — Teste de aceitação (~1 h)

Ver `TESTE_ACEITACAO.md`. **Não pule.** É a única fase que distingue um sistema
correto de um sistema convincente.

Regra de corte: se qualquer uma das três armadilhas falhar, não vai para produção.

---

## Anexo — Onde a inferência realmente acontece

A arquitetura separa **orquestração** de **inferência**, e vale conferir isso
antes de culpar o modelo por lentidão:

- **Máquina da stack** — orquestração: Postgres, Keycloak, backend, frontend,
  Open WebUI, Docling, e os embeddings do RAG (em CPU).
- **Servidor de inferência** — os modelos de chat, em GPU, alcançado por
  `OLLAMA_BASE_URL`.

Essa separação existe porque a máquina de orquestração normalmente não tem GPU
NVIDIA dedicada. Vale checar, no seu ambiente:

| Verificação | Comando | Esperado |
|---|---|---|
| Driver NVIDIA presente | `nvidia-smi` | lista a placa |
| GPU exposta ao container | `docker inspect <container> --format '{{.HostConfig.DeviceRequests}}'` | não pode ser `null` |
| O que o Ollama detectou | logs do Ollama, filtrando `inference compute` | `library=cuda` |
| Modelos disponíveis | `ollama list` | lista não vazia |

Se `nvidia-smi` não responde ou o log diz `library=cpu`, o bloco
`deploy.resources.reservations.devices` do compose é ignorado em silêncio e a
inferência cai para CPU.

Dois consumidores dependem de `OLLAMA_BASE_URL`: o Open WebUI e o backend Java
(ver `application.properties`, com `llama3.2:latest` como modelo default).

---

## Anexo — Riscos da dependência externa

Registrado aqui para decisão consciente, não como impedimento técnico. O sistema
funciona hoje; estes pontos precisam de resposta antes de virar serviço
institucional em produção.

**1. Ponto único de falha.** Se o servidor de inferência for desligado, sair da
rede ou trocar de endereço, param ao mesmo tempo o assistente documental e o
endpoint de IA do backend. Não há fallback configurado. Mitigação mínima: manter
`OLLAMA_BASE_URL` no `.env`, para que a troca de endereço seja uma edição em um
lugar só, e definir o que o sistema deve responder quando o endpoint estiver fora.

**2. Governança dos dados.** Mantenha o servidor de inferência **dentro da rede
da própria instituição**. Assim não há transferência de dados pessoais para fora
nem compartilhamento com terceiro externo: para efeito de LGPD é processamento
dentro do mesmo controlador. O que resta é operacional:

- **Intranet não é criptografia.** O tráfego é HTTP puro na porta 11434 —
  prompts e conteúdo de documentos passam em texto claro pela rede. Se ofícios
  com CPF e matrícula vão circular, vale colocar TLS entre o Open WebUI e o
  Ollama.
- **O Ollama não tem autenticação.** Qualquer host da rede que alcance o endereço
  pode consultar o serviço e apagar modelos. Restrinja por firewall.
- **Verificar se os prompts vão para log.** O default do Ollama é
  `OLLAMA_DEBUG_LOG_REQUESTS=false`. Se estiver `true` no servidor, o conteúdo
  dos documentos fica gravado em disco lá.

**3. Versão do Ollama no servidor.** Confira que não está defasada em relação à
máquina da stack. Verifique especificamente se o modelo de visão responde a
imagens: modelos multimodais recentes exigem versões novas do runtime.

**Caminho para autonomia**, se a instituição quiser trazer a inferência para a
própria stack: uma máquina com GPU NVIDIA de 16 GB ou mais atende bem este caso
de uso. Basta descomentar o serviço `ollama` no compose e apontar
`OLLAMA_BASE_URL` para `http://biblioteca-prompts-ollama:11434`.
