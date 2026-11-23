package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.FeedbackDTO;
import br.uerj.dgti.bibliotecaprompts.service.FeedbackService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller para a funcionalidade de Avaliação de Prompts.
 */
@Tag(name = "Feedback de Prompts", description = "Endpoints para avaliação de prompts pelos usuários")
@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UtilRespostaGenerico utilRespostaGenerico;

    @Autowired
    private Util util;

    @Operation(summary = "Registra a avaliação (feedback) de um prompt")
    @PostMapping("/prompt/{promptId}")
    public ResponseEntity<?> avaliarPrompt(
            @PathVariable Long promptId,
            @Valid @RequestBody FeedbackDTO feedbackDTO) {
        RetornoPadraoFrontendObjetoDTO retorno = feedbackService.salvarAvaliacao(promptId, feedbackDTO);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.cadastroSucesso(), "", HttpStatus.CREATED, util.sucesso());
    }
}
