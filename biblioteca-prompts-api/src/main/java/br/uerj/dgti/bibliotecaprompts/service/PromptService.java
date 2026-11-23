package br.uerj.dgti.bibliotecaprompts.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.uerj.dgti.bibliotecaprompts.dto.PaginacaoInfoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.PaginaRespostaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.PromptDTO;
import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.ComentarioDTO;
import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.HistoricoEdicaoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaPaginadaDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.exception.RegistroNaoEncontradoException;
import br.uerj.dgti.bibliotecaprompts.exception.RegraDeNegocioException;
import br.uerj.dgti.bibliotecaprompts.model.Comentario;
import br.uerj.dgti.bibliotecaprompts.model.HistoricoEdicao;
import br.uerj.dgti.bibliotecaprompts.model.Prompt;
import br.uerj.dgti.bibliotecaprompts.model.PromptVisualizacao;
import br.uerj.dgti.bibliotecaprompts.repository.ComentarioRepository;
import br.uerj.dgti.bibliotecaprompts.repository.HistoricoEdicaoRepository;
import br.uerj.dgti.bibliotecaprompts.repository.HistoricoUsoRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptVisualizacaoRepository;

@Service
@Transactional
public class PromptService {

    private final PromptRepository promptRepository;
    private final HistoricoEdicaoRepository historicoRepository;
    private final ComentarioRepository comentarioRepository;
    private final PromptVisualizacaoRepository promptVisualizacaoRepository;

    private final HistoricoUsoRepository historicoUsoRepository;
    private final Util util;

    public PromptService(PromptRepository promptRepository,
            HistoricoEdicaoRepository historicoRepository,
            ComentarioRepository comentarioRepository,
            PromptVisualizacaoRepository promptVisualizacaoRepository,
            HistoricoUsoRepository historicoUsoRepository,
            Util util) {

        this.promptRepository = promptRepository;
        this.historicoRepository = historicoRepository;
        this.comentarioRepository = comentarioRepository;
        this.promptVisualizacaoRepository = promptVisualizacaoRepository;

        this.historicoUsoRepository = historicoUsoRepository;
        this.util = util;
    }

    @Transactional(readOnly = true)
    public RetornoFrontendListaPaginadaDTO<PromptDTO> listarMeuHistorico(int pagina, int tamanho, String usuario) {

        List<Prompt> historicoBruto = historicoUsoRepository.findHistoricoByUsuarioRaw(usuario);

        // 2. O Java tira as repetições
        List<Prompt> historicoUnico = historicoBruto.stream()
                .distinct()
                .collect(Collectors.toList());

        // 3. Paginação manual
        int inicio = Math.min(pagina * tamanho, historicoUnico.size());
        int fim = Math.min(inicio + tamanho, historicoUnico.size());
        List<Prompt> paginaCortada = historicoUnico.subList(inicio, fim);

        // 4. Converte para DTO
        List<PromptDTO> listaDtos = paginaCortada.stream().map(this::toDTO).collect(Collectors.toList());

        // 5. Retorna a página pronta
        PaginacaoInfoDTO info = new PaginacaoInfoDTO();
        info.setTotalElementos((long) historicoUnico.size());
        info.setTotalPaginas((int) Math.ceil((double) historicoUnico.size() / tamanho));
        info.setPaginaAtual(pagina);

        PaginaRespostaDTO<PromptDTO> paginaResposta = new PaginaRespostaDTO<>(listaDtos, info);
        return util.prepararRetornoListaFrontComPaginacaoGenerico(paginaResposta, 200, util.registroRetornado());
    }

    @Transactional
    public RetornoPadraoFrontendObjetoDTO registrarUso(Long promptId, String usuario) {
        // 1. A TRAVA: O Spring Data JPA entende "PromptId" como o ID dentro do objeto
        // Prompt
        if (!promptVisualizacaoRepository.existsByPromptIdAndUsuario(promptId, usuario)) {

            // 2. Busca o prompt (necessário para incrementar o uso e associar à visualização)
            Prompt prompt = promptRepository.findById(promptId)
                    .orElseThrow(() -> new RegistroNaoEncontradoException("Prompt não encontrado."));

            // 3. Incrementa o contador de uso via método de negócio da entidade
            prompt.incrementarUso();
            promptRepository.save(prompt);

            // 4. Registra a visualização única do usuário
            PromptVisualizacao novaVisu = new PromptVisualizacao();
            novaVisu.setPrompt(prompt);
            novaVisu.setUsuario(usuario);
            promptVisualizacaoRepository.save(novaVisu);

        }
        return util.prepararRetornoObjetoFront(null, 200, util.sucesso());
    }

    // ===================================================================================
    // NOVA FUNCIONALIDADE: EDITAR MOTIVO DA VERSÃO
    // ===================================================================================

    /**
     * Atualiza o motivo de uma versão específica do histórico.
     * Chamado pelo botão "Editar Motivo" no Frontend.
     */
    public RetornoPadraoFrontendObjetoDTO editarMotivoVersao(Long promptId, Long versaoId, String novoMotivo) {
        // 1. Busca a versão no banco
        HistoricoEdicao versao = historicoRepository.findById(versaoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Versão histórica não encontrada."));

        // 2. Segurança: Verifica se a versão realmente pertence ao prompt da URL
        if (!versao.getPrompt().getId().equals(promptId)) {
            throw new RegraDeNegocioException("A versão informada não pertence ao prompt.");
        }
        // 3. Atualiza e salva
        versao.setMotivoEdicao(novoMotivo);
        historicoRepository.save(versao);
        return util.prepararRetornoObjetoFront(null, 200, util.sucesso());
    }

    // ===================================================================================
    // MÉTODOS DE PROMPT E HISTÓRICO
    // ===================================================================================

    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO listarTodos() {
        // 1. Busca todos os prompts do banco
        List<Prompt> prompts = promptRepository.findAll();

        // 2. Transforma cada "Prompt" em um "PromptDTO" com as estatísticas
        List<PromptDTO> lista = prompts.stream().map(this::toDTO).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    @Transactional(readOnly = true)
    public RetornoFrontendListaPaginadaDTO<PromptDTO> listarTodosPaginado(int paginaAtual, int tamanhoPagina, String termo,
            String categoria) {

        Pageable pageable = PageRequest.of(
                paginaAtual, tamanhoPagina, Direction.DESC, "vezesUsado");

        Page<Prompt> paginaSpring;

        if (termo != null && !termo.trim().isEmpty()) {
            paginaSpring = promptRepository.buscarPorTermoPaginado(termo, pageable);
        } else if (categoria != null && !categoria.trim().isEmpty()) {
            paginaSpring = promptRepository.findByCategoria(categoria, pageable);
        } else {
            paginaSpring = promptRepository.findAll(pageable);
        }

        List<PromptDTO> listaDtos = paginaSpring.getContent().stream().map(this::toDTO).collect(Collectors.toList());

        PaginacaoInfoDTO info = new PaginacaoInfoDTO();
        info.setTotalElementos(paginaSpring.getTotalElements());
        info.setTotalPaginas(paginaSpring.getTotalPages());
        info.setPaginaAtual(paginaSpring.getNumber());
        info.setTamanhoPagina(paginaSpring.getSize());
        info.setPrimeiraPagina(paginaSpring.isFirst());
        info.setUltimaPagina(paginaSpring.isLast());

        PaginaRespostaDTO<PromptDTO> paginaResposta = new PaginaRespostaDTO<>(listaDtos, info);
        return util.prepararRetornoListaFrontComPaginacaoGenerico(paginaResposta, 200, util.registroRetornado());
    }

    @Transactional(readOnly = true)
    public Prompt buscarEntidadePorId(Long id) {
        return promptRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Prompt não encontrado."));
    }

    @Transactional(readOnly = true)
    public RetornoPadraoFrontendObjetoDTO buscarPorId(Long id) {
        Prompt prompt = promptRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Prompt não encontrado."));
        return util.prepararRetornoObjetoFront(toDTO(prompt), 200, util.registroRetornado());
    }

    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO buscarPorCategoria(String categoria) {
        List<PromptDTO> lista = promptRepository.findByCategoria(categoria)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO buscar(String termo) {
        List<PromptDTO> lista = promptRepository.buscarPorTermo(termo)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    /**
     * Melhoria de Performance: Deixa o banco ordenar.
     * (Requer criar o método findTop10ByOrderByVezesUsadoDesc no Repository)
     */
    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO maisUsados() {
        // Delega a ordenação e o limite ao banco de dados (mais eficiente que carregar tudo em memória)
        List<PromptDTO> lista = promptRepository.findTop10ByOrderByVezesUsadoDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    public RetornoPadraoFrontendObjetoDTO criar(PromptDTO dto) {
        Prompt prompt = new Prompt();
        prompt.setTitulo(dto.getTitulo());
        prompt.setCategoria(dto.getCategoria());
        prompt.setDescricao(dto.getDescricao());
        prompt.setTextoPrompt(dto.getTextoPrompt());
        prompt.setAutor(dto.getAutor());
        prompt.setTags(dto.getTags());

        Prompt savedPrompt = promptRepository.save(prompt);
        salvarHistorico(savedPrompt, dto.getAutor(), "Criação inicial");

        return util.prepararRetornoObjetoFront(toDTO(savedPrompt), 200, util.sucesso());
    }

    @Transactional
    public RetornoPadraoFrontendObjetoDTO atualizar(Long id, PromptDTO dto) {
        Prompt prompt = promptRepository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Prompt não encontrado."));

        prompt.setTitulo(dto.getTitulo());
        prompt.setCategoria(dto.getCategoria());
        prompt.setDescricao(dto.getDescricao());
        prompt.setTextoPrompt(dto.getTextoPrompt());
        prompt.setTags(dto.getTags());

        Prompt updated = promptRepository.save(prompt);

        // Garante que a string do autor não fique vazia
        String autorEdicao = (dto.getEditadoPor() != null && !dto.getEditadoPor().isEmpty())
                ? dto.getEditadoPor()
                : prompt.getAutor();

        salvarHistorico(updated, autorEdicao, dto.getMotivoEdicao());

        return util.prepararRetornoObjetoFront(toDTO(updated), 200, util.sucesso());
    }

    public RetornoPadraoFrontendObjetoDTO deletar(Long id) {
        promptRepository.deleteById(id);
        return util.prepararRetornoObjetoFront(null, 200, util.registroRemovido());
    }

    public RetornoPadraoFrontendObjetoDTO atualizarVersaoHistorica(Long promptId, Long versaoId, String novoTexto, String novoMotivo) {
        // 1. Busca a versão no banco de dados
        HistoricoEdicao versao = historicoRepository.findById(versaoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Versão histórica não encontrada."));

        // 2. Segurança: Verifica se a versão realmente pertence ao prompt informado
        if (!versao.getPrompt().getId().equals(promptId)) {
            throw new RegraDeNegocioException("A versão informada não pertence ao prompt.");
        }

        // 3. Atualiza o texto e o motivo da versão e persiste
        versao.setTextoVersao(novoTexto);
        versao.setMotivoEdicao(novoMotivo);
        historicoRepository.save(versao);
        return util.prepararRetornoObjetoFront(null, 200, util.sucesso());
    }

    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO verHistorico(Long promptId) {
        List<HistoricoEdicaoDTO> lista = historicoRepository.findByPromptIdOrderByDataEdicaoDesc(promptId)
                .stream().map(this::toHistoricoEdicaoDTO).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    @Transactional(readOnly = true)
    public RetornoPadraoFrontendObjetoDTO verVersao(Long promptId, Integer versao) {
        HistoricoEdicaoDTO dto = historicoRepository.findByPromptIdAndNumeroVersao(promptId, versao)
                .map(this::toHistoricoEdicaoDTO).orElse(null);
        return util.prepararRetornoObjetoFront(dto, 200, util.registroRetornado());
    }

    private void salvarHistorico(Prompt prompt, String editadoPor, String motivo) {

        // 1. Busca o maior número de versão existente no banco para esse prompt
        // Usamos Integer (objeto) porque se não houver versões, o SQL retorna NULL
        Integer ultimaVersao = historicoRepository.findMaxNumeroVersaoByPromptId(prompt.getId());

        // 2. Se for NULL (primeira versão), vira 0. Depois somamos +1.
        int proximaVersao = (ultimaVersao != null ? ultimaVersao : 0) + 1;

        HistoricoEdicao historico = new HistoricoEdicao();
        historico.setPrompt(prompt);
        historico.setTextoVersao(prompt.getTextoPrompt());
        historico.setEditadoPor(editadoPor != null ? editadoPor : prompt.getAutor());

        // Define o motivo padrão se vier vazio
        historico.setMotivoEdicao(motivo != null && !motivo.isBlank() ? motivo : "Edição do prompt");

        // 3. Aplica o número sequencial correto
        historico.setNumeroVersao(proximaVersao);

        historicoRepository.save(historico);
    }

    /**
     * Deletar uma versão do histórico - REGRA: Protege apenas a primeira
     */
    @Transactional
    public RetornoPadraoFrontendObjetoDTO deletarVersao(Long promptId, Long versaoId) {
        HistoricoEdicao versao = historicoRepository.findById(versaoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Versão histórica não encontrada."));

        if (!versao.getPrompt().getId().equals(promptId)) {
            throw new RegraDeNegocioException("A versão informada não pertence ao prompt.");
        }

        // Regra de negócio: a versão original (Versão 1) não pode ser removida
        if (versao.getNumeroVersao() == 1) {
            throw new RegraDeNegocioException("Não é permitido deletar a versão original (Versão 1).");
        }
        historicoRepository.delete(versao);
        return util.prepararRetornoObjetoFront(null, 200, util.registroRemovido());
    }

    // ===================================================================================
    // MÉTODOS DE COMENTÁRIOS
    // ===================================================================================

    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO listarComentarios(Long promptId) {
        List<ComentarioDTO> lista = comentarioRepository.findByPromptIdOrderByDataCriacaoDesc(promptId)
                .stream().map(this::toComentarioDTO).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    public RetornoPadraoFrontendObjetoDTO adicionarComentario(Long promptId, String texto, String autor) {
        ComentarioDTO dto = promptRepository.findById(promptId).map(prompt -> {
            Comentario comentario = new Comentario();
            comentario.setPrompt(prompt);
            comentario.setTexto(texto);
            comentario.setAutor(autor);
            return toComentarioDTO(comentarioRepository.save(comentario));
        }).orElse(null);
        return util.prepararRetornoObjetoFront(dto, 200, util.sucesso());
    }

    public RetornoPadraoFrontendObjetoDTO editarComentario(Long promptId, Long comentarioId, String novoTexto) {
        ComentarioDTO dto = comentarioRepository.findById(comentarioId)
                .filter(comentario -> comentario.getPrompt().getId().equals(promptId))
                .map(comentario -> {
                    comentario.setTexto(novoTexto);
                    return toComentarioDTO(comentarioRepository.save(comentario));
                }).orElse(null);
        return util.prepararRetornoObjetoFront(dto, 200, util.sucesso());
    }

    public RetornoPadraoFrontendObjetoDTO deletarComentario(Long promptId, Long comentarioId) {
        comentarioRepository.findById(comentarioId)
                .filter(comentario -> comentario.getPrompt().getId().equals(promptId))
                .ifPresent(comentarioRepository::delete);
        return util.prepararRetornoObjetoFront(null, 200, util.registroRemovido());
    }

    // ===================================================================================
    // MÉTODOS NOVOS: MEUS PROMPTS E HISTÓRICO
    // ===================================================================================

    @Transactional(readOnly = true)
    public RetornoFrontendListaPaginadaDTO<PromptDTO> listarMeusPrompts(int pagina, int tamanho, String autor) {
        Pageable pageable = PageRequest.of(pagina, tamanho, Direction.DESC, "dataCriacao");

        // Depende de findByAutor declarado em PromptRepository.
        Page<Prompt> paginaSpring = promptRepository.findByAutor(autor, pageable);

        PaginaRespostaDTO<PromptDTO> paginaResposta = converterParaPaginaDTO(paginaSpring);
        return util.prepararRetornoListaFrontComPaginacaoGenerico(paginaResposta, 200, util.registroRetornado());
    }

    // ===================================================================================
    // MÉTODO AUXILIAR PARA REAPROVEITAR CÓDIGO
    // ===================================================================================

    private PromptDTO toDTO(Prompt p) {
        PromptDTO dto = new PromptDTO();
        dto.setId(p.getId());
        dto.setTitulo(p.getTitulo());
        dto.setCategoria(p.getCategoria());
        dto.setDescricao(p.getDescricao());
        dto.setTextoPrompt(p.getTextoPrompt());
        dto.setAutor(p.getAutor());
        dto.setVezesUsado(p.getVezesUsado());
        dto.setDataCriacao(p.getDataCriacao());
        dto.setTags(p.getTags());
        dto.setMediaAvaliacao(p.getMediaAvaliacao() != null ? p.getMediaAvaliacao() : 0.0);
        dto.setTotalAvaliacoes(p.getTotalAvaliacoes() != null ? p.getTotalAvaliacoes().longValue() : 0L);
        return dto;
    }

    private ComentarioDTO toComentarioDTO(Comentario c) {
        ComentarioDTO dto = new ComentarioDTO();
        dto.setId(c.getId());
        dto.setTexto(c.getTexto());
        dto.setAutor(c.getAutor());
        dto.setDataCriacao(c.getDataCriacao());
        return dto;
    }

    private HistoricoEdicaoDTO toHistoricoEdicaoDTO(HistoricoEdicao h) {
        HistoricoEdicaoDTO dto = new HistoricoEdicaoDTO();
        dto.setId(h.getId());
        dto.setTextoVersao(h.getTextoVersao());
        dto.setEditadoPor(h.getEditadoPor());
        dto.setDataEdicao(h.getDataEdicao());
        dto.setMotivoEdicao(h.getMotivoEdicao());
        dto.setDiffJson(h.getDiffJson());
        dto.setNumeroVersao(h.getNumeroVersao());
        return dto;
    }

    // Como estamos usando paginação em vários lugares, esse método evita repetir
    // código
    private PaginaRespostaDTO<PromptDTO> converterParaPaginaDTO(Page<Prompt> paginaSpring) {
        List<PromptDTO> listaDtos = paginaSpring.getContent().stream().map(this::toDTO).collect(Collectors.toList());

        PaginacaoInfoDTO info = new PaginacaoInfoDTO();
        info.setTotalElementos(paginaSpring.getTotalElements());
        info.setTotalPaginas(paginaSpring.getTotalPages());
        info.setPaginaAtual(paginaSpring.getNumber());
        info.setTamanhoPagina(paginaSpring.getSize());
        info.setPrimeiraPagina(paginaSpring.isFirst());
        info.setUltimaPagina(paginaSpring.isLast());

        return new PaginaRespostaDTO<>(listaDtos, info);
    }

}