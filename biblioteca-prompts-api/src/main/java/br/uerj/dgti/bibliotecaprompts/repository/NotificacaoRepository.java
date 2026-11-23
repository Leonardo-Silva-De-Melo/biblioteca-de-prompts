package br.uerj.dgti.bibliotecaprompts.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.Notificacao;

/**
 * Repositório para a entidade Notificacao.
 */
@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    /**
     * Busca todas as notificações de um usuário paginadas, ordenadas por data decrescente.
     * @param usuario O identificador do usuário.
     * @param pageable Configurações de paginação.
     * @return Página de notificações.
     */
    Page<Notificacao> findByUsuarioOrderByCriadaEmDesc(String usuario, Pageable pageable);

    /**
     * Busca apenas as notificações não lidas de um usuário, ordenadas por data decrescente.
     * @param usuario O identificador do usuário.
     * @return Lista de notificações não lidas.
     */
    List<Notificacao> findByUsuarioAndLidaFalseOrderByCriadaEmDesc(String usuario);

    /**
     * Conta o número de notificações não lidas de um usuário (para exibição no badge).
     * @param usuario O identificador do usuário.
     * @return Total de notificações não lidas.
     */
    long countByUsuarioAndLidaFalse(String usuario);

    /**
     * Busca as notificações de um usuário filtradas por tipo, ordenadas por data decrescente.
     * @param usuario O identificador do usuário.
     * @param tipo O tipo da notificação (ex: NOVO_PROMPT, COMENTARIO).
     * @param pageable Configurações de paginação.
     * @return Página de notificações filtrada por tipo.
     */
    Page<Notificacao> findByUsuarioAndTipoOrderByCriadaEmDesc(
        String usuario,
        String tipo,
        Pageable pageable
    );

    /**
     * Busca notificações recentes de um usuário a partir de uma data limite.
     * @param usuario O identificador do usuário.
     * @param dataLimite Data a partir da qual as notificações serão retornadas.
     * @return Lista de notificações recentes.
     */
    @Query("SELECT n FROM Notificacao n WHERE n.usuario = :usuario " +
           "AND n.criadaEm >= :dataLimite " +
           "ORDER BY n.criadaEm DESC")
    List<Notificacao> findRecentes(
        @Param("usuario") String usuario,
        @Param("dataLimite") LocalDateTime dataLimite
    );

    /**
     * Marca todas as notificações não lidas de um usuário como lidas.
     * @param usuario O identificador do usuário.
     * @param dataLeitura A data/hora em que a leitura foi registrada.
     * @return Número de registros atualizados.
     */
    @Modifying
    @Query("UPDATE Notificacao n SET n.lida = true, n.lidaEm = :dataLeitura " +
           "WHERE n.usuario = :usuario AND n.lida = false")
    int marcarTodasComoLidas(
        @Param("usuario") String usuario,
        @Param("dataLeitura") LocalDateTime dataLeitura
    );

    /**
     * Remove notificações com data de criação anterior ao limite informado.
     * Utilizado para limpeza periódica de notificações antigas (ex: mais de 30 dias).
     * @param dataLimite Data de corte para exclusão.
     * @return Número de registros removidos.
     */
    @Modifying
    @Query("DELETE FROM Notificacao n WHERE n.criadaEm < :dataLimite")
    int deletarAntigas(@Param("dataLimite") LocalDateTime dataLimite);

    /**
     * Verifica se já existe uma notificação similar para o usuário evitando duplicatas.
     * @param usuario O identificador do usuário.
     * @param tipo O tipo da notificação.
     * @param promptId O ID do prompt relacionado.
     * @param dataLimite Data a partir da qual a verificação é feita.
     * @return true se já existir uma notificação similar recente.
     */
    @Query("SELECT COUNT(n) > 0 FROM Notificacao n " +
           "WHERE n.usuario = :usuario " +
           "AND n.tipo = :tipo " +
           "AND n.promptId = :promptId " +
           "AND n.criadaEm >= :dataLimite")
    boolean existeSimilar(
        @Param("usuario") String usuario,
        @Param("tipo") String tipo,
        @Param("promptId") Long promptId,
        @Param("dataLimite") LocalDateTime dataLimite
    );
}