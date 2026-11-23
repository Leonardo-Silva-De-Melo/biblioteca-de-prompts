package br.uerj.dgti.bibliotecaprompts.service;

import br.uerj.dgti.bibliotecaprompts.dto.DiagnosticoDTO;
import br.uerj.dgti.bibliotecaprompts.model.Diagnostico;
import br.uerj.dgti.bibliotecaprompts.repository.DiagnosticoRepository;
import br.uerj.dgti.bibliotecaprompts.exception.RegistroNaoEncontradoException;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiagnosticoService {

    @Autowired
    private DiagnosticoRepository repository;

    @Autowired
    private Util util;

    public RetornoPadraoFrontendObjetoDTO salvar(DiagnosticoDTO dto) {
        Diagnostico diagnostico = new Diagnostico();
        diagnostico.setUsuarioId(dto.getUsuarioId());
        diagnostico.setPapel(dto.getPapel());
        diagnostico.setTecnologiasPrincipais(dto.getTecnologiasPrincipais());
        diagnostico.setEtapaMaisDemorada(dto.getEtapaMaisDemorada());
        diagnostico.setPrincipalCausaAtraso(dto.getPrincipalCausaAtraso());
        diagnostico.setHorasPerdidasSemana(dto.getHorasPerdidasSemana());
        diagnostico.setNotaDocumentacaoSistemas(dto.getNotaDocumentacaoSistemas());
        diagnostico.setMotivoComumBugs(dto.getMotivoComumBugs());
        diagnostico.setNivelExperienciaIA(dto.getNivelExperienciaIA());
        diagnostico.setTarefasParaDelegarIA(dto.getTarefasParaDelegarIA());
        diagnostico.setComentarioLivre(dto.getComentarioLivre());
        diagnostico.setSatisfacaoFerramentas(dto.getSatisfacaoFerramentas());
        diagnostico.setFocoTrabalho(dto.getFocoTrabalho());
        diagnostico.setMetodoRevisao(dto.getMetodoRevisao());
        diagnostico.setCoberturaTestes(dto.getCoberturaTestes());
        diagnostico.setUsaIaPorContaPropria(dto.getUsaIaPorContaPropria());
        diagnostico.setMaiorPreocupacaoIa(dto.getMaiorPreocupacaoIa());

        Diagnostico salvo = repository.save(diagnostico);
        dto.setId(salvo.getId());
        dto.setDataCriacao(salvo.getDataCriacao());
        dto.setDataCriacao(salvo.getDataCriacao());
        return util.prepararRetornoObjetoFront(dto, 200, util.sucesso());
    }

    public RetornoPadraoFrontendObjetoDTO buscarPorUsuarioId(String usuarioId) {
        Diagnostico diagnostico = repository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Diagnóstico não encontrado."));
        
        DiagnosticoDTO dto = new DiagnosticoDTO();
            dto.setId(diagnostico.getId());
            dto.setUsuarioId(diagnostico.getUsuarioId());
            dto.setPapel(diagnostico.getPapel());
            dto.setTecnologiasPrincipais(diagnostico.getTecnologiasPrincipais());
            dto.setEtapaMaisDemorada(diagnostico.getEtapaMaisDemorada());
            dto.setPrincipalCausaAtraso(diagnostico.getPrincipalCausaAtraso());
            dto.setHorasPerdidasSemana(diagnostico.getHorasPerdidasSemana());
            dto.setNotaDocumentacaoSistemas(diagnostico.getNotaDocumentacaoSistemas());
            dto.setMotivoComumBugs(diagnostico.getMotivoComumBugs());
            dto.setNivelExperienciaIA(diagnostico.getNivelExperienciaIA());
            dto.setTarefasParaDelegarIA(diagnostico.getTarefasParaDelegarIA());
            dto.setComentarioLivre(diagnostico.getComentarioLivre());
            dto.setSatisfacaoFerramentas(diagnostico.getSatisfacaoFerramentas());
            dto.setFocoTrabalho(diagnostico.getFocoTrabalho());
            dto.setMetodoRevisao(diagnostico.getMetodoRevisao());
            dto.setCoberturaTestes(diagnostico.getCoberturaTestes());
            dto.setUsaIaPorContaPropria(diagnostico.getUsaIaPorContaPropria());
            dto.setMaiorPreocupacaoIa(diagnostico.getMaiorPreocupacaoIa());
            dto.setDataCriacao(diagnostico.getDataCriacao());
        dto.setDataCriacao(diagnostico.getDataCriacao());
        return util.prepararRetornoObjetoFront(dto, 200, util.registroRetornado());
    }

    public RetornoFrontendListaDTO buscarTodos() {
        List<DiagnosticoDTO> lista = repository.findAll().stream().map(diagnostico -> {
            DiagnosticoDTO dto = new DiagnosticoDTO();
            dto.setId(diagnostico.getId());
            dto.setUsuarioId(diagnostico.getUsuarioId());
            dto.setPapel(diagnostico.getPapel());
            dto.setTecnologiasPrincipais(diagnostico.getTecnologiasPrincipais());
            dto.setEtapaMaisDemorada(diagnostico.getEtapaMaisDemorada());
            dto.setPrincipalCausaAtraso(diagnostico.getPrincipalCausaAtraso());
            dto.setHorasPerdidasSemana(diagnostico.getHorasPerdidasSemana());
            dto.setNotaDocumentacaoSistemas(diagnostico.getNotaDocumentacaoSistemas());
            dto.setMotivoComumBugs(diagnostico.getMotivoComumBugs());
            dto.setNivelExperienciaIA(diagnostico.getNivelExperienciaIA());
            dto.setTarefasParaDelegarIA(diagnostico.getTarefasParaDelegarIA());
            dto.setComentarioLivre(diagnostico.getComentarioLivre());
            dto.setSatisfacaoFerramentas(diagnostico.getSatisfacaoFerramentas());
            dto.setFocoTrabalho(diagnostico.getFocoTrabalho());
            dto.setMetodoRevisao(diagnostico.getMetodoRevisao());
            dto.setCoberturaTestes(diagnostico.getCoberturaTestes());
            dto.setUsaIaPorContaPropria(diagnostico.getUsaIaPorContaPropria());
            dto.setMaiorPreocupacaoIa(diagnostico.getMaiorPreocupacaoIa());
            dto.setDataCriacao(diagnostico.getDataCriacao());
            return dto;
        }).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }
}
