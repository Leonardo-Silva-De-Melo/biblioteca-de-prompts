package br.uerj.dgti.bibliotecaprompts.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaPaginadaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.PromptDTO;
import br.uerj.dgti.bibliotecaprompts.service.PromptService;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller para a funcionalidade de Prompts.
 */
@Tag(name = "Prompts", description = "Endpoints para o gerenciamento completo de prompts, incluindo histórico de versões e comentários")
@RestController
@RequestMapping("/api/prompts")
public class PromptController {

    private final PromptService promptService;
    private final UtilRespostaGenerico utilRespostaGenerico;
    private final Util util;

    public PromptController(PromptService promptService, UtilRespostaGenerico utilRespostaGenerico, Util util) {
        this.promptService = promptService;
        this.utilRespostaGenerico = utilRespostaGenerico;
        this.util = util;
    }

    // ============================================
    // LISTAGEM E BUSCA
    // ============================================

    @Operation(summary = "Lista os prompts do próprio usuário (paginado)")
    @GetMapping("/meus")
    public ResponseEntity<?> listarMeusPrompts(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamanho,
            @RequestParam String usuario) {
        RetornoFrontendListaPaginadaDTO<PromptDTO> retorno = promptService.listarMeusPrompts(pagina, tamanho, usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Lista o histórico pessoal de prompts utilizados pelo usuário (paginado)")
    @GetMapping("/historico-pessoal")
    public ResponseEntity<?> listarHistoricoPessoal(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamanho,
            @RequestParam(name = "usuario") String usuario) {
        RetornoFrontendListaPaginadaDTO<PromptDTO> retorno = promptService.listarMeuHistorico(pagina, tamanho, usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Lista todos os prompts disponíveis (paginado)",
               description = "Suporta filtragem por termo de busca e categoria.")
    @GetMapping
    public ResponseEntity<?> listarPaginado(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho,
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) String categoria) {
        RetornoFrontendListaPaginadaDTO<PromptDTO> retorno = promptService.listarTodosPaginado(pagina, tamanho, termo, categoria);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Busca um prompt pelo ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.buscarPorId(id);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Busca prompts por termo de pesquisa")
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorTermo(@RequestParam String termo) {
        RetornoFrontendListaDTO retorno = promptService.buscar(termo);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Busca prompts por categoria")
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<?> buscarPorCategoria(@PathVariable String categoria) {
        RetornoFrontendListaDTO retorno = promptService.buscarPorCategoria(categoria);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Lista os prompts mais utilizados")
    @GetMapping("/mais-usados")
    public ResponseEntity<?> maisUsados() {
        RetornoFrontendListaDTO retorno = promptService.maisUsados();
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    // ============================================
    // CRUD
    // ============================================

    @Operation(summary = "Cria um novo prompt")
    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody PromptDTO promptDTO) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.criar(promptDTO);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.cadastroSucesso(), "", HttpStatus.CREATED, util.sucesso());
    }

    @Operation(summary = "Atualiza um prompt existente",
               description = "Obs: Necessário informar o ID do prompt na URL.")
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PromptDTO promptDTO) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.atualizar(id, promptDTO);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Remove um prompt pelo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.deletar(id);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRemovido(), "", HttpStatus.OK, util.sucesso());
    }

    // ============================================
    // USO
    // ============================================

    @Operation(summary = "Registra o uso de um prompt por um usuário")
    @PostMapping("/{id}/usar")
    public ResponseEntity<?> registrarVisualizacaoUnica(
            @PathVariable Long id,
            @RequestParam String usuario) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.registrarUso(id, usuario);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.OK, util.sucesso());
    }

    // ============================================
    // HISTÓRICO DE VERSÕES
    // ============================================

    @Operation(summary = "Lista o histórico de versões de um prompt")
    @GetMapping("/{id}/historico")
    public ResponseEntity<?> verHistorico(@PathVariable Long id) {
        RetornoFrontendListaDTO retorno = promptService.verHistorico(id);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Busca uma versão específica do histórico de um prompt")
    @GetMapping("/{id}/historico/{versao}")
    public ResponseEntity<?> verVersao(
            @PathVariable Long id,
            @PathVariable Integer versao) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.verVersao(id, versao);
        if (retorno.getData() == null) {
            return ResponseEntity.notFound().build();
        }
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Remove uma versão específica do histórico de um prompt")
    @DeleteMapping("/{promptId}/historico/{versaoId}")
    public ResponseEntity<?> deletarVersao(
            @PathVariable Long promptId,
            @PathVariable Long versaoId) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.deletarVersao(promptId, versaoId);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRemovido(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Edita apenas o motivo de uma versão do histórico")
    @PutMapping("/{promptId}/historico/{versaoId}/motivo")
    public ResponseEntity<?> editarMotivoVersao(
            @PathVariable Long promptId,
            @PathVariable Long versaoId,
            @RequestParam String motivo) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.editarMotivoVersao(promptId, versaoId, motivo);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Atualiza o conteúdo e o motivo de uma versão do histórico")
    @PutMapping("/{promptId}/historico/{versaoId}")
    public ResponseEntity<?> atualizarVersaoCompleta(
            @PathVariable Long promptId,
            @PathVariable Long versaoId,
            @RequestParam String texto,
            @RequestParam String motivo) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.atualizarVersaoHistorica(promptId, versaoId, texto, motivo);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.OK, util.sucesso());
    }

    // ============================================
    // COMENTÁRIOS
    // ============================================

    @Operation(summary = "Lista todos os comentários de um prompt")
    @GetMapping("/{id}/comentarios")
    public ResponseEntity<?> listarComentarios(@PathVariable Long id) {
        RetornoFrontendListaDTO retorno = promptService.listarComentarios(id);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRetornado(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Adiciona um novo comentário a um prompt")
    @PostMapping("/{id}/comentarios")
    public ResponseEntity<?> adicionarComentario(
            @PathVariable Long id,
            @RequestParam String texto,
            @RequestParam String autor) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.adicionarComentario(id, texto, autor);
        if (retorno.getData() == null) {
            return ResponseEntity.notFound().build();
        }
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.CREATED, util.sucesso());
    }

    @Operation(summary = "Edita o texto de um comentário existente")
    @PutMapping("/{promptId}/comentarios/{comentarioId}")
    public ResponseEntity<?> editarComentario(
            @PathVariable Long promptId,
            @PathVariable Long comentarioId,
            @RequestParam String texto) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.editarComentario(promptId, comentarioId, texto);
        if (retorno.getData() == null) {
            return ResponseEntity.notFound().build();
        }
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.sucesso(), "", HttpStatus.OK, util.sucesso());
    }

    @Operation(summary = "Remove um comentário de um prompt")
    @DeleteMapping("/{promptId}/comentarios/{comentarioId}")
    public ResponseEntity<?> deletarComentario(
            @PathVariable Long promptId,
            @PathVariable Long comentarioId) {
        RetornoPadraoFrontendObjetoDTO retorno = promptService.deletarComentario(promptId, comentarioId);
        return utilRespostaGenerico.retornoObjetoCorpo(retorno, util.registroRemovido(), "", HttpStatus.OK, util.sucesso());
    }
}