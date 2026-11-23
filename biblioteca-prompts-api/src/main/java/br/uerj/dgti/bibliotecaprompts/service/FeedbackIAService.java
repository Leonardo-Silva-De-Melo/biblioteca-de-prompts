package br.uerj.dgti.bibliotecaprompts.service;

import br.uerj.dgti.bibliotecaprompts.dto.FeedbackIADTO;
import br.uerj.dgti.bibliotecaprompts.model.FeedbackIA;
import br.uerj.dgti.bibliotecaprompts.repository.FeedbackIARepository;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackIAService {

    @Autowired
    private FeedbackIARepository repository;

    @Autowired
    private Util util;

    public RetornoPadraoFrontendObjetoDTO salvar(FeedbackIADTO dto) {
        FeedbackIA entity = new FeedbackIA();
        entity.setUsuarioId(dto.getUsuarioId());
        entity.setPromptUtilizado(dto.getPromptUtilizado());
        entity.setRespostaIA(dto.getRespostaIA());
        entity.setFoiUtil(dto.getFoiUtil());
        entity.setMinutosEconomizados(dto.getMinutosEconomizados());

        FeedbackIA salvo = repository.save(entity);
        dto.setId(salvo.getId());
        dto.setDataCriacao(salvo.getDataCriacao());
        dto.setDataCriacao(salvo.getDataCriacao());
        return util.prepararRetornoObjetoFront(dto, 200, util.sucesso());
    }

    public RetornoFrontendListaDTO listarPorUsuario(String usuarioId) {
        List<FeedbackIADTO> lista = repository.findByUsuarioId(usuarioId).stream().map(entity -> {
            FeedbackIADTO dto = new FeedbackIADTO();
            dto.setId(entity.getId());
            dto.setUsuarioId(entity.getUsuarioId());
            dto.setPromptUtilizado(entity.getPromptUtilizado());
            dto.setRespostaIA(entity.getRespostaIA());
            dto.setFoiUtil(entity.getFoiUtil());
            dto.setMinutosEconomizados(entity.getMinutosEconomizados());
            dto.setDataCriacao(entity.getDataCriacao());
            return dto;
        }).collect(Collectors.toList());
        return util.prepararRetornoListaFront(lista, 200, util.registroRetornado());
    }
}
