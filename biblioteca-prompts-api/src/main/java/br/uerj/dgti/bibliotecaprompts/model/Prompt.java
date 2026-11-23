package br.uerj.dgti.bibliotecaprompts.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "prompts", indexes = {
	    @Index(name = "idx_prompt_categoria", columnList = "categoria"),
	    @Index(name = "idx_prompt_autor", columnList = "autor")
	})
public class Prompt implements Serializable {
    
	private static final long serialVersionUID = 1L;
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @NotBlank(message = "Categoria é obrigatória")
    @Column(nullable = false, length = 50)
    private String categoria;
    
    @Column(length = 500)
    private String descricao;
    
    @NotBlank(message = "Texto do prompt é obrigatório")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String textoPrompt;
    
    @NotBlank(message = "Autor é obrigatório")
    @Column(nullable = false, length = 100)
    private String autor;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime dataAtualizacao;
    
    @Column(nullable = false)
    private Integer vezesUsado = 0;
    
    @ElementCollection
    @CollectionTable(name = "prompt_tags", joinColumns = @JoinColumn(name = "prompt_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    @OneToMany(mappedBy = "prompt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistoricoEdicao> historico = new ArrayList<>();
    
    @OneToMany(mappedBy = "prompt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comentario> comentarios = new ArrayList<>();
    
    @OneToMany(mappedBy = "prompt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PromptVisualizacao> visualizacoes = new ArrayList<>();
    
 // Isso garante que se o prompt for deletado, as avaliações (estrelas) dele também serão apagadas.
    @OneToMany(mappedBy = "prompt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feedback> feedbacks = new ArrayList<>();
    
    @Column(nullable = false)
    private Double mediaAvaliacao = 0.0;
    
    @Column(nullable = false)
    private Integer totalAvaliacoes = 0;
    
    public Prompt() {
    }
     
    public List<PromptVisualizacao> getVisualizacoes() {
		return visualizacoes;
	}
    
	public void setVisualizacoes(List<PromptVisualizacao> visualizacoes) {
		this.visualizacoes = visualizacoes;
	}
	public Double getMediaAvaliacao() {
		return mediaAvaliacao;
	}


	public void setMediaAvaliacao(Double mediaAvaliacao) {
		this.mediaAvaliacao = mediaAvaliacao;
	}

	public Integer getTotalAvaliacoes() {
		return totalAvaliacoes;
	}

	public void setTotalAvaliacoes(Integer totalAvaliacoes) {
		this.totalAvaliacoes = totalAvaliacoes;
	}

	public Long getId() { return id; }
	
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getCategoria() { return categoria; }
    
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getDescricao() { return descricao; }
    
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getTextoPrompt() { return textoPrompt; }
    
    public void setTextoPrompt(String textoPrompt) { this.textoPrompt = textoPrompt; }

    public String getAutor() { return autor; }
    
    public void setAutor(String autor) { this.autor = autor; }

    public List<String> getTags() { return tags; }
    
    public void setTags(List<String> tags) { this.tags = tags; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    
    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }

    public Integer getVezesUsado() { return vezesUsado; }
    
    public void setVezesUsado(Integer vezesUsado) { this.vezesUsado = vezesUsado; }

    
    
    // --- Métodos de Negócio ---

    public List<HistoricoEdicao> getHistorico() {
		return historico;
	}

	public void setHistorico(List<HistoricoEdicao> historico) {
		this.historico = historico;
	}

	public List<Comentario> getComentarios() {
		return comentarios;
	}

	public void setComentarios(List<Comentario> comentarios) {
		this.comentarios = comentarios;
	}

	public List<Feedback> getFeedbacks() {
		return feedbacks;
	}

	public void setFeedbacks(List<Feedback> feedbacks) {
		this.feedbacks = feedbacks;
	}

	public void setDataCriacao(LocalDateTime dataCriacao) {
		this.dataCriacao = dataCriacao;
	}

	public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
		this.dataAtualizacao = dataAtualizacao;
	}

	public void incrementarUso() {
        if (this.vezesUsado == null) this.vezesUsado = 0;
        this.vezesUsado++;
    }
    
	// Normaliza a categoria antes da persistencia
    public void atualizarEstatisticasAvaliacao() {
        if (this.feedbacks == null || this.feedbacks.isEmpty()) {
            this.mediaAvaliacao = 0.0;
            this.totalAvaliacoes = 0;
            return;
        }
        this.totalAvaliacoes = this.feedbacks.size();
        double soma = this.feedbacks.stream().mapToDouble(Feedback::getNota).sum();
        this.mediaAvaliacao = soma / this.totalAvaliacoes;
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
		Prompt other = (Prompt) obj;
		return Objects.equals(id, other.id);
	}
    
}