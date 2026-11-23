package br.uerj.dgti.bibliotecaprompts.service;

import br.uerj.dgti.bibliotecaprompts.dto.NotificacaoDTO;
import br.uerj.dgti.bibliotecaprompts.model.Notificacao;
import br.uerj.dgti.bibliotecaprompts.repository.NotificacaoRepository;
import br.uerj.dgti.bibliotecaprompts.exception.RegistroNaoEncontradoException;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaPaginadaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final Util util;

    @Autowired
    public NotificacaoService(NotificacaoRepository notificacaoRepository, Util util) {
        this.notificacaoRepository = notificacaoRepository;
        this.util = util;
    }

    private NotificacaoDTO toDTO(Notificacao notificacao) {
        return new NotificacaoDTO(notificacao);
    }

    /**
     * Criar nova notificação (evita duplicatas)
     */
    @Transactional
    public Notificacao criar(String usuario, String tipo, String titulo, String mensagem, Long promptId) {
        // Verificar se já existe notificação similar nas últimas 24h
        LocalDateTime dataLimite = LocalDateTime.now().minusHours(24);
        boolean existeSimilar = notificacaoRepository.existeSimilar(usuario, tipo, promptId, dataLimite);

        if (!existeSimilar) {
            Notificacao notificacao = new Notificacao(usuario, tipo, titulo, mensagem, promptId);
            notificacao.setLinkAcao("/prompts/" + promptId);
            return notificacaoRepository.save(notificacao);
        }

        return null; // Não criar duplicata
    }

    /**
     * Criar notificação de novo prompt
     */
    @Transactional
    public void notificarNovoPrompt(String autorPrompt, Long promptId, String tituloPrompt, String categoria) {
        // Notificar todos usuários exceto o autor (implementar lógica de seguidores se necessário)
        String mensagem = String.format("Novo prompt '%s' na categoria %s", tituloPrompt, categoria);
        // Por ora, não implementar broadcast para todos
        // Futuramente: buscar usuários interessados em 'categoria'
    }

    /**
     * Criar notificação de prompt editado
     */
    @Transactional
    public void notificarPromptEditado(String usuarioInteressado, Long promptId, String tituloPrompt) {
        criar(
            usuarioInteressado,
            "PROMPT_EDITADO",
            "Prompt atualizado",
            String.format("O prompt '%s' que você segue foi atualizado", tituloPrompt),
            promptId
        );
    }

    /**
     * Criar notificação de novo comentário
     */
    @Transactional
    public void notificarNovoComentario(String autorPrompt, Long promptId, String comentarista, String tituloPrompt) {
        if (!autorPrompt.equals(comentarista)) {
            criar(
                autorPrompt,
                "COMENTARIO",
                "Novo comentário",
                String.format("%s comentou no seu prompt '%s'", comentarista, tituloPrompt),
                promptId
            );
        }
    }

    /**
     * Criar notificação de resposta a comentário
     */
    @Transactional
    public void notificarRespostaComentario(String autorComentario, Long promptId, String responsor, String tituloPrompt) {
        if (!autorComentario.equals(responsor)) {
            criar(
                autorComentario,
                "RESPOSTA",
                "Nova resposta",
                String.format("%s respondeu seu comentário em '%s'", responsor, tituloPrompt),
                promptId
            );
        }
    }

    /**
     * Criar notificação de nova avaliação
     */
    @Transactional
    public void notificarNovaAvaliacao(String autorPrompt, Long promptId, int estrelas, String tituloPrompt) {
        criar(
            autorPrompt,
            "AVALIACAO",
            "Nova avaliação",
            String.format("Seu prompt '%s' recebeu %d estrelas", tituloPrompt, estrelas),
            promptId
        );
    }

    /**
     * Listar notificações do usuário (paginado)
     */
    @Transactional(readOnly = true)
    public RetornoFrontendListaPaginadaDTO<NotificacaoDTO> listar(String usuario, int page, int size) {
        Page<NotificacaoDTO> pagina = notificacaoRepository.findByUsuarioOrderByCriadaEmDesc(usuario, PageRequest.of(page, size))
                                                           .map(this::toDTO);
        return util.prepararRetornoListaFrontComPaginacao(pagina, 200, util.registroRetornado());
    }

    /**
     * Listar notificações não lidas
     */
    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO listarNaoLidas(String usuario) {
        List<NotificacaoDTO> lista = notificacaoRepository.findByUsuarioAndLidaFalseOrderByCriadaEmDesc(usuario)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    /**
     * Contar notificações não lidas
     */
    @Transactional(readOnly = true)
    public RetornoPadraoFrontendObjetoDTO contarNaoLidas(String usuario) {
        long contagem = notificacaoRepository.countByUsuarioAndLidaFalse(usuario);
        return util.prepararRetornoObjetoFront(java.util.Map.of("total", contagem), 200, util.registroRetornado());
    }

    /**
     * Marcar notificação como lida
     */
    @Transactional
    public RetornoPadraoFrontendObjetoDTO marcarComoLida(Long notificacaoId) {
        Notificacao notificacao = notificacaoRepository.findById(notificacaoId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Notificação não encontrada."));
        notificacao.marcarComoLida();
        notificacaoRepository.save(notificacao);
        return util.prepararRetornoObjetoFront(null, 200, util.sucesso());
    }

    /**
     * Marcar todas como lidas
     */
    @Transactional
    public RetornoPadraoFrontendObjetoDTO marcarTodasComoLidas(String usuario) {
        int alteradas = notificacaoRepository.marcarTodasComoLidas(usuario, LocalDateTime.now());
        return util.prepararRetornoObjetoFront(java.util.Map.of("alteradas", alteradas), 200, util.sucesso());
    }

    /**
     * Deletar notificação
     */
    @Transactional
    public RetornoPadraoFrontendObjetoDTO deletar(Long id) {
        if (!notificacaoRepository.existsById(id)) {
            throw new RegistroNaoEncontradoException("Notificação não encontrada.");
        }
        notificacaoRepository.deleteById(id);
        return util.prepararRetornoObjetoFront(null, 200, util.registroRemovido());
    }

    /**
     * Limpeza automática de notificações antigas (executar diariamente)
     */
    @Scheduled(cron = "0 0 2 * * *") // Executar às 2h da manhã todos os dias
    @Transactional
    public void limparNotificacoesAntigas() {
        LocalDateTime dataLimite = LocalDateTime.now().minusDays(30);
        notificacaoRepository.deletarAntigas(dataLimite);
    }
}