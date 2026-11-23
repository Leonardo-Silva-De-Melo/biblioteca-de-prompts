package br.uerj.dgti.bibliotecaprompts.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.Prompt;

/**
 * Repositório para a entidade Prompt.
 */
@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {

    /**
     * Busca todos os prompts de uma categoria específica.
     * @param categoria A categoria do prompt.
     * @return Lista de prompts da categoria.
     */
    List<Prompt> findByCategoria(String categoria);

    /**
     * Busca todos os prompts de um autor específico.
     * @param autor O identificador do autor.
     * @return Lista de prompts do autor.
     */
    List<Prompt> findByAutor(String autor);

    /**
     * Busca os prompts de uma categoria de forma paginada.
     * @param categoria A categoria do prompt.
     * @param pageable Configurações de paginação.
     * @return Página de prompts da categoria.
     */
    Page<Prompt> findByCategoria(String categoria, Pageable pageable);

    /**
     * Busca os prompts de um autor de forma paginada.
     * @param autor O identificador do autor.
     * @param pageable Configurações de paginação.
     * @return Página de prompts do autor.
     */
    Page<Prompt> findByAutor(String autor, Pageable pageable);

    /**
     * Busca os 10 prompts mais utilizados, ordenados por número de usos decrescente.
     * Utilizado na página inicial.
     * @return Lista com os 10 prompts mais usados.
     */
    List<Prompt> findTop10ByOrderByVezesUsadoDesc();

    /**
     * Busca os 5 prompts mais utilizados, ordenados por número de usos decrescente.
     * Utilizado nos gráficos do dashboard.
     * @return Lista com os 5 prompts mais usados.
     */
    List<Prompt> findTop5ByOrderByVezesUsadoDesc();

    /**
     * Busca prompts por termo de pesquisa nos campos título, descrição e texto do prompt.
     * A busca é insensível a maiúsculas/minúsculas.
     * @param termo O termo a ser pesquisado.
     * @return Lista de prompts que correspondem ao termo.
     */
    @Query("SELECT p FROM Prompt p WHERE " +
           "LOWER(p.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.textoPrompt) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Prompt> buscarPorTermo(@Param("termo") String termo);

    /**
     * Versão paginada da busca por termo nos campos título, descrição e texto do prompt.
     * @param termo O termo a ser pesquisado.
     * @param pageable Configurações de paginação.
     * @return Página de prompts que correspondem ao termo.
     */
    @Query("SELECT p FROM Prompt p WHERE " +
           "LOWER(p.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.textoPrompt) LIKE LOWER(CONCAT('%', :termo, '%'))")
    Page<Prompt> buscarPorTermoPaginado(@Param("termo") String termo, Pageable pageable);

    /**
     * Agrupa e conta o número de prompts por categoria.
     * Utilizado nos gráficos do dashboard.
     * @return Lista de pares [categoria, quantidade].
     */
    @Query("SELECT p.categoria, COUNT(p) FROM Prompt p GROUP BY p.categoria")
    List<Object[]> contarPorCategoria();

    /**
     * Soma o total de usos de todos os prompts.
     * Retorna 0 caso não haja registros.
     * @return Soma total de usos.
     */
    @Query("SELECT COALESCE(SUM(p.vezesUsado), 0) FROM Prompt p")
    long somaTotalUsos();

    /**
     * Conta o número de autores distintos na base de prompts.
     * @return Total de autores únicos.
     */
    @Query("SELECT COUNT(DISTINCT p.autor) FROM Prompt p")
    long contarAutoresUnicos();

    /**
     * Conta o número de prompts criados em um determinado mês e ano.
     * Utilizado no gráfico evolutivo do dashboard.
     * @param ano O ano de criação.
     * @param mes O mês de criação.
     * @return Total de prompts criados no período.
     */
    @Query("SELECT COUNT(p) FROM Prompt p WHERE YEAR(p.dataCriacao) = :ano AND MONTH(p.dataCriacao) = :mes")
    long countCriacoesPorMesEData(@Param("ano") int ano, @Param("mes") int mes);
}