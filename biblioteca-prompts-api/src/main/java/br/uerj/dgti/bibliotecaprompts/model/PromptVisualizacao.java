package br.uerj.dgti.bibliotecaprompts.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "prompt_visualizacoes")
public class PromptVisualizacao implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prompt_id", nullable = false)
    @JsonIgnore
    private Prompt prompt;
   
    private String usuario; 
    
    private LocalDateTime dataVisualizacao = LocalDateTime.now();

    public PromptVisualizacao(Long id, Prompt prompt, String usuario, LocalDateTime dataVisualizacao) {
		this.id = id;
		this.prompt = prompt;
		this.usuario = usuario;
		this.dataVisualizacao = dataVisualizacao;
	}

	public PromptVisualizacao() {
		
	}
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	
	public Prompt getPrompt() {
		return prompt;
	}

	public void setPrompt(Prompt prompt) {
		this.prompt = prompt;
	}

	public String getUsuario() {
		return usuario;
	}
	public void setUsuario(String usuario) {
		this.usuario = usuario;
	}
	public LocalDateTime getDataVisualizacao() {
		return dataVisualizacao;
	}
	public void setDataVisualizacao(LocalDateTime dataVisualizacao) {
		this.dataVisualizacao = dataVisualizacao;
	}
	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		PromptVisualizacao other = (PromptVisualizacao) obj;
		return Objects.equals(id, other.id);
	}
    
    
}
