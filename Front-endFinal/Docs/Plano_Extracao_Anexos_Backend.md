# Plano: extração de anexos no backend via Docling

**Escopo:** módulo `biblioteca-prompts-api`.
**Estado:** planejado, não implementado.

> **Substitui** o plano anterior de instalar Tesseract na imagem do backend. O
> Tesseract, o `ocrmypdf` e o servidor MCP foram retirados da stack; a extração
> documental passou a ser feita pelo `docling-serve`, que já roda como serviço
> do compose. Fazer o backend instalar o próprio Tesseract significaria manter
> dois extratores diferentes no mesmo sistema, com resultados divergentes para o
> mesmo arquivo.

---

## 1. Problema

O `Apache Tika` já está no `pom.xml` (`tika-core` e
`tika-parsers-standard-package`) e extrai texto de documentos cuja camada
textual existe. Um PDF produzido por digitalização não tem essa camada: o
conteúdo é uma imagem. Para esses arquivos o Tika retorna texto vazio, e o
prompt chega ao modelo sem o anexo — **sem erro visível**, que é o pior formato
de falha.

O Open WebUI já não tem esse problema: o pipeline de documentos dele passa pelo
Docling. O caminho que continua descoberto é o do chat interno da Biblioteca de
Prompts, em que o anexo do usuário é processado pelo `biblioteca-prompts-api`.

## 2. Solução proposta

Chamar o `docling-serve` por HTTP, em vez de embutir um extrator no backend.

```
POST http://docling:5001/v1/convert/file
  files=<arquivo anexado>
  to_formats=md
  do_ocr=true
```

O serviço já está na mesma rede do Docker (`biblioteca-prompts-network`), não
exige credencial e devolve Markdown estruturado — o mesmo formato e o mesmo
resultado que o Open WebUI consome. Um extrator, um comportamento.

Aqui `do_ocr=true` é o padrão correto, ao contrário do acervo indexado: o anexo
vem do usuário e não há como saber de antemão se é digital ou escaneado.

### O que muda no código

| Camada | Mudança |
|---|---|
| `application.properties` | `docling.url=${DOCLING_URL:http://docling:5001}` |
| Service | cliente HTTP (`RestClient`) para o endpoint de conversão |
| Tratamento de erro | Docling fora do ar → falhar explicitamente, nunca seguir com texto vazio |

O Tika continua útil como caminho rápido para formatos triviais (`.txt`, `.md`)
e como fallback se o Docling estiver indisponível — mas o fallback precisa
**avisar** que a extração foi degradada.

---

## 3. Implicações

1. **Tamanho da imagem.** Nenhum acréscimo. Era o principal custo do plano
   anterior: Tesseract mais o modelo de português somavam de 100 MB a 150 MB à
   imagem do backend.
2. **Latência.** OCR é intensivo em processamento. Um PDF escaneado pode levar
   dezenas de segundos, proporcionalmente ao número de páginas. Como a chamada
   ocorre dentro da requisição, ela ocupa uma thread do pool do Tomcat durante
   todo o processamento — é o argumento concreto a favor de mover o
   processamento de anexos para fila (ver `plano_implementacao_rabbitmq.md`).
3. **Nova dependência de runtime.** O backend passa a depender de um serviço
   externo a ele. Precisa de `depends_on`, timeout explícito e mensagem de erro
   própria. Em troca, o backend deixa de carregar binário de OCR.
4. **Precisão.** O OCR erra em imagem de baixa qualidade — confusões típicas
   entre `0`/`O` e `1`/`l`. O texto extraído não deve ser tratado como
   transcrição fiel, e a resposta ao usuário deve dizer que o conteúdo veio de
   transcrição automática.
5. **Concorrência.** O `docling-serve` roda com `UVICORN_WORKERS=1`. Anexos
   simultâneos serializam. Para o volume atual não é problema; é mais um
   argumento a favor da fila.

## 4. Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Tesseract na imagem do backend (plano original) | Dois extratores no mesmo sistema, resultados divergentes para o mesmo arquivo, +150 MB de imagem |
| `ocrmypdf` como processo externo | Exige diretório temporário compartilhado e um binário a mais para manter |
| Deixar como está (só Tika) | Mantém a falha silenciosa: anexo escaneado chega vazio ao modelo |

## 5. Verificação

1. `docker exec biblioteca-prompts-backend curl -s http://docling:5001/health`
   responde — o backend alcança o Docling pela rede interna.
2. O envio de um PDF **escaneado** conhecido pelo formulário de anexo resulta em
   texto não vazio no prompt submetido ao modelo.
3. O envio de um PDF com camada textual continua funcionando, e a resposta
   indica a origem do texto.
4. Com o serviço `docling` parado, o anexo falha com mensagem explícita — **não**
   segue em silêncio com texto vazio. Este é o teste que importa.
