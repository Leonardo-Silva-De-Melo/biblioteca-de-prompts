package br.uerj.dgti.bibliotecaprompts.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.HistoricoEdicao;

@Repository
public interface HistoricoEdicaoRepository extends JpaRepository<HistoricoEdicao, Long> {
    
    // Lista o histórico de um prompt ordenado pela data (mais recente primeiro)
    List<HistoricoEdicao> findByPromptIdOrderByDataEdicaoDesc(Long promptId);
    
    // Busca uma versão específica
    Optional<HistoricoEdicao> findByPromptIdAndNumeroVersao(Long promptId, Integer numeroVersao);
    
    // Conta quantas edições existem para saber o número da próxima versão
    long countByPromptId(Long promptId);
    
    //Integer findMaxNumeroVersaoByPromptId(Long promptId);
    //busca o maior número de versão para o ID do prompt
    @Query("SELECT MAX(h.numeroVersao) FROM HistoricoEdicao h WHERE h.prompt.id = :promptId")
    Integer findMaxNumeroVersaoByPromptId(@Param("promptId") Long promptId);
}