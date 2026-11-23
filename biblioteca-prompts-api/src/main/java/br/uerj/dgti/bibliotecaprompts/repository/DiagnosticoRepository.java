package br.uerj.dgti.bibliotecaprompts.repository;

import br.uerj.dgti.bibliotecaprompts.model.Diagnostico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Long> {
    Optional<Diagnostico> findByUsuarioId(String usuarioId);
}
