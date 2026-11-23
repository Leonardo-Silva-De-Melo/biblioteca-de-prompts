package br.uerj.dgti.bibliotecaprompts.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.uerj.dgti.bibliotecaprompts.model.HistoricoUso;
import br.uerj.dgti.bibliotecaprompts.model.Prompt;
import br.uerj.dgti.bibliotecaprompts.repository.HistoricoUsoRepository;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaPaginadaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.HistoricoUsoDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;

@Service
public class HistoricoUsoService {

    private final HistoricoUsoRepository historicoUsoRepository;
    private final PromptService promptService;
    private final Util util;

    
    public HistoricoUsoService(HistoricoUsoRepository historicoUsoRepository, PromptService promptService, Util util) {
        this.historicoUsoRepository = historicoUsoRepository;
        this.promptService = promptService;
        this.util = util;
    }

    @Transactional
    public RetornoPadraoFrontendObjetoDTO registrarUso(String usuario, Long promptId, String observacao) {
        Prompt prompt = promptService.buscarEntidadePorId(promptId);

        // Pegamos a meia-noite do dia de hoje
        LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();

        // Passamos o inicioDoDia para o repositório
        if (!historicoUsoRepository.usuarioUsouHoje(usuario, promptId, inicioDoDia)) {
            HistoricoUso historicoUso = new HistoricoUso();
            historicoUso.setUsuario(usuario);
            historicoUso.setPrompt(prompt);
            historicoUso.setDataUso(LocalDateTime.now());
            HistoricoUso salvo = historicoUsoRepository.save(historicoUso);
            return util.prepararRetornoObjetoFront(new HistoricoUsoDTO(salvo), 200, util.sucesso());
        }
        
        return util.prepararRetornoObjetoFront(null, 200, "Usuário já utilizou este prompt hoje");
    }
    /**
     * Buscar histórico de um usuário (paginado)
     */
    @Transactional(readOnly = true)
    public RetornoFrontendListaPaginadaDTO<HistoricoUsoDTO> buscarHistoricoPorUsuario(String usuario, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HistoricoUsoDTO> pagina = historicoUsoRepository.findByUsuarioOrderByDataUsoDesc(usuario, pageable)
                                       .map(HistoricoUsoDTO::new);
        return util.prepararRetornoListaFrontComPaginacao(pagina, 200, util.registroRetornado());
    }

    /**
     * Buscar histórico com filtro de data
     */
    @Transactional(readOnly = true)
    public RetornoFrontendListaPaginadaDTO<HistoricoUsoDTO> buscarHistoricoComFiltroData(
        String usuario, 
        LocalDateTime dataInicio, 
        LocalDateTime dataFim,
        int page,
        int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HistoricoUsoDTO> pagina = historicoUsoRepository.findByUsuarioAndDataUsoBetween(
            usuario, dataInicio, dataFim, pageable
        ).map(HistoricoUsoDTO::new);
        return util.prepararRetornoListaFrontComPaginacao(pagina, 200, util.registroRetornado());
    }

    /**
     * Buscar histórico por categoria
     */
    @Transactional(readOnly = true)
    public RetornoFrontendListaPaginadaDTO<HistoricoUsoDTO> buscarHistoricoPorCategoria(
        String usuario,
        String categoria,
        int page,
        int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HistoricoUsoDTO> pagina = historicoUsoRepository.findByUsuarioAndPrompt_Categoria(usuario, categoria, pageable)
                                       .map(HistoricoUsoDTO::new);
        return util.prepararRetornoListaFrontComPaginacao(pagina, 200, util.registroRetornado());
    }

    /**
     * Deletar item do histórico
     */
    @Transactional
    public RetornoPadraoFrontendObjetoDTO deletarHistorico(Long historicoId) {
        historicoUsoRepository.deleteById(historicoId);
        return util.prepararRetornoObjetoFront(null, 200, util.registroRemovido());
    }

    /**
     * Limpar todo histórico de um usuário
     */
    @Transactional
    public RetornoPadraoFrontendObjetoDTO limparHistoricoUsuario(String usuario) {
        // Executa um único DELETE WHERE usuario = ? no banco (muito mais eficiente)
        historicoUsoRepository.deleteByUsuario(usuario);
        return util.prepararRetornoObjetoFront(null, 200, util.registroRemovido());
    }
}