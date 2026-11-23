package br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO;

import java.time.LocalDateTime;

public class FeedbackDTO {
    
    private Long id;
    private Integer nota;
    private String comentario;
    private String usuario;
    private LocalDateTime dataCriacao;
    private Long promptId; // Apenas o ID, para evitar recursão
    
    public FeedbackDTO(Long id, Integer nota, String comentario, String usuario, LocalDateTime dataCriacao,
			Long promptId) {
		super();
		this.id = id;
		this.nota = nota;
		this.comentario = comentario;
		this.usuario = usuario;
		this.dataCriacao = dataCriacao;
		this.promptId = promptId;
	}

	public FeedbackDTO() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public Long getPromptId() { return promptId; }
    public void setPromptId(Long promptId) { this.promptId = promptId; }
}