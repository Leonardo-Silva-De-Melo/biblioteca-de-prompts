package br.uerj.dgti.bibliotecaprompts.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Entidade que registra o histórico de uso de prompts pelos usuários
 */
@Entity
@Table(name = "historico_uso")
public class HistoricoUso implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String usuario;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "prompt_id", nullable = false)
	private Prompt prompt;

	@Column(name = "data_uso", nullable = false)
	private LocalDateTime dataUso;

	// @Column(length = 500)
	// private String observacao; // Opcional: usuário pode adicionar nota

	public HistoricoUso() {
	}

	public HistoricoUso(Long id, String usuario, Prompt prompt, LocalDateTime dataUso) {
		this.id = id;
		this.usuario = usuario;
		this.prompt = prompt;
		this.dataUso = dataUso;

	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsuario() {
		return usuario;
	}

	public void setUsuario(String usuario) {
		this.usuario = usuario;
	}

	public Prompt getPrompt() {
		return prompt;
	}

	public void setPrompt(Prompt prompt) {
		this.prompt = prompt;
	}

	public LocalDateTime getDataUso() {
		return dataUso;
	}

	public void setDataUso(LocalDateTime dataUso) {
		this.dataUso = dataUso;
	}

	@PrePersist
	protected void onCreate() {
		if (dataUso == null) {
			dataUso = LocalDateTime.now();
		}
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
		HistoricoUso other = (HistoricoUso) obj;
		return Objects.equals(id, other.id);
	}

}