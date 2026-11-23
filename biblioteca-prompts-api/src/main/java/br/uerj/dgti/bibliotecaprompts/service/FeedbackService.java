package br.uerj.dgti.bibliotecaprompts.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.FeedbackDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.exception.RegistroNaoEncontradoException;
import br.uerj.dgti.bibliotecaprompts.exception.RegraDeNegocioException;
import br.uerj.dgti.bibliotecaprompts.model.Feedback;
import br.uerj.dgti.bibliotecaprompts.model.Prompt;
import br.uerj.dgti.bibliotecaprompts.repository.FeedbackRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptRepository;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final PromptRepository promptRepository;
    private final Util util;

    public FeedbackService(FeedbackRepository feedbackRepository, PromptRepository promptRepository, Util util) {
        this.feedbackRepository = feedbackRepository;
        this.promptRepository = promptRepository;
        this.util = util;
    }

    @Transactional
    public RetornoPadraoFrontendObjetoDTO salvarAvaliacao(Long promptId, FeedbackDTO dto) {
        
        if (feedbackRepository.existsByPromptIdAndUsuario(promptId, dto.getUsuario())) {
            throw new RegraDeNegocioException("Você já avaliou este prompt anteriormente.");
        }
        
        // 2. Busca o Prompt no banco
        Prompt prompt = promptRepository.findById(promptId)
                .orElseThrow(() -> new RegistroNaoEncontradoException("Prompt não encontrado com ID: " + promptId));

        // 3. Cria a entidade Feedback
        Feedback feedback = new Feedback();
        feedback.setNota(dto.getNota());
        feedback.setComentario(dto.getComentario());
        feedback.setUsuario(dto.getUsuario());
        feedback.setPrompt(prompt);

        // ==========================================
        //  AS MODIFICAÇÕES NECESSÁRIAS:
        // ==========================================
        
        // A. Adiciona o novo feedback à lista do prompt (essencial para o cálculo)
        prompt.getFeedbacks().add(feedback);
        
        // B. Delega o recalculo da media para a entidade
        prompt.atualizarEstatisticasAvaliacao();
        
        // C. Salva o prompt atualizado (isso grava a média e o total no banco)
        promptRepository.save(prompt);

        // 4. Salva o feedback e retorna
        Feedback salvo = feedbackRepository.save(feedback);
        
        FeedbackDTO retDto = new FeedbackDTO(
            salvo.getId(), 
            salvo.getNota(), 
            salvo.getComentario(), 
            salvo.getUsuario(), 
            salvo.getDataCriacao(), 
            promptId
        );
        return util.prepararRetornoObjetoFront(retDto, 200, util.sucesso());
    }
}