# Guia do Docling + integração com Open WebUI

Sequência completa para o Open WebUI ler documentos do acervo com extração
estruturada. Escrito a partir da implantação real da Biblioteca de Prompts
(DGTI/UERJ) — inclui as armadilhas que só aparecem na prática.

Este guia substitui o `GUIA_MCP.md`. A arquitetura anterior (servidor MCP +
ponte `mcpo` + pipeline de OCR com `ocrmypdf`/Tesseract) foi retirada: o
Docling faz sozinho o trabalho de extração, e a integração com o Open WebUI é
nativa, sem código próprio para manter.

---

## Visão geral: duas peças, não quatro

```
Open WebUI  ──►  docling-serve  ──►  documento anexado
(interface)      (extração)          (PDF, DOCX, PPTX, XLSX)
```

| Peça | Papel | Protocolo |
|---|---|---|
| Open WebUI | Interface, fatiamento (chunk), indexação e chat | HTTP |
| `docling-serve` | Converte o documento em Markdown estruturado | HTTP (REST) |

O que mudou em relação ao desenho antigo:

| Antes | Agora |
|---|---|
| OCR prévio (`ocrmypdf`) gerava `arquivos_uerj/processados/` | nada é pré-processado; o anexo vai direto |
| Servidor MCP em Python lia os PDFs | o Open WebUI lê, via Docling |
| `mcpo` traduzia OpenAPI ⇄ MCP | não existe mais tradutor |
| Tesseract dentro de imagem customizada | imagem oficial do Open WebUI, sem build próprio |
| Ferramentas tinham de ser marcadas no modelo | a extração é do pipeline de documentos, não é tool calling |

**Consequência importante:** a leitura de documento deixou de depender de o
modelo saber chamar ferramenta. Antes, um modelo fraco em tool calling não lia
documento nenhum (e inventava). Agora o texto chega ao modelo pelo contexto do
RAG, independentemente disso.

---

## PARTE A — O serviço `docling-serve`

### A.1 O serviço no compose

```yaml
  docling:
    image: quay.io/docling-project/docling-serve-cpu:latest
    container_name: biblioteca-prompts-docling
    ports:
      - "127.0.0.1:${DOCLING_PORT:-5001}:5001"
    environment:
      - DOCLING_SERVE_ENABLE_UI=true
      - UVICORN_WORKERS=1
      - DOCLING_SERVE_MAX_SYNC_WAIT=600
      - OMP_NUM_THREADS=4
      - MKL_NUM_THREADS=4
      - DOCLING_SERVE_ENG_LOC_NUM_WORKERS=1
    mem_limit: 6g
    security_opt:
      - no-new-privileges:true
    networks:
      - biblioteca-prompts-network
    restart: unless-stopped
```

Não há `volumes`. O Docling não precisa ver `arquivos_uerj/` — ele recebe o
arquivo pelo corpo da requisição HTTP, enviado pelo Open WebUI. A pasta
`arquivos_uerj/originais/` existe apenas como origem para quem vai anexar.

### A.2 `UVICORN_WORKERS=1` é obrigatório

Com mais de um worker, o estado das tarefas de conversão fica dividido entre
processos: a requisição que cria a tarefa cai num worker, a que consulta o
resultado cai em outro.

**Sintoma:** `Task Not Found` em conversões que claramente começaram.

Só seria seguro escalar workers com um backend de estado compartilhado (Redis).
Para o volume deste acervo, um worker resolve.

### A.3 A variante `-cpu` não é detalhe de economia

| Imagem | Tamanho | Quando usar |
|---|---|---|
| `docling-serve-cpu` | ~4,4 GB | máquina sem GPU dedicada à inferência |
| `docling-serve` | ~8,7 GB | embute CUDA; só faz sentido com GPU |
| `docling-serve-cu128` | ~8,7 GB | GPU NVIDIA, CUDA 12.8 |

Os modelos de layout e de reconhecimento de tabela **já vêm dentro da imagem** —
não há download na primeira conversão. Em troca, o `docker pull` inicial é
grande: confira o espaço livre em disco antes (ver A.5).

### A.4 Teto de memória e de threads

A extração carrega modelos de visão computacional em memória. Sem `mem_limit`,
um PDF grande consome toda a RAM e o kernel mata **outro** container da stack —
em geral o Postgres, que é o que mais memória tem alocada.

`OMP_NUM_THREADS` e `MKL_NUM_THREADS` limitam o paralelismo interno das
bibliotecas numéricas. Sem eles, elas assumem todos os núcleos do host e
competem com o Ollama durante a inferência.

### A.5 Espaço em disco — verifique antes

`docker pull` da imagem `-cpu` precisa de **~4,4 GB livres** no disco onde fica
o disco virtual do Docker. Em Windows, o padrão é o C:.

```bash
docker system df
```

Se o C: estiver cheio, mova o disco virtual em
**Docker Desktop → Settings → Resources → Advanced → Disk image location**.
Com o disco cheio, o sintoma não é um erro claro: o `docker ps` e o
`docker info` simplesmente travam.

---

## PARTE B — Ligar o Open WebUI ao Docling

### B.1 As três variáveis

```yaml
      - CONTENT_EXTRACTION_ENGINE=docling
      - DOCLING_SERVER_URL=http://docling:5001
      - DOCLING_DO_OCR=false
```

Aqui o endereço é o nome do serviço na rede do Docker (`docling`), e isso
funciona — diferente do desenho antigo com `mcpo`, em que o registro era feito
pelo **navegador** e exigia `localhost`. A extração é chamada pelo backend do
Open WebUI, que está na mesma rede.

### B.2 PersistentConfig — a armadilha principal

Essas variáveis são **PersistentConfig**: o valor do ambiente é lido apenas na
**primeira** subida do Open WebUI. Depois disso o valor passa a viver no banco,
e o `.env` deixa de ter efeito.

| Situação | Onde configurar |
|---|---|
| Instalação nova (volume vazio) | `.env` / `docker-compose.yml` |
| Instalação já existente | **Admin → Configurações → Documentos** |

**Sintoma de quem não sabe disso:** altera `DOCLING_DO_OCR` no `.env`, reinicia,
e o comportamento não muda. Não é cache nem bug — o valor efetivo está no banco.

### B.3 OCR desligado: por quê, e o que isso custa

Os quatro documentos do acervo atual são PDF de origem digital — têm camada de
texto própria. Verificado antes de decidir: todos contêm objetos `/Font` e
nenhum fluxo de imagem `DCTDecode`.

Rodar OCR sobre texto nativo:

- custa cerca de **dez vezes** mais tempo de indexação;
- pode **sobrepor** uma transcrição aproximada ao texto exato que já existe.

**A contrapartida é séria.** Com `DOCLING_DO_OCR=false`, um PDF puramente
escaneado (só imagem) é indexado **vazio** e o Open WebUI reporta **sucesso**.
Não há aviso, não há erro no log. O documento aparece na base de conhecimento
com zero conteúdo, e o modelo responde "não encontrei" para perguntas cuja
resposta está no papel.

Antes de incluir documento escaneado no acervo:

```
DOCLING_DO_OCR=true
DOCLING_OCR_ENGINE=tesseract
DOCLING_OCR_LANG=por
```

(numa instalação já existente, em Admin → Configurações → Documentos — ver B.2)

**Como saber se um PDF tem camada de texto**, antes de anexar:

```bash
# Tem fonte embutida? (texto nativo)
grep -c "/Font" arquivos_uerj/originais/ARQUIVO.pdf

# É imagem? (digitalização)
grep -c "DCTDecode" arquivos_uerj/originais/ARQUIVO.pdf
```

Zero no primeiro e número alto no segundo = documento escaneado, precisa de OCR.

> Preferir `DOCLING_DO_OCR` à variável `DOCLING_PARAMS` (JSON): o campo JSON
> teve bug de persistência na interface e pode não ter efeito nenhum.

### B.4 Use `DOCLING_DO_OCR`, não um pipeline próprio

A tentação é pré-processar o acervo com `ocrmypdf` e anexar os PDFs já
"ocerizados". Era exatamente o desenho antigo, e ele tinha dois custos: uma
segunda cópia de cada documento (`processados/`) que precisava ser mantida em
sincronia com a original, e um script de ingestão por sistema operacional. O
Docling decide por documento, na hora. Deixe-o decidir.

---

## PARTE C — Configuração no Open WebUI

### C.1 Criar a base de conhecimento

**Workspace → Knowledge → `+`**

Anexe os documentos de `arquivos_uerj/originais/`. A extração via Docling
acontece neste momento — o anexo demora mais que com o extrator padrão, e é
esperado.

> A dimensão do vetor é fixada na **primeira** indexação. Trocar o modelo de
> embedding depois obriga a reindexar tudo. `multilingual-e5-large` e `bge-m3`
> têm os dois 1024 dimensões, então são intercambiáveis sem reindexar.

### C.2 Criar o modelo

**Workspace → Models → `+`**

| Item | Valor |
|---|---|
| Modelo base | `llama3.2:latest` (ou outro baixado no Ollama) |
| System prompt | ver `PROMPT_SISTEMA.md` |
| Conhecimento | a base criada em C.1 |

**Parâmetros Avançados:**

| Parâmetro | Valor | Motivo |
|---|---|---|
| `num_ctx` | `32768` | Default do Ollama é 4096: o documento é truncado em silêncio |
| `temperature` | `0.1` | A mesma pergunta precisa dar a mesma resposta |
| `top_p` | `0.9` | |
| `repeat_penalty` | `1.05` | Texto jurídico repete termos legitimamente |

O `num_ctx` é o parâmetro mais consequente da lista. Com o default de 4096, os
trechos recuperados pelo RAG são cortados sem nenhum aviso, e o modelo responde
com base em meia informação — parecendo seguro.

### C.3 Cuidado com exemplos no system prompt

Exemplo de formato funciona como **molde**. Se o prompt disser:

```
Formato: (Lei 6701/2014, Art. 5, p. 3)
```

o modelo pode devolver essa citação como se fosse resultado da consulta. Use
placeholders que não possam ser confundidos com conteúdo:

```
Formato: (NomeDoDocumento, Art. N, p. N)
```

E acrescente:

```
- NUNCA use os exemplos de formato deste prompt como se fossem conteúdo dos
  documentos.
- Se a informação não estiver nos trechos recuperados, diga que não encontrou.
```

### C.4 Citação com número de página

O Docling devolve a origem de cada trecho, e o Open WebUI exibe a página na
citação. Esse mapeamento tinha bug em versões anteriores (a página vinha
errada); está corrigido a partir da **v0.12.0**. Com `OPEN_WEBUI_TAG=main` a
correção já vem incluída — se for fixar uma versão, fixe `>= v0.12.0`.

---

## PARTE D — Validação em camadas

Teste de baixo para cima. Cada camada isola um tipo de falha.

### D.1 O serviço está de pé?

```bash
docker ps --filter name=docling --format "{{.Names}} | {{.Status}}"
docker logs biblioteca-prompts-docling --tail 20
```

Esperado: `Uvicorn running on http://0.0.0.0:5001`.

```bash
curl -s http://localhost:5001/health
```

### D.2 A conversão funciona? (sem passar pelo Open WebUI)

Este é o teste que separa "o Docling está quebrado" de "o Open WebUI não o usa".

```bash
curl -s -X POST http://localhost:5001/v1/convert/file \
  -F "files=@arquivos_uerj/originais/LeiOrdinria6701-2014.pdf" \
  -F "to_formats=md" \
  -F "do_ocr=false" \
  | head -c 2000
```

Esperado: Markdown com cabeçalhos e a numeração de artigos preservada.

Caminho alternativo, pela interface própria do Docling:
**http://localhost:5001/ui** — útil para comparar o resultado com e sem OCR num
documento duvidoso.

Bateria esperada:

| Teste | Resultado correto |
|---|---|
| PDF nativo, `do_ocr=false` | Markdown com texto completo |
| PDF nativo, documento longo | conversão conclui dentro de `MAX_SYNC_WAIT` |
| PDF escaneado, `do_ocr=false` | Markdown **vazio** — confirma o risco de B.3 |
| PDF escaneado, `do_ocr=true` | Markdown com texto transcrito |
| Documento com tabela | tabela em Markdown, não texto corrido |
| Arquivo corrompido | erro HTTP explícito, não resposta vazia |

### D.3 O Open WebUI está usando o Docling?

Anexe um documento e acompanhe o log do Docling em paralelo:

```bash
docker logs biblioteca-prompts-docling --since 5m 2>&1 | grep "POST /"
```

| Log | Diagnóstico |
|---|---|
| `POST /v1/convert/file 200` | a extração passou pelo Docling |
| vazio, mas o anexo "funcionou" | o extrator interno foi usado — ver B.2 |
| erro de conexão | `DOCLING_SERVER_URL` errado ou serviço fora do ar |

O segundo caso é o perigoso: o Open WebUI **não falha** quando a configuração do
Docling não pegou — ele cai no extrator padrão em silêncio. O log do Docling é a
única confirmação de que a configuração está ativa.

### D.4 Teste de alucinação (o que decide a liberação)

```
Qual o valor da bolsa de doutorado sanduíche no exterior prevista nos
documentos do acervo?
```

Informação que não existe no acervo.

Esperado: `"Não encontrei essa informação nos documentos disponíveis."`
Inaceitável: qualquer valor ou regra, mesmo com ressalva.

**Não libere para usuários finais enquanto este teste falhar.** Um sistema que
erra 30% das perguntas mas nunca inventa é utilizável com supervisão. Um que
acerta 95% e inventa os 5% restantes é perigoso, porque ninguém sabe quais 5%.

### D.5 Teste de completude

Pergunte algo cuja resposta esteja no **fim** de um documento longo. É o que
detecta `num_ctx` baixo (C.2) e extração parcial — os dois falham parecendo
sucesso.

---

## PARTE E — Consultar um PDF fora da stack

Há um caso de uso que não passa pelo Open WebUI: abrir um documento do acervo
para tirar uma dúvida pontual, sem subir container nenhum. Para isso o Docling é
peso desnecessário — a imagem tem 4,4 GB e o serviço precisa estar de pé.

Os quatro documentos de `arquivos_uerj/originais/` têm **camada de texto
nativa** (conferido pelo critério de B.3: `/Font` presente, zero `DCTDecode`).
Para esse perfil de arquivo, `pdftotext` resolve:

```bash
pdftotext -layout -enc UTF-8 arquivos_uerj/originais/LeiOrdinria6701-2014.pdf -
```

- `-layout` preserva a disposição em colunas. Sem ele, tabela e texto de margem
  se misturam na mesma linha.
- `-enc UTF-8` é necessário no Windows: o padrão do console é Latin-1 e a
  acentuação sai corrompida.
- O `-` final manda o resultado para a saída padrão; troque por um caminho para
  gravar em arquivo.

Conferência rápida de que a extração não veio vazia:

```bash
for f in arquivos_uerj/originais/*.pdf; do
  printf "%-45s %s chars\n" "$(basename "$f")" "$(pdftotext -enc UTF-8 "$f" - | wc -c)"
done
```

Valor próximo de zero em um PDF que visivelmente tem texto significa
digitalização — e aí o caminho é o Docling com `do_ocr=true`, não o
`pdftotext`.

**Por que isso não substitui o Docling.** O `pdftotext` devolve texto corrido:
não marca cabeçalho, não reconstrói tabela e não faz OCR. Serve para leitura
pontual; para o que é indexado no RAG, a estrutura em Markdown é justamente o
que se quer preservar. São usos diferentes, não alternativas concorrentes.

---

## Armadilhas, em resumo

| # | Sintoma | Causa | Correção |
|---|---|---|---|
| 1 | `Task Not Found` em conversão iniciada | mais de um worker Uvicorn | `UVICORN_WORKERS=1` |
| 2 | Mudança no `.env` não tem efeito | PersistentConfig | Admin → Configurações → Documentos |
| 3 | Documento indexado vazio, sem erro | PDF escaneado com `do_ocr=false` | `DOCLING_DO_OCR=true` |
| 4 | Anexo funciona mas log do Docling vazio | extrator interno em uso | ver armadilha 2 |
| 5 | Conversão cai por timeout | `DOCLING_SERVE_MAX_SYNC_WAIT` no default | `600` |
| 6 | Outro container morre durante indexação | Docling sem `mem_limit` | `mem_limit: 6g` |
| 7 | Resposta ignora metade do documento | `num_ctx` no default (4096) | `32768` |
| 8 | `docker ps` / `docker info` travam | disco do Docker cheio | ver A.5 |
| 9 | `docker pull` falha sem espaço | imagem de ~4,4 GB | ver A.5 |
| 10 | Página errada na citação | bug anterior à v0.12.0 | atualizar o Open WebUI |
| 11 | Modelo cita documento inexistente | exemplos do prompt usados como dados | placeholders genéricos (C.3) |
| 12 | Indexação muito lenta | OCR rodando sobre PDF nativo | `DOCLING_DO_OCR=false` |

---

## Ordem de implantação

```
1. Conferir espaço em disco      docker system df          (A.5)
2. Baixar a imagem               docker compose pull docling
3. Subir o Docling               docker compose up -d docling
4. Verificar de pé               docker ps / logs           (D.1)
5. Testar conversão isolada      curl /v1/convert/file      (D.2)
6. Subir o Open WebUI            docker compose up -d open-webui
7. Confirmar o engine ativo      Admin → Configurações → Documentos
8. Criar a base de conhecimento  Workspace → Knowledge      (C.1)
9. Confirmar pelo log            POST /v1/convert/file 200  (D.3)
10. Criar o modelo               prompt + num_ctx           (C.2)
11. Testar com o modelo          D.4 e D.5
```

Os passos 1 a 5 não dependem de modelo nenhum nem do Open WebUI. Valide-os
antes — assim, quando algo falhar no 11, você já sabe que a causa está no modelo
ou na configuração dele, e não na extração.
