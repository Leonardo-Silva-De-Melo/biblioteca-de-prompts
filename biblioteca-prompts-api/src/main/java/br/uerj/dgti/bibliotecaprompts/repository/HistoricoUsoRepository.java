package br.uerj.dgti.bibliotecaprompts.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.HistoricoUso;
import br.uerj.dgti.bibliotecaprompts.model.Prompt;

/**
 * Repositório para a entidade HistoricoUso.
 */
@Repository
public interface HistoricoUsoRepository extends JpaRepository<HistoricoUso, Long> {

    /**
     * Busca o histórico de uso de um usuário paginado, ordenado por data decrescente.
     * @param usuario O identificador do usuário.
     * @param pageable Configurações de paginação.
     * @return Página de registros de uso.
     */
    Page<HistoricoUso> findByUsuarioOrderByDataUsoDesc(String usuario, Pageable pageable);

    /**
     * Busca o histórico de uso de um usuário dentro de um período de datas.
     * @param usuario O identificador do usuário.
     * @param dataInicio Data de início do período.
     * @param dataFim Data de fim do período.
     * @param pageable Configurações de paginação.
     * @return Página de registros de uso no período.
     */
    @Query("SELECT h FROM HistoricoUso h WHERE h.usuario = :usuario " +
           "AND h.dataUso BETWEEN :dataInicio AND :dataFim " +
           "ORDER BY h.dataUso DESC")
    Page<HistoricoUso> findByUsuarioAndDataUsoBetween(
        @Param("usuario") String usuario,
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim,
        Pageable pageable
    );

    /**
     * Busca o histórico de uso de um usuário filtrado por categoria de prompt.
     * Utiliza a navegação pelo relacionamento @ManyToOne (prompt -> categoria).
     * @param usuario O identificador do usuário.
     * @param categoria A categoria do prompt.
     * @param pageable Configurações de paginação.
     * @return Página de registros de uso filtrada por categoria.
     */
    Page<HistoricoUso> findByUsuarioAndPrompt_Categoria(String usuario, String categoria, Pageable pageable);

    /**
     * Conta quantas vezes um usuário utilizou um prompt específico.
     * @param usuario O identificador do usuário.
     * @param promptId O ID do prompt.
     * @return Total de usos do prompt pelo usuário.
     */
    long countByUsuarioAndPromptId(String usuario, Long promptId);

    /**
     * Verifica se um usuário utilizou um prompt no dia corrente.
     * @param usuario O identificador do usuário.
     * @param promptId O ID do prompt.
     * @param inicioDoDia Início do dia (meia-noite).
     * @return true se o prompt foi utilizado hoje.
     */
    @Query("SELECT COUNT(h) > 0 FROM HistoricoUso h WHERE h.usuario = :usuario " +
           "AND h.prompt.id = :promptId AND h.dataUso >= :inicioDoDia")
    boolean usuarioUsouHoje(
        @Param("usuario") String usuario,
        @Param("promptId") Long promptId,
        @Param("inicioDoDia") LocalDateTime inicioDoDia
    );

    /**
     * Busca os prompts mais utilizados por um usuário, agrupados por ID e contagem.
     * @param usuario O identificador do usuário.
     * @param pageable Configurações de paginação.
     * @return Lista de pares [promptId, total] ordenada por uso decrescente.
     */
    @Query("SELECT h.prompt.id, COUNT(h) as total FROM HistoricoUso h " +
           "WHERE h.usuario = :usuario " +
           "GROUP BY h.prompt.id " +
           "ORDER BY total DESC")
    List<Object[]> findMaisUsadosPorUsuario(@Param("usuario") String usuario, Pageable pageable);

    /**
     * Busca todos os prompts utilizados por um usuário, ordenados por data de uso decrescente.
     * @param usuario O identificador do usuário.
     * @return Lista de prompts utilizados pelo usuário.
     */
    @Query("SELECT h.prompt FROM HistoricoUso h WHERE h.usuario = :usuario ORDER BY h.dataUso DESC")
    List<Prompt> findHistoricoByUsuarioRaw(@Param("usuario") String usuario);

    /**
     * Remove todo o histórico de uso de um usuário.
     * @param usuario O identificador do usuário.
     */
    void deleteByUsuario(String usuario);
}