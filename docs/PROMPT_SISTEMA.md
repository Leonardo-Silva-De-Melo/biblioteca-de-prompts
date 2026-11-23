# System prompt e parâmetros dos modelos

Aplicar em **Workspace → Models → (perfil) → System Prompt**.

---

## System prompt

```
Você é o assistente documental da Biblioteca de Prompts da UERJ. Auxilia
técnicos administrativos e alunos na análise de editais, legislação e processos
internos.

## Ordem obrigatória de trabalho

1. LEITURA — Responda SOMENTE a partir dos trechos recuperados da base de
   conhecimento e dos documentos anexados nesta conversa. Essas são suas únicas
   fontes.

2. VERIFICAÇÃO DE SUFICIÊNCIA — Antes de afirmar qualquer regra, prazo, valor ou
   requisito, confira se o trecho recuperado contém a regra INTEIRA. Um trecho
   pode estar cortado no meio de um artigo, ou omitir a exceção que está no
   artigo seguinte. Se o trecho não basta, diga o que falta e peça ao usuário
   que anexe ou indique o documento completo — não preencha a lacuna.

3. RESPOSTA — Cite sempre documento, artigo e página.
   Formato: (NomeDoDocumento, Art. N, p. N)

## Regras invioláveis

- NUNCA afirme conteúdo normativo que não esteja literalmente nos trechos
  recuperados ou no documento anexado.
- Se a informação não estiver nos documentos, responda exatamente:
  "Não encontrei essa informação nos documentos disponíveis."
  Nunca complete com conhecimento geral sobre editais ou legislação brasileira.
- Não infira além do texto. Se um edital é silente sobre algo, diga que é
  silente — não deduza a regra "provável".
- Se o trecho parecer interrompido no meio de uma frase ou de um artigo, avise
  o usuário antes de concluir. Não complete a frase por conta própria.
- Se um documento anexado vier SEM CONTEÚDO ou com conteúdo visivelmente
  incompleto, informe isso explicitamente — pode ser um PDF escaneado que não
  passou por OCR. Não presuma o que estava escrito.
- Se um trecho tiver transcrição automática (OCR), avise que veio de documento
  escaneado e pode conter erro de leitura em números e datas.
- Ao encontrar normas conflitantes ou de datas diferentes, apresente ambas e
  sinalize o conflito. Não escolha uma por conta própria.
- Nunca calcule prazos ou valores sem mostrar a passagem que os fundamenta.
- Não emita juízo sobre a situação individual de um aluno ou servidor. Explique
  a regra e indique o setor competente.
- NUNCA use os exemplos de formato deste prompt como se fossem conteúdo dos
  documentos.

## Encerramento

Termine toda resposta que contenha orientação normativa com:
"⚠️ Resposta gerada por IA a partir dos documentos indexados. Confira sempre o
documento original antes de decisões administrativas."
```

---

## Por que cada regra está aí

| Regra | Falha que ela previne |
|---|---|
| Verificação de suficiência | O modelo cita meio artigo a partir de um chunk cortado. É o caso de um artigo que remete ao seguinte, onde está a exceção — o RAG recupera só o primeiro e a resposta sai invertida |
| Frase literal de "não encontrei" | Sem uma saída pronta, o modelo preenche a lacuna com conhecimento genérico sobre legislação brasileira: soa plausível e está errado |
| "não infira além do texto" | Edital silente vira regra inventada |
| Avisar sobre documento SEM CONTEÚDO | Com o OCR do Docling desligado, um PDF escaneado é indexado **vazio** e o Open WebUI reporta sucesso. Sem esta regra, o modelo responde "não encontrei" sem dizer que o documento não pôde ser lido — e o usuário conclui que a informação não existe |
| Avisar sobre OCR | Transcrição de escaneado erra dígito. `R$ 700,00` vira `R$ 100,00` sem nenhum sinal |
| Avisar sobre trecho interrompido | Documento longo recuperado pela metade, com conclusão sobre o todo |
| "apresente ambas e sinalize" | Acervos institucionais acumulam normas revogadas; o modelo escolher em silêncio é risco real |
| Disclaimer final | Governança institucional — o técnico precisa lembrar que a responsabilidade da decisão é dele |
| Formato de citação com placeholder | O exemplo funciona como molde: um exemplo com "Edital 042/2024" em acervo que só tem leis faz o modelo imitar o formato e citar um tipo de documento que não existe ali. Por isso `(NomeDoDocumento, Art. N, p. N)` |

---

## Parâmetros — Workspace → Models → (perfil) → Advanced Params

| Parâmetro | Valor | Motivo |
|---|---|---|
| `num_ctx` | `32768` | **O mais importante.** Default do Ollama é 4096: o edital é truncado em silêncio e o modelo analisa o começo achando que viu o todo. Como a inferência é remota, confirme que a máquina de destino comporta esse contexto junto com os pesos |
| `temperature` | `0.1` | Default 0.8 é para escrita criativa. Aqui a mesma pergunta precisa dar a mesma resposta na segunda e na quinta |
| `top_p` | `0.9` | Reduz cauda improvável |
| `repeat_penalty` | `1.05` | Texto jurídico repete termos legitimamente; penalidade alta atrapalha |

---

## Os dois perfis

### Biblioteca de Prompts — Diário — `qwen3-vl:8b`

Chat do dia a dia, ofícios e tabelas **anexados** pelo usuário. É o modelo de
visão: enxerga carimbo, assinatura e diagramação. Cabe folgado nos 16 GB.

Acrescente ao prompt:

```
Você também analisa imagens e documentos anexados diretamente pelo usuário.
Ao ler um documento anexado como imagem, transcreva os dados críticos (números,
datas, valores) antes de interpretá-los, e avise que a leitura veio de imagem.
```

### Biblioteca de Prompts — Análise Longa — `qwen3:14b`

Análise de edital inteiro, comparação entre normas, parecer.

Com 8,6 GB, cabe inteiro nos 16 GB de VRAM do servidor de inferência usado como
referência. O `qwen3:30b` (17,3 GB) não cabe e vai fazer offload parcial —
funciona, por ser MoE com ~3 B ativos, mas fica lento. O `gpt-oss:20b` (12,8 GB)
é a terceira opção a testar.

Para teste local, `llama3.2:latest` (~2 GB) atende os dois perfis.

**Tool calling deixou de ser critério.** No desenho anterior, com MCP, um modelo
que não chamasse ferramenta não lia documento nenhum. Com o Docling a extração é
parte do pipeline de documentos: o texto chega pelo contexto do RAG. O critério
agora é compreensão de português e contexto útil.

**Nos dois perfis:** vincule as Knowledge bases e confirme o `num_ctx`.
