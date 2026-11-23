package br.uerj.dgti.bibliotecaprompts.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.Favorito;

/**
 * Repositório para a entidade Favorito.
 */
@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    /**
     * Busca todos os favoritos de um usuário específico.
     * @param usuario O identificador do usuário.
     * @return Lista de favoritos do usuário.
     */
    List<Favorito> findByUsuario(String usuario);

    /**
     * Busca um favorito pelo usuário e pelo ID do prompt associado.
     * Utiliza a navegação pelo relacionamento @ManyToOne (prompt -> id).
     * @param usuario O identificador do usuário.
     * @param promptId O ID do prompt.
     * @return Optional contendo o favorito, se existir.
     */
    Optional<Favorito> findByUsuarioAndPromptId(String usuario, Long promptId);
}