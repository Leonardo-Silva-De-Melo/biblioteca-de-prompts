package br.uerj.dgti.bibliotecaprompts.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "historico_edicoes")
public class HistoricoEdicao implements Serializable{
    
	private static final long serialVersionUID = 1L;
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_id", nullable = false)
    @JsonIgnore 
    private Prompt prompt;
    
    @NotBlank(message = "Texto da versão é obrigatório")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String textoVersao;
    
    @NotBlank(message = "Editor é obrigatório")
    @Column(nullable = false, length = 100)
    private String editadoPor;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataEdicao;
    
    @Column(length = 500)
    private String motivoEdicao;
    
    @Column(columnDefinition = "TEXT")
    private String diffJson;
    
    @Column(nullable = false)
    private Integer numeroVersao = 1;

    public HistoricoEdicao() {
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

	public String getTextoVersao() {
		return textoVersao;
	}

	public void setTextoVersao(String textoVersao) {
		this.textoVersao = textoVersao;
	}

	public String getEditadoPor() {
		return editadoPor;
	}

	public void setEditadoPor(String editadoPor) {
		this.editadoPor = editadoPor;
	}

	public LocalDateTime getDataEdicao() {
		return dataEdicao;
	}

	public void setDataEdicao(LocalDateTime dataEdicao) {
		this.dataEdicao = dataEdicao;
	}

	public String getMotivoEdicao() {
		return motivoEdicao;
	}

	public void setMotivoEdicao(String motivoEdicao) {
		this.motivoEdicao = motivoEdicao;
	}

	public String getDiffJson() {
		return diffJson;
	}

	public void setDiffJson(String diffJson) {
		this.diffJson = diffJson;
	}

	public Integer getNumeroVersao() {
		return numeroVersao;
	}

	public void setNumeroVersao(Integer numeroVersao) {
		this.numeroVersao = numeroVersao;
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
		HistoricoEdicao other = (HistoricoEdicao) obj;
		return Objects.equals(id, other.id);
	}


    
    
}