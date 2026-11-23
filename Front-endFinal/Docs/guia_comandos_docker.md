# Guia de comandos Docker e Docker Compose

Referência dos comandos usados na operação da stack da Biblioteca de Prompts. Todos os
comandos pressupõem o terminal aberto na pasta que contém o `docker-compose.yml`.

---

## 1. Build e rebuild

Alterações no código-fonte não chegam aos containers automaticamente: as imagens
construídas localmente — `biblioteca-prompts-backend` e
`biblioteca-prompts-frontend` — precisam ser reconstruídas. Os demais serviços
(Postgres, Keycloak, Docling, Open WebUI, Nginx) usam imagem pronta: para eles
o comando é `docker compose pull`, não `build`.

### `docker-compose build`

Reconstrói as imagens dos serviços que declaram `build:` no compose. Camadas
cujas entradas não mudaram são reaproveitadas do cache, o que torna o rebuild
muito mais rápido que o primeiro build.

### `docker-compose build --no-cache`

Reconstrói ignorando o cache de camadas.

O cache do Docker é invalidado pela mudança do arquivo declarado em cada `COPY`.
Isso falha em dois casos comuns: quando a dependência é resolvida por faixa de
versão (`^1.2.0`) e uma versão nova foi publicada sem que `package.json` tenha
mudado; e quando o `Dockerfile` executa um comando cujo resultado depende de
rede, como `apt-get install` ou `git clone` de um branch.

Nesses casos o cache serve conteúdo desatualizado e o sintoma é um
comportamento que não corresponde ao código em disco. O `--no-cache` é o teste
que descarta essa hipótese.

---

## 2. Subir e parar

### `docker-compose up -d`

Cria e inicia todos os serviços. O `-d` (*detached*) devolve o terminal após a
subida; sem ele o processo fica em primeiro plano exibindo os logs agregados, e
encerrar o terminal para os containers.

### `docker-compose up -d --build`

Reconstrói as imagens e sobe em seguida. É a forma usual após alterar código.

### `docker-compose down`

Para e remove os containers e a rede. Os volumes nomeados — onde fica o banco de
dados — **não** são removidos, de modo que os dados persistem entre uma parada e
a próxima subida.

### `docker-compose down -v`

Remove também os volumes. Apaga o banco de dados, o realm já importado do
Keycloak e o cache de modelos de embedding do Open WebUI. Em ambiente com dados
reais, exportar antes.

### `docker-compose restart <servico>`

Reinicia um serviço sem recriar o container. Suficiente quando a alteração foi
em arquivo montado por volume; insuficiente quando foi em variável de ambiente
do compose, que exige `up -d` para recriar o container.

---

## 3. Diagnóstico

### `docker-compose ps`

Estado de todos os serviços da stack, com portas publicadas e resultado do
healthcheck. É o primeiro comando ao investigar qualquer falha.

### `docker logs <container>`

Saída padrão do container desde a sua criação.

### `docker logs --tail 50 -f <container>`

- `--tail 50` — limita às últimas 50 linhas, evitando percorrer todo o histórico.
- `-f` — acompanha a saída em tempo real. `Ctrl+C` encerra o acompanhamento sem
  afetar o container.

Útil para correlacionar uma ação na interface com o que o backend registra no
mesmo instante.

### `docker inspect <container>`

Configuração efetiva do container em JSON: variáveis de ambiente resolvidas,
volumes montados, redes e estado do healthcheck. Resolve a dúvida sobre qual
valor uma variável do `.env` realmente assumiu:

```bash
docker inspect biblioteca-prompts-backend --format '{{range .Config.Env}}{{println .}}{{end}}'
```

### `docker stats`

Consumo de CPU e memória por container em tempo real. Relevante ao avaliar se o
reranking do RAG está saturando a CPU do host.

---

## 4. Limpeza

Imagens substituídas por rebuilds, containers parados e redes órfãs acumulam em
disco. Em desenvolvimento ativo, o volume ocupado cresce rápido.

### `docker system prune`

Remove containers parados, redes sem uso e imagens pendentes (*dangling*) — as
que perderam a tag por terem sido substituídas por um rebuild. Pede confirmação.
Não remove volumes nem imagens em uso.

### `docker system prune -a --volumes`

Remove tudo que não esteja em uso por um container em execução, **incluindo
volumes**. Isso apaga o banco de dados, o realm do Keycloak e o cache de
modelos.

O escopo é o daemon inteiro, não apenas este projeto: volumes de outras stacks na
mesma máquina também são apagados. Antes de executar, pare o que deve ser
preservado e confira `docker volume ls`.

### `docker builder prune`

Remove apenas o cache de build. Libera espaço considerável sem tocar em
containers, imagens ou volumes — alternativa mais segura quando a intenção é
somente recuperar disco.

---

## 5. Acesso ao interior do container

### `docker exec -it <container> sh`

Abre um shell interativo dentro do container em execução.

- `exec` — executa um comando em container já em execução.
- `-it` — aloca terminal interativo.
- `sh` — as imagens baseadas em Alpine (`postgres:alpine`, `nginx:alpine`) não
  têm `bash`; nelas o shell é `sh`. Em imagens Debian, `bash` está disponível.

`exit` encerra a sessão sem parar o container.

Usos recorrentes:

```bash
# Consultar o banco diretamente
docker exec -it biblioteca-prompts-postgres psql -U biblioteca_prompts -d bibliotecapromptsdb

# Conferir se um arquivo chegou ao container pelo volume
docker exec biblioteca-prompts-backend ls -la /app/resources

# Testar conectividade entre containers pela rede interna
docker exec biblioteca-prompts-backend curl -s http://biblioteca-prompts-keycloak:8080/health/ready
```

O último comando é o que distingue falha de rede de falha de aplicação: se
responde de dentro do container mas não do host, o problema está na publicação
da porta, não no serviço.

---

## Resumo operacional

| Situação | Comando |
|---|---|
| Subir a stack | `docker-compose up -d` |
| Aplicar alteração de código | `docker-compose up -d --build` |
| Aplicar alteração no `.env` | `docker-compose up -d` (recria os containers) |
| Comportamento não corresponde ao código | `docker-compose build --no-cache` e depois `up -d` |
| Verificar o estado dos serviços | `docker-compose ps` |
| Investigar falha em um serviço | `docker logs --tail 50 -f <container>` |
| Parar preservando os dados | `docker-compose down` |
| Recomeçar do zero | `docker-compose down -v` |
