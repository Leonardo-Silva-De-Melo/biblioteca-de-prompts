package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;

import br.uerj.dgti.bibliotecaprompts.service.StatsService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller para as estatísticas gerais do Dashboard.
 */
@Tag(name = "Estatísticas", description = "Endpoints para consulta das estatísticas gerais da plataforma")
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;
    private final UtilRespostaGenerico utilRespostaGenerico;
    private final Util util;

    public StatsController(StatsService statsService, UtilRespostaGenerico utilRespostaGenerico, Util util) {
        this.statsService = statsService;
        this.utilRespostaGenerico = utilRespostaGenerico;
        this.util = util;
    }

    @Operation(summary = "Retorna as estatísticas gerais para o Dashboard")
    @GetMapping
    public ResponseEntity<?> getStats() {
        RetornoPadraoFrontendObjetoDTO retorno = statsService.calcularEstatisticasGerais();
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }
}
