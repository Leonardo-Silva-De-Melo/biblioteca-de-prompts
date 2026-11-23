package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaPaginadaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.NotificacaoDTO;
import br.uerj.dgti.bibliotecaprompts.service.NotificacaoService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller para a funcionalidade de Notificações.
 */
@Tag(name = "Notificações", description = "Endpoints para gerenciamento de notificações dos usuários")
@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;
    private final UtilRespostaGenerico utilRespostaGenerico;
    private final Util util;

    @Autowired
    public NotificacaoController(NotificacaoService notificacaoService, UtilRespostaGenerico utilRespostaGenerico, Util util) {
        this.notificacaoService = notificacaoService;
        this.utilRespostaGenerico = utilRespostaGenerico;
        this.util = util;
    }

    @Operation(summary = "Lista todas as notificações de um usuário (paginado)")
    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam String usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        RetornoFrontendListaPaginadaDTO<NotificacaoDTO> notificacoes = notificacaoService.listar(usuario, page, size);
        return utilRespostaGenerico.retornoObjetoCorpo(notificacoes, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Lista apenas as notificações não lidas de um usuário")
    @GetMapping("/nao-lidas")
    public ResponseEntity<?> listarNaoLidas(@RequestParam String usuario) {
        RetornoFrontendListaDTO notificacoes = notificacaoService.listarNaoLidas(usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(notificacoes, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Retorna a contagem de notificações não lidas (para exibição no badge)")
    @GetMapping("/count")
    public ResponseEntity<?> contarNaoLidas(@RequestParam String usuario) {
        RetornoPadraoFrontendObjetoDTO retorno = notificacaoService.contarNaoLidas(usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Marca uma notificação específica como lida")
    @PutMapping("/{id}/marcar-lida")
    public ResponseEntity<?> marcarComoLida(@PathVariable Long id) {
        RetornoPadraoFrontendObjetoDTO retorno = notificacaoService.marcarComoLida(id);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Marca todas as notificações de um usuário como lidas")
    @PutMapping("/marcar-todas-lidas")
    public ResponseEntity<?> marcarTodasComoLidas(@RequestParam String usuario) {
        RetornoPadraoFrontendObjetoDTO retorno = notificacaoService.marcarTodasComoLidas(usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Remove uma notificação pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        RetornoPadraoFrontendObjetoDTO retorno = notificacaoService.deletar(id);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRemovido(), "", HttpStatus.OK, util.sucesso());
    }
}