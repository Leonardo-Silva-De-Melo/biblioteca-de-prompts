package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.FeedbackPlataformaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.service.FeedbackPlataformaService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller para a funcionalidade de Feedback Geral da Plataforma.
 */
@Tag(name = "Feedback da Plataforma", description = "Endpoints para envio e consulta de feedbacks gerais sobre a plataforma")
@RestController
@RequestMapping("/api/feedbacks-plataforma")
public class FeedbackPlataformaController {

    private final FeedbackPlataformaService service;

    @Autowired
    private UtilRespostaGenerico utilRespostaGenerico;

    @Autowired
    private Util util;

    public FeedbackPlataformaController(FeedbackPlataformaService service) {
        this.service = service;
    }

    @Operation(summary = "Envia um feedback geral sobre a plataforma")
    @PostMapping
    public ResponseEntity<?> enviarFeedbackGeral(@Valid @RequestBody FeedbackPlataformaDTO feedback) {
        RetornoPadraoFrontendObjetoDTO retorno = service.salvarFeedback(feedback);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.cadastroSucesso(), "", HttpStatus.CREATED, util.sucesso());
    }

    @Operation(summary = "Lista todos os feedbacks recebidos sobre a plataforma")
    @GetMapping
    public ResponseEntity<?> listarTodosFeedbacks() {
        RetornoFrontendListaDTO lista = service.listarTodos();
        return utilRespostaGenerico.retornoObjetoCorpo(lista, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }
}