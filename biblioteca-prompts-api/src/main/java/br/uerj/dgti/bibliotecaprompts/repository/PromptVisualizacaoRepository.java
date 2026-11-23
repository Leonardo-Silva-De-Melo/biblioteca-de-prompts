package br.uerj.dgti.bibliotecaprompts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.uerj.dgti.bibliotecaprompts.model.PromptVisualizacao;

@Repository
public interface PromptVisualizacaoRepository extends JpaRepository<PromptVisualizacao, Long>{
 
 // Verifica se o usuário já viu este prompt
 boolean existsByPromptIdAndUsuario(Long promptId, String usuario);
 
 // Conta quantas visualizações um prompt específico teve
 long countByPromptId(Long promptId);
		
}
