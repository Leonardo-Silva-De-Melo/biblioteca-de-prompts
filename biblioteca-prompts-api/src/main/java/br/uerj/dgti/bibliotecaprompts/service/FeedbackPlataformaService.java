package br.uerj.dgti.bibliotecaprompts.service;

import br.uerj.dgti.bibliotecaprompts.dto.FeedbackPlataformaDTO;
import br.uerj.dgti.bibliotecaprompts.model.FeedbackPlataforma;
import br.uerj.dgti.bibliotecaprompts.repository.FeedbackPlataformaRepository;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackPlataformaService {

    private final FeedbackPlataformaRepository repository;
    private final Util util;

    public FeedbackPlataformaService(FeedbackPlataformaRepository repository, Util util) {
        this.repository = repository;
        this.util = util;
    }

    // Salva a avaliação geral do sistema
    @Transactional
    public RetornoPadraoFrontendObjetoDTO salvarFeedback(FeedbackPlataformaDTO dto) {
        FeedbackPlataforma feedback = new FeedbackPlataforma();
        feedback.setNota(dto.getNota());
        feedback.setComentario(dto.getComentario());
        feedback.setUsuario(dto.getUsuario());
        feedback.setDataCriacao(LocalDateTime.now());
        
        FeedbackPlataformaDTO salvo = toDTO(repository.save(feedback));
        return util.prepararRetornoObjetoFront(salvo, 200, util.sucesso());
    }

    // Retorna todos os feedbacks para o painel de estatísticas
    public RetornoFrontendListaDTO listarTodos() {
        List<FeedbackPlataformaDTO> lista = repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }

    private FeedbackPlataformaDTO toDTO(FeedbackPlataforma model) {
        FeedbackPlataformaDTO dto = new FeedbackPlataformaDTO();
        dto.setId(model.getId());
        dto.setNota(model.getNota());
        dto.setComentario(model.getComentario());
        dto.setUsuario(model.getUsuario());
        dto.setDataCriacao(model.getDataCriacao());
        return dto;
    }
}