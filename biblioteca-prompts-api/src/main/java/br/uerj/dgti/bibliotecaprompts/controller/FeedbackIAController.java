package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.FeedbackIADTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.service.FeedbackIAService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller para a funcionalidade de Feedback sobre respostas da IA.
 */
@Tag(name = "Feedback de IA", description = "Endpoints para registro e consulta de feedbacks sobre as respostas geradas pela IA")
@RestController
@RequestMapping("/api/feedbacks-ia")
public class FeedbackIAController {

    @Autowired
    private FeedbackIAService service;

    @Autowired
    private UtilRespostaGenerico utilRespostaGenerico;

    @Autowired
    private Util util;

    @Operation(summary = "Registra um feedback sobre uma resposta da IA")
    @PostMapping
    public ResponseEntity<?> salvar(@Valid @RequestBody FeedbackIADTO dto) {
        RetornoPadraoFrontendObjetoDTO retorno = service.salvar(dto);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.cadastroSucesso(), "", HttpStatus.CREATED, util.sucesso());
    }

    @Operation(summary = "Lista todos os feedbacks de IA de um usuário")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable String usuarioId) {
        RetornoFrontendListaDTO lista = service.listarPorUsuario(usuarioId);
        return utilRespostaGenerico.retornoObjetoCorpo(lista, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }
}
