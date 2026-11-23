package br.uerj.dgti.bibliotecaprompts.repository;

import br.uerj.dgti.bibliotecaprompts.model.FeedbackIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackIARepository extends JpaRepository<FeedbackIA, Long> {
    List<FeedbackIA> findByUsuarioId(String usuarioId);
}
