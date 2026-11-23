package br.uerj.dgti.bibliotecaprompts.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.Feedback;

/**
 * Repositório para a entidade Feedback (avaliação de prompts).
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /**
     * Verifica se já existe um feedback do usuário para o prompt informado.
     * Evita avaliações duplicadas do mesmo usuário.
     * @param promptId O ID do prompt.
     * @param usuario O identificador do usuário.
     * @return true se já existir avaliação.
     */
    boolean existsByPromptIdAndUsuario(Long promptId, String usuario);

    /**
     * Conta feedbacks positivos (nota >= 4) para o dashboard geral.
     * @return Total de avaliações positivas.
     */
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.nota >= 4")
    Long countFeedbacksPositivos();

    /**
     * Calcula a média geral de satisfação de todos os feedbacks.
     * Retorna 0.0 quando não há avaliações.
     * @return Média geral das notas.
     */
    @Query("SELECT COALESCE(AVG(f.nota), 0.0) FROM Feedback f")
    Double getMediaSatisfacaoGeral();

    /**
     * Calcula a média de estrelas de um prompt específico.
     * O COALESCE garante retorno 0.0 em vez de null quando não há notas.
     * @param promptId O ID do prompt.
     * @return Média das notas do prompt.
     */
    @Query("SELECT COALESCE(AVG(f.nota), 0.0) FROM Feedback f WHERE f.prompt.id = :promptId")
    Double getMediaByPromptId(@Param("promptId") Long promptId);

    /**
     * Conta o total de avaliações recebidas por um prompt específico.
     * @param promptId O ID do prompt.
     * @return Total de avaliações.
     */
    long countByPromptId(Long promptId);

    /**
     * Agrupa e conta a distribuição de notas (1 a 5 estrelas) para o gráfico do dashboard.
     * @return Lista de pares [nota, quantidade].
     */
    @Query("SELECT f.nota, COUNT(f) FROM Feedback f GROUP BY f.nota")
    List<Object[]> countDistribuicaoNotas();
}