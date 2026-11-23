# Configuração do RAG — Open WebUI

As variáveis do `docker-compose.yml` definem os valores iniciais. Este documento
serve para **conferir na interface** e para ajustar depois sem recriar containers.

Admin Panel → Settings → **Documents**

> **Atenção:** as variáveis de documento do Open WebUI são *PersistentConfig* —
> o valor do ambiente é lido só na **primeira** subida e depois passa a viver no
> banco. Numa instalação que já subiu, editar o `docker-compose.yml` ou o `.env`
> não tem efeito nenhum: o que vale é esta tela.

---

## Campos

| Campo | Valor | Motivo |
|---|---|---|
| Content Extraction Engine | `Docling` | Devolve Markdown estruturado em vez de texto corrido. Ver `GUIA_DOCLING.md` |
| Docling Server URL | `http://docling:5001` | Nome do serviço na rede do Docker — a chamada é feita pelo backend, não pelo navegador |
| OCR (Docling) | Desligado | O acervo atual é PDF de origem digital. **Documento escaneado é indexado vazio sem aviso** — ver B.3 do `GUIA_DOCLING.md` |
| Text Splitter | Character | |
| Chunk Size | `1200` | O default (1000) corta artigos ao meio. 1200 cabe um artigo com seus parágrafos |
| Chunk Overlap | `300` | 25%. Garante que um artigo cortado no limite reapareça inteiro no bloco seguinte — a mitigação direta do risco de citar meia regra |
| Embedding Model Engine | Default (local) | Tipicamente o servidor de inferência só tem modelos de chat baixados, sem um `bge-m3` — apontar o RAG para o Ollama falharia na indexação |
| Embedding Model | `intfloat/multilingual-e5-large` | Forte em português, bem superior ao `all-MiniLM-L6-v2` em pt-BR. Roda em CPU: indexação lenta, consulta rápida |
| Hybrid Search | **Ligado** | Ver abaixo |
| Reranking Model | `BAAI/bge-reranker-v2-m3` | |
| Top K | `8` | Trechos recuperados por pergunta |
| Relevance Threshold | `0.0` | Comece em 0 e só suba depois de medir. Threshold alto descarta trechos certos e o modelo responde "não encontrei" para coisa que existe |

---

## Por que busca híbrida não é opcional aqui

Busca vetorial pura é **ruim com identificadores**. "Edital 042/2024" e
"Edital 043/2024" têm vetores quase idênticos — semanticamente são a mesma coisa.
Para o técnico administrativo, são documentos diferentes.

A busca híbrida soma BM25 (correspondência literal) ao vetorial: o BM25 acerta o
número exato, o vetorial acerta o sentido. O reranker reordena os candidatos dos
dois.

Custo: o reranking roda em CPU no container do Open WebUI e soma 1–3 s por
consulta. Vale o preço neste caso de uso.

---

## Dimensão do vetor — decida antes de indexar

O Open WebUI cria a coluna vetorial com dimensão fixa na primeira indexação.
O `multilingual-e5-large` produz vetores de 1024 dimensões.

Se você indexar 300 editais e depois trocar o modelo de embedding, os vetores
antigos ficam incompatíveis e **todo o acervo precisa ser reindexado**.

Se no futuro o acervo crescer para milhares de PDFs e a indexação em CPU ficar
inviável, o caminho é pedir o `bge-m3` no Ollama da máquina com GPU e trocar o
motor para `ollama` — contando com a reindexação completa como parte do custo.

---

## Knowledge bases

Workspace → Knowledge → **+**

| Base | Conteúdo |
|---|---|
| `Editais` | Editais de seleção, chamadas públicas |
| `Legislação UERJ` | Decreto 2479/1979, Leis 7426/2016, 8436/2019, 6701/2014, resoluções, deliberações |
| `Processos internos` | Ofícios, memorandos, instruções normativas |

Duas razões práticas para não usar um balaio único: o técnico pode restringir a
busca ao acervo certo, e você consegue **expirar um acervo** — edital revogado
sai da base sem tocar no resto.

Suba os arquivos direto de `arquivos_uerj/originais/`. Não existe mais uma pasta
`processados/`: o Docling faz a extração no momento do anexo, sem gerar uma
segunda cópia em disco para manter em sincronia.

---

## Primeiro boot: ~10 min em `unhealthy` é normal

Na primeira subida com um modelo de embedding novo, o Open WebUI baixa os pesos
do HuggingFace **antes** de abrir a porta. O `multilingual-e5-large` tem ~2,2 GB
em 44 arquivos.

Durante o download o container aparece como `unhealthy` e `localhost:3000` recusa
conexão. **Não é erro** — não reinicie o container, isso só recomeça o download.

Para acompanhar o progresso:

```bash
docker exec biblioteca-prompts-open-webui sh -c 'find /app/backend/data/cache/embedding/models -name "*.incomplete" -exec du -h {} \;'
```

Quando o arquivo `.incomplete` some, o boot termina em cerca de 1 minuto. Nas
subidas seguintes o modelo já está no volume e o boot é rápido.

---

## Verificação

A indexação agora é auditável por SQL — uma das vantagens de trocar o ChromaDB
em arquivo pelo pgvector:

```bash
docker exec -it biblioteca-prompts-postgres psql -U biblioteca_prompts -d bibliotecapromptsdb -c "\dt"
```

As tabelas de vetores devem aparecer. Se a lista sair vazia depois de subir
documentos, o RAG não está gravando onde você pensa — confira `VECTOR_DB=pgvector`
e se a extensão foi criada.

---

## Chunking semântico (melhoria posterior)

O que separa um RAG jurídico bom de um medíocre não é o tamanho do chunk — é
**cada chunk carregar sua própria identidade**. Um trecho recuperado que diz
apenas *"o valor será de R$ 700,00 mensais"* é inútil: de qual edital? de que ano?
ainda vigente?

O Docling já resolve **metade** do problema: como ele devolve Markdown com
hierarquia de seções em vez de texto corrido, o fatiamento por caractere tende a
cortar em fronteira de título ou de artigo, não no meio de uma frase. É o ganho
que justificou trocar o extrator.

O que ele **não** faz é prefixar a identidade do documento em cada bloco. Para
isso, o caminho é pós-processar o Markdown devolvido pelo Docling, quebrando por
artigo e repetindo o cabeçalho:

```
[NomeDoDocumento — Seção — Art. N]
Art. N. O valor da bolsa será de ...
```

Um `re.split(r'\n\s*(?=Art\.\s*\d+|CAPÍTULO|§\s*\d+|Parágrafo único)', texto)`
resolve a maior parte dos casos em documentos administrativos brasileiros.

Isso melhora a citação: o modelo lê a origem **dentro** do próprio trecho, em
vez de depender de metadados.

> Cabeçalho de exemplo deliberadamente genérico. Exemplo com número de documento
> real tende a ser imitado pelo modelo como se fosse conteúdo do acervo.

Não é pré-requisito para entrar em produção. Faça depois de medir a qualidade da
recuperação com o teste de aceitação — se a taxa de acerto já estiver boa com
chunking simples, o esforço não se justifica ainda.
