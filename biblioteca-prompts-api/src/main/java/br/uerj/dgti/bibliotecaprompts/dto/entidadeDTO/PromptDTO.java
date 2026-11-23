package br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public class PromptDTO {
    
    // --- CAMPOS DE ENTRADA (Cadastro/Edição) ---
    @NotBlank(message = "Título é obrigatório")
    private String titulo;
    
    @NotBlank(message = "Categoria é obrigatória")
    private String categoria;
    
    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    private String descricao;
    
    @NotBlank(message = "Texto do prompt é obrigatório")
    private String textoPrompt;
    
    private String autor; 
    private String editadoPor;
    private String motivoEdicao;
    private List<String> tags;

    // --- NOVOS CAMPOS DE SAÍDA (Visualização/Dashboard) ---
    private Long id;
    private Integer vezesUsado;
    private LocalDateTime dataCriacao;
    private Double mediaAvaliacao; // Necessário para as estrelas
    private Long totalAvaliacoes; // Necessário para o contador (ex: 5 avaliações)

    // --- CONSTRUTOR PADRÃO ---
    public PromptDTO() {}

    // --- GETTERS E SETTERS MANUAIS (Campos originais) ---
    
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

    public String getEditadoPor() { return editadoPor; }
    public void setEditadoPor(String editadoPor) { this.editadoPor = editadoPor; }

    public String getMotivoEdicao() { return motivoEdicao; }
    public void setMotivoEdicao(String motivoEdicao) { this.motivoEdicao = motivoEdicao; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    // --- NOVOS GETTERS E SETTERS (Campos de saída) ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getVezesUsado() { return vezesUsado; }
    public void setVezesUsado(Integer vezesUsado) { this.vezesUsado = vezesUsado; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public Double getMediaAvaliacao() { return mediaAvaliacao; }
    public void setMediaAvaliacao(Double mediaAvaliacao) { this.mediaAvaliacao = mediaAvaliacao; }

    public Long getTotalAvaliacoes() { return totalAvaliacoes; }
    public void setTotalAvaliacoes(Long totalAvaliacoes) { this.totalAvaliacoes = totalAvaliacoes; }
}