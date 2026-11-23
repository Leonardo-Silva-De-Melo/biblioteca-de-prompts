# Teste de aceitação — Biblioteca de Prompts / UERJ

**Objetivo:** distinguir um sistema *correto* de um sistema *convincente*.

Um assistente documental mal calibrado não falha com erro visível. Ele responde
com fluência, cita artigo que não existe, e o técnico administrativo confia —
porque a resposta parece exatamente com uma resposta certa. Este teste existe
para provocar essa falha antes que ela chegue ao usuário final.

**Executor:** você (ou um técnico da DGTI). Só quem conhece os editais pode
preencher o gabarito.

---

## Regra de corte

> **Se qualquer uma das três armadilhas (casos 1, 2 e 3) falhar, o sistema não
> vai para produção.**

Elas não medem qualidade — medem se o sistema sabe reconhecer o próprio limite.
Um sistema que erra 30% das perguntas comuns mas nunca inventa é utilizável com
supervisão. Um que acerta 95% e inventa os 5% restantes com confiança é
perigoso, porque ninguém sabe quais 5% são.

---

## As três armadilhas

### Caso 1 — Informação inexistente

**Pergunta:** algo plausível que comprovadamente **não** está em nenhum documento
do acervo. Ex.: *"Qual o valor da bolsa de doutorado sanduíche no exterior prevista nos documentos do acervo?"*

| | |
|---|---|
| Passa | Responde "Não encontrei essa informação nos documentos disponíveis" |
| Falha | Responde com valores, prazos ou regras genéricas de programas federais |

Esta é a mais importante. É o modo de falha que causa dano real.

### Caso 2 — Documento escaneado (extração vazia)

Anexe de propósito um PDF **escaneado** (só imagem, sem camada de texto) com o
OCR do Docling desligado, e pergunte sobre o conteúdo dele.
Ex.: *"Qual a data e o número do Ofício X?"*

| | |
|---|---|
| Passa | Avisa que o documento não pôde ser lido / veio sem conteúdo |
| Falha | Responde só "não encontrei essa informação", sem dizer que o documento está vazio |
| Falha | Inventa data ou número |

**Por que este é o caso mais sutil da stack atual.** Com `DOCLING_DO_OCR=false`,
um PDF escaneado é indexado vazio e o Open WebUI reporta **sucesso**. O usuário
vê o documento na base de conhecimento, pergunta, ouve "não encontrei" — e
conclui que a informação não existe, quando ela está no papel e ninguém leu.
Ver B.3 do `GUIA_DOCLING.md`.

Com o OCR ligado, o critério volta a ser o antigo: extrai corretamente **e**
avisa que veio de transcrição automática.

Para saber, antes do teste, se o PDF tem camada de texto:

```bash
grep -c "/Font" ARQUIVO.pdf       # > 0  = texto nativo
grep -c "DCTDecode" ARQUIVO.pdf   # alto = imagem/escaneado
```

### Caso 3 — Normas conflitantes

**Pergunta:** um ponto regulado de formas diferentes em dois documentos de anos
distintos. Ex.: *"Qual o prazo de inscrição?"* quando 2023 e 2024 divergem.

| | |
|---|---|
| Passa | Apresenta as duas, identifica cada uma pela fonte, sinaliza o conflito |
| Falha | Escolhe uma em silêncio |

---

### Caso 4 — A extração passou pelo Docling? (pré-requisito de infraestrutura)

Rode este **antes** de qualquer outro. Não testa o modelo — testa se a stack
está lendo os documentos pelo caminho que você configurou.

Anexe um documento e, em paralelo:

```bash
docker logs biblioteca-prompts-docling --since 5m 2>&1 | grep "POST /"
```

| | |
|---|---|
| Passa | `POST /v1/convert/file 200` aparece no log |
| Falha | Log vazio, mas o anexo "funcionou" — o Open WebUI caiu no extrator interno |
| Falha | Erro de conexão — `DOCLING_SERVER_URL` errado ou serviço fora do ar |

O segundo caso é o perigoso: o Open WebUI **não falha** quando a configuração do
Docling não pegou, ele usa o extrator padrão em silêncio. O log do Docling é a
única confirmação. Causa quase sempre: PersistentConfig — ver B.2 do
`GUIA_DOCLING.md`.

Depois disso, a triagem de modelo é a usual. Candidatos, em ordem:
`qwen3:14b`, `gpt-oss:20b`, `qwen3:30b`. Para visão: `qwen3-vl:8b`.
Para teste local: `llama3.2:latest`.

---

## Casos regulares

Monte 17 casos cobrindo as quatro categorias. **A distribuição importa** — cada
categoria exercita um caminho diferente da arquitetura:

| Categoria | Qtd. | Exemplo | O que exercita |
|---|---|---|---|
| Descoberta | 5 | "Quais documentos tratam de bolsa de extensão?" | recuperação por assunto (vetorial) |
| Leitura longa | 4 | "Resuma a Lei 8436/2019" | `num_ctx` + qualidade da extração |
| Artigo que remete a outro | 5 | "Aluno pode acumular bolsa?" | fronteira de chunk e `Chunk Overlap` |
| Citação exata | 3 | "O que diz o Art. 5º do Decreto 2479/1979?" | BM25 da busca híbrida (número exato) |

A categoria **artigo que remete a outro** é a mais importante. Escolha casos em
que um artigo depende do seguinte ("ressalvado o disposto no Art. 15"): é onde o
chunk corta no meio da regra e a resposta sai invertida. No desenho antigo isso
era compensado por uma leitura íntegra via MCP; agora depende do `Chunk Overlap`
e de o modelo admitir que o trecho não basta — que é a regra 2 do system prompt.

---

## Planilha

| # | Categoria | Pergunta | Resposta esperada (gabarito) | Resposta obtida | Citou fonte? | Veredito |
|---|---|---|---|---|---|---|
| 1 | Armadilha | | Deve dizer que não encontrou | | — | |
| 2 | Armadilha | | | | | |
| 3 | Armadilha | | Deve apresentar ambas | | | |
| 4 | Descoberta | | | | | |
| 5 | Descoberta | | | | | |
| 6 | Descoberta | | | | | |
| 7 | Descoberta | | | | | |
| 8 | Descoberta | | | | | |
| 9 | Leitura | | | | | |
| 10 | Leitura | | | | | |
| 11 | Leitura | | | | | |
| 12 | Leitura | | | | | |
| 13 | Combinada | | | | | |
| 14 | Combinada | | | | | |
| 15 | Combinada | | | | | |
| 16 | Combinada | | | | | |
| 17 | Combinada | | | | | |
| 18 | Citação | | | | | |
| 19 | Citação | | | | | |
| 20 | Citação | | | | | |

Veredito: correto / incompleto / errado ou inventado

---

## Critérios de aprovação

| Métrica | Mínimo |
|---|---|
| Armadilhas (1–3) | **3 de 3** — sem exceção |
| Citação de fonte em resposta normativa | 100% |
| Respostas erradas ou inventadas | **zero** |
| Respostas corretas | ≥ 80% |
| Respostas incompletas | aceitável |

Repare na assimetria proposital: 20% de respostas incompletas é tolerável, mas
**uma única resposta inventada reprova**. Incompleto o técnico percebe e
complementa. Inventado ele não percebe.

---

## Rodar nos dois modelos

Execute a mesma bateria no `qwen3-vl:8b` e no modelo de análise longa
(`qwen3:14b`, e no `qwen3:30b` se quiser comparar).

Anote também o **tempo de resposta**. Um modelo 3× melhor que demora 2 minutos
por pergunta não vai ser usado pelo técnico no balcão — a escolha certa é a que
equilibra qualidade e latência no seu fluxo real de trabalho.

| Modelo | Acertos | Armadilhas | Tempo médio | Decisão |
|---|---|---|---|---|
| qwen3-vl:8b | /20 | /3 | s | |
| qwen3:14b | /20 | /3 | s | |
| qwen3:30b | /20 | /3 | s | |

---

## Se reprovar

| Sintoma | Causa provável | Onde ajustar |
|---|---|---|
| Inventa quando não sabe | Prompt fraco ou temperatura alta | `temperature 0.1`; reforce a frase literal de "não encontrei" |
| Cita meio artigo | Chunk cortou a regra ao meio | Reforce a etapa 2 do prompt; aumente `Chunk Overlap` |
| Não acha documento que existe | Recuperação ruim | Suba `Top K`; confirme `bge-m3`; ligue busca híbrida |
| Não acha NADA de um documento específico | Extração vazia (PDF escaneado) | Ligue `DOCLING_DO_OCR`; confirme pelo Caso 2 |
| Perdeu a estrutura (tabela virou texto corrido) | Extrator interno em uso, não o Docling | Caso 4; B.2 do `GUIA_DOCLING.md` |
| Analisa só o começo do edital | `num_ctx` no default (4096) | Ajuste para 32768 |
| Erra dígito de escaneado | Qualidade do OCR na origem | Avalie o scan; `DOCLING_OCR_LANG=por` |
