package br.uerj.dgti.bibliotecaprompts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.Comentario;

/**
 * Repositório para a entidade Comentario.
 */
@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    /**
     * Lista os comentários de um prompt específico, ordenados do mais novo para o mais antigo.
     * @param promptId O ID do prompt.
     * @return Lista de comentários ordenada por data de criação decrescente.
     */
    List<Comentario> findByPromptIdOrderByDataCriacaoDesc(Long promptId);
}