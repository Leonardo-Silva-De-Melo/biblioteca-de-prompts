package br.uerj.dgti.bibliotecaprompts.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.HistoricoUsoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.HistoricoUsoRequestDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaPaginadaDTO;
import br.uerj.dgti.bibliotecaprompts.service.HistoricoUsoService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller para a funcionalidade de Histórico de Uso.
 */
@Tag(name = "Histórico de Uso", description = "Endpoints para registro e consulta do histórico de uso de prompts por usuário")
@RestController
@RequestMapping("/api/historico-uso")
public class HistoricoUsoController {

    @Autowired
    private HistoricoUsoService historicoUsoService;

    @Autowired
    private UtilRespostaGenerico utilRespostaGenerico;

    @Autowired
    private Util util;

    @Operation(summary = "Registra o uso de um prompt por um usuário")
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUso(@RequestBody HistoricoUsoRequestDTO dto) {
        RetornoPadraoFrontendObjetoDTO retorno = historicoUsoService.registrarUso(dto.getUsuario(), dto.getPromptId(), dto.getObservacao());
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.cadastroSucesso(), "", HttpStatus.CREATED, util.sucesso());
    }

    @Operation(summary = "Busca o histórico de uso paginado de um usuário")
    @GetMapping("/usuario/{usuario}")
    public ResponseEntity<?> buscarHistoricoPorUsuario(
            @PathVariable String usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        RetornoFrontendListaPaginadaDTO<HistoricoUsoDTO> historico = historicoUsoService.buscarHistoricoPorUsuario(usuario, page, size);
        return utilRespostaGenerico.retornoObjetoCorpo(historico, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Busca o histórico de uso de um usuário com filtro de período")
    @GetMapping("/usuario/{usuario}/filtro-data")
    public ResponseEntity<?> buscarHistoricoComFiltroData(
            @PathVariable String usuario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        RetornoFrontendListaPaginadaDTO<HistoricoUsoDTO> historico = historicoUsoService.buscarHistoricoComFiltroData(usuario, dataInicio, dataFim, page, size);
        return utilRespostaGenerico.retornoObjetoCorpo(historico, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Busca o histórico de uso de um usuário filtrado por categoria")
    @GetMapping("/usuario/{usuario}/categoria/{categoria}")
    public ResponseEntity<?> buscarHistoricoPorCategoria(
            @PathVariable String usuario,
            @PathVariable String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        RetornoFrontendListaPaginadaDTO<HistoricoUsoDTO> historico = historicoUsoService.buscarHistoricoPorCategoria(usuario, categoria, page, size);
        return utilRespostaGenerico.retornoObjetoCorpo(historico, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Remove um registro do histórico de uso pelo ID")
    @DeleteMapping("/{historicoId}")
    public ResponseEntity<?> deletarHistorico(@PathVariable Long historicoId) {
        RetornoPadraoFrontendObjetoDTO retorno = historicoUsoService.deletarHistorico(historicoId);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRemovido(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Limpa todo o histórico de uso de um usuário")
    @DeleteMapping("/usuario/{usuario}/limpar")
    public ResponseEntity<?> limparHistoricoUsuario(@PathVariable String usuario) {
        RetornoPadraoFrontendObjetoDTO retorno = historicoUsoService.limparHistoricoUsuario(usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRemovido(), "", HttpStatus.OK, util.sucesso());
    }
}
