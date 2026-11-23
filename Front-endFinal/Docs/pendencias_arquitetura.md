# Pendências de Arquitetura (SAG Backend vs Biblioteca de Prompts API)

Este documento mapeia as diferenças arquiteturais entre o padrão estrito do SAG
e o estado atual da Biblioteca de Prompts API, e lista as tarefas restantes para alinhá-los.

## Estado atual
Os controllers foram refatorados para delegar aos serviços (`*Service`), e a
maior parte dos endpoints já devolve o envelope `UtilRespostaGenerico`
(`{status, mensagem, data}`). O que falta está nas seções abaixo — em especial
os controllers que ainda expõem entidades JPA diretamente.

## O Que Ficou Faltando no Back-end?

### 1. Separação Estrita de DTOs no Controller (Regra de Ouro do SAG)
**O SAG é estrito: nunca passa uma classe do pacote `model/` para o `Controller`.**
Atualmente, alguns controllers na Biblioteca de Prompts ainda expõem entidades de banco de dados diretamente:
- **`ComentarioController`**: Retorna entidades `Comentario` diretamente do banco.
- **`HistoricoEdicaoController`**: Retorna entidades `HistoricoEdicao` diretas.
- **`DiagnosticoController`**: Recebe e retorna `Diagnostico` em alguns métodos não refatorados (se houver).
- **`FeedbackController`**: Pode estar manipulando `FeedbackPrompt` ao invés de DTO.

**Ação Necessária**: Criar classes `ComentarioDTO`, `HistoricoEdicaoDTO`, etc., e usar Mappers (ex: `ModelMapper` ou conversão manual) nas classes de Serviço para nunca vazar a Entidade no Controller.

### 2. Validações de Entrada (Bean Validation)
O SAG utiliza estritamente anotações como `@NotNull`, `@NotBlank` e `@Size` nos DTOs de Request, que são validados no Controller usando `@Valid`.
- **Ação Necessária**: Revisar todos os métodos `POST` e `PUT` para garantir o uso de `@Valid` nos DTOs de entrada.

### 3. Tratamento Centralizado de Exceções
O arquivo `ApiExceptionHandler.java` foi importado e está lidando bem com erros genéricos.
- **Ação Necessária**: Criar e lançar exceções de negócio específicas (ex: `RegistroNaoEncontradoException`) dentro dos `Services` em vez de usar `Optional.orElseThrow(RuntimeException::new)` ou retornar 404 manualmente pelo Controller.

## Tarefas com Impacto no Frontend (Plano de Ação)

- [ ] **Padronização dos DTOs Restantes**: Modificar Comentários e Históricos para usar DTOs. Isso pode alterar os campos que o Frontend consome (ex: nomes de variáveis aninhadas).
- [ ] **Adaptação do Interceptor React**: Garantir que o interceptor global em `api.js` continue desembrulhando perfeitamente os envelopes `{status, mensagem, data}` sem falhar em rotas de paginação.

## Correção Crítica Realizada (Headers HTTP)
Detectamos que o uso de acentos ("ó", "í") nos headers HTTP causava um erro `500 Internal Server Error` (lançado pelo Tomcat via `IllegalArgumentException`), o que impedia o carregamento do Frontend. O `UtilRespostaGenerico` foi corrigido para remover a acentuação dos headers.
