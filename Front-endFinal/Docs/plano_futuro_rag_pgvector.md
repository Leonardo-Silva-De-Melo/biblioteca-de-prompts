# Plano de Implementação Futura: RAG com PGVector (Versão 3.0)

Este documento foi elaborado para garantir o arquivamento da visão arquitetural futura do sistema Biblioteca de Prompts. Ele descreve a implementação de um sistema de RAG (*Retrieval-Augmented Generation*) utilizando o banco de dados PostgreSQL com a extensão PGVector e a biblioteca corporativa Spring AI.

## 1. Visão Geral (O que é RAG?)

O objetivo do RAG é dar à Inteligência Artificial uma "Memória de Longo Prazo" especializada baseada em documentos institucionais da UERJ (Leis, Manuais, Diretrizes). Em vez de enviar milhares de páginas de PDF para o Ollama toda vez que uma pergunta for feita, o sistema:
1. Processa todos os PDFs antecipadamente.
2. Quebra o texto em pequenos parágrafos (Chunks).
3. Transforma o significado das palavras em coordenadas matemáticas (Embeddings).
4. Salva no banco de dados Postgres usando a extensão `pgvector`.
5. Ao fazer uma pergunta, o sistema busca apenas os 3 ou 4 parágrafos mais relevantes matematicamente e entrega para o Ollama formular a resposta.

---

## 2. Passo a Passo da Implementação (Arquitetura)

### Passo 1: Infraestrutura (O Banco de Dados) — JÁ ATENDIDO

Este passo deixou de ser pendente. O `docker-compose.yml` já usa a imagem
`pgvector/pgvector:pg16`, que traz a extensão pré-compilada, e o Open WebUI já
grava seus embeddings nela (`VECTOR_DB=pgvector`).

Ou seja, a infraestrutura vetorial existe e está em uso — mas por um produto de
terceiros, que indexa por conta própria. Os passos 2 a 4 abaixo, que descrevem um
pipeline de RAG **próprio, dentro do backend Spring**, continuam não implementados.

- Comando SQL necessário no início do banco: `CREATE EXTENSION IF NOT EXISTS vector;`

### Passo 2: Backend (Spring Boot & Spring AI)
O código Java será o orquestrador desse processamento.
1. **Adição do Vector Store:** Configurar o `PgVectorStore` do Spring AI no `application.properties`.
2. **Ingestão de Dados (ETL):** Criar um novo endpoint e um *Service* responsável por receber arquivos PDF.
3. **Pipeline do Spring AI:**
   - **DocumentReader:** Usar o `TikaDocumentReader` para extrair texto do PDF.
   - **TokenTextSplitter:** Quebrar o texto do PDF em *chunks* de 1000 tokens (palavras).
   - **EmbeddingModel:** Converter as palavras em vetores matemáticos chamando um modelo leve do Ollama (como o `mxbai-embed-large`).
   - **Armazenamento:** Salvar na tabela vetorial do Postgres.

### Passo 3: O Fluxo da Pergunta (O Chat V3.0)
Quando o usuário abrir o chat interno da Biblioteca de Prompts e perguntar: *"Quais são as regras de compra governamental segundo o manual?"*
1. O Java intercepta a pergunta.
2. Transforma a pergunta em um vetor.
3. Faz uma "Busca de Similaridade" (`similaritySearch`) no Postgres via Spring AI.
4. O Postgres devolve os trechos do manual mais próximos da resposta.
5. O Java empacota a pergunta original + os trechos devolvidos pelo Postgres em um Prompt gigante e manda para o Ollama (`llama3.2` ou `gemma3`).
6. A IA responde de forma 100% embasada, sem alucinar, podendo até citar a página do PDF original.

### Passo 4: Frontend (O Gerenciador de Conhecimento)
O sistema React ganhará um novo módulo administrativo: **"Base de Conhecimento Institucional"**.
- Uma tela (Dashboard) onde Administradores podem fazer upload de novos PDFs.
- Listagem dos PDFs já vetorizados no banco.
- Um botão na tela do "Arquiteto Virtual" que permite ligar ou desligar a chave: **"Consultar Base de Conhecimento UERJ"**, dando a opção do usuário ter respostas rápidas comuns, ou respostas profundas baseadas nos PDFs.

---

## 3. Conclusão e Impacto

A implementação desta arquitetura transforma a Biblioteca de Prompts de uma simples "casca para o ChatGPT local" em uma verdadeira **Plataforma Corporativa de Gestão de Conhecimento Autônoma**. É a tecnologia definitiva para adoção de IA em setores governamentais e educacionais de alta segurança que exigem que a Inteligência responda estritamente baseada em documentos auditáveis.
