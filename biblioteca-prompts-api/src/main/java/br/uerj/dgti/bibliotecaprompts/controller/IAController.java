package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.exception.RegraDeNegocioException;
import br.uerj.dgti.bibliotecaprompts.service.OllamaService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import reactor.core.publisher.Flux;

/**
 * Controller para integração com o motor de IA (Ollama).
 */
@Tag(name = "Inteligência Artificial", description = "Endpoints para interação com o motor de IA local (Ollama)")
@RestController
@RequestMapping("/api/ia")
public class IAController {

    @Autowired
    private OllamaService ollamaService;

    @Autowired
    private UtilRespostaGenerico utilRespostaGenerico;

    @Autowired
    private Util util;

    @Operation(summary = "Verifica se o serviço Ollama está disponível")
    @GetMapping("/status")
    public ResponseEntity<?> verificarStatus() {
        RetornoPadraoFrontendObjetoDTO retorno = ollamaService.verificarStatus();
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", org.springframework.http.HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Gera uma especificação técnica baseada em categoria e descrição",
               description = "Aceita um arquivo opcional. Quando fornecido, o conteúdo é considerado na geração.")
    @PostMapping(value = "/gerar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> gerarEspecificacao(
            @RequestParam("categoria") String categoria,
            @RequestParam("descricao") String descricao,
            @RequestParam(value = "arquivo", required = false) MultipartFile arquivo) {

        if (categoria == null || categoria.isBlank()) {
            throw new RegraDeNegocioException("Categoria é obrigatória");
        }
        if (descricao == null || descricao.isBlank()) {
            throw new RegraDeNegocioException("Descrição é obrigatória");
        }

        RetornoPadraoFrontendObjetoDTO retorno = ollamaService.gerarEspecificacaoPorCategoria(categoria, descricao, arquivo);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", org.springframework.http.HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Lista os modelos de IA disponíveis no Ollama")
    @GetMapping("/models")
    public ResponseEntity<?> obterModelos() {
        RetornoPadraoFrontendObjetoDTO retorno = ollamaService.obterModelosDisponiveis();
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", org.springframework.http.HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Endpoint de streaming (SSE) para o Chat Interno",
               description = "Retorna a resposta da IA em tempo real via Server-Sent Events.")
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(
            @RequestParam("chatId") String chatId,
            @RequestParam("mensagem") String mensagem,
            @RequestParam(value = "arquivo", required = false) MultipartFile arquivo,
            @RequestParam(value = "modelo", required = false) String modelo) {

        if (mensagem == null || mensagem.isBlank()) {
            throw new RegraDeNegocioException("Mensagem não pode ser vazia.");
        }
        return ollamaService.streamChat(chatId, mensagem, arquivo, modelo);
    }
}
