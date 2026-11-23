package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.DiagnosticoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.service.DiagnosticoService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller para a funcionalidade de Diagnósticos.
 */
@Tag(name = "Diagnósticos", description = "Endpoints para o gerenciamento de diagnósticos de uso da plataforma")
@RestController
@RequestMapping("/api/diagnosticos")
public class DiagnosticoController {

    @Autowired
    private DiagnosticoService diagnosticoService;

    @Autowired
    private UtilRespostaGenerico utilRespostaGenerico;
    
    @Autowired
    private Util util;

    @Operation(summary = "Salva o diagnóstico de um usuário")
    @PostMapping
    public ResponseEntity<?> salvarDiagnostico(@Valid @RequestBody DiagnosticoDTO dto) {
        RetornoPadraoFrontendObjetoDTO retorno = diagnosticoService.salvar(dto);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.cadastroSucesso(), "", HttpStatus.CREATED, util.sucesso());
    }

    @Operation(summary = "Busca o diagnóstico de um usuário pelo ID")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> buscarDiagnostico(@PathVariable String usuarioId) {
        RetornoPadraoFrontendObjetoDTO retorno = diagnosticoService.buscarPorUsuarioId(usuarioId);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Lista todos os diagnósticos")
    @GetMapping("/todos")
    public ResponseEntity<?> listarTodos() {
        RetornoFrontendListaDTO retorno = diagnosticoService.buscarTodos();
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }
}
