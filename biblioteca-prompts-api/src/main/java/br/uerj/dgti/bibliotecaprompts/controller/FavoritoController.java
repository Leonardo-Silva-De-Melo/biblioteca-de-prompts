package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.service.FavoritoService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller para a funcionalidade de Favoritos.
 */
@Tag(name = "Favoritos", description = "Endpoints para o gerenciamento de favoritos do usuário")
@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    @Autowired
    private FavoritoService favoritoService;

    @Autowired
    private UtilRespostaGenerico utilRespostaGenerico;

    @Autowired
    private Util util;

    @Operation(summary = "Alterna o status de favorito de um prompt para um usuário")
    @PostMapping("/{usuario}/{promptId}")
    public ResponseEntity<?> alternarFavorito(@PathVariable String usuario, @PathVariable Long promptId) {
        RetornoPadraoFrontendObjetoDTO retorno = favoritoService.alternarFavorito(usuario, promptId);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.cadastroSucesso(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Lista os IDs dos prompts favoritados por um usuário")
    @GetMapping("/{usuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable String usuario) {
        RetornoFrontendListaDTO retorno = favoritoService.listarIdsFavoritos(usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }
}
