package br.uerj.dgti.bibliotecaprompts.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import br.uerj.dgti.bibliotecaprompts.model.Favorito;
import br.uerj.dgti.bibliotecaprompts.model.Prompt;
import br.uerj.dgti.bibliotecaprompts.repository.FavoritoRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptRepository;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.exception.RegraDeNegocioException;

@Service
public class FavoritoService {

    private final FavoritoRepository repository;
    private final PromptRepository promptRepository;
    private final Util util;

    public FavoritoService(FavoritoRepository repository, PromptRepository promptRepository, Util util) {
        this.repository = repository;
        this.promptRepository = promptRepository;
        this.util = util;
    }
    
    
    @Transactional
    public RetornoPadraoFrontendObjetoDTO alternarFavorito(String usuario, Long promptId) {
        // 1. Tenta achar o favorito já existente
        var existente = repository.findByUsuarioAndPromptId(usuario, promptId);

        if (existente.isPresent()) {
            repository.delete(existente.get());
        } else {
            // 2. Busca o prompt no banco para garantir que ele existe (Integridade)
            Prompt prompt = promptRepository.findById(promptId)
                .orElseThrow(() -> new RegraDeNegocioException("Prompt não encontrado"));

            // 3. Salva o relacionamento
            repository.save(new Favorito(usuario, prompt));
        }
        return util.prepararRetornoObjetoFront(null, 200, util.sucesso());
    }

    @Transactional(readOnly = true)
    public RetornoFrontendListaDTO listarIdsFavoritos(String usuario) {
        List<Long> ids = repository.findByUsuario(usuario)
                		 .stream()
                		 .map(f -> f.getPrompt().getId()) // Pega o ID através do objeto Prompt
                		 .toList();
        return util.prepararRetornoListaFront(ids, 200, util.registroRetornado());
    }
}