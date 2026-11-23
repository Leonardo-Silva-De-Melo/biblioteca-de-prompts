package br.uerj.dgti.bibliotecaprompts.dto;

import java.time.LocalDateTime;

import java.util.List;

public class HistoricoUsoDTO {
    private Long id;
    private String usuario;
    private Long promptId;
    private String tituloPrompt;
    private String categoriaPrompt;
    private String textoPrompt;
    private String descricao;
    private List<String> tags;
    private LocalDateTime dataUso;

    public HistoricoUsoDTO() {}

    public HistoricoUsoDTO(br.uerj.dgti.bibliotecaprompts.model.HistoricoUso model) {
        this.id = model.getId();
        this.usuario = model.getUsuario();
        if (model.getPrompt() != null) {
            this.promptId = model.getPrompt().getId();
            this.tituloPrompt = model.getPrompt().getTitulo();
            this.categoriaPrompt = model.getPrompt().getCategoria();
            this.textoPrompt = model.getPrompt().getTextoPrompt();
            this.descricao = model.getPrompt().getDescricao();
            this.tags = model.getPrompt().getTags();
        }
        this.dataUso = model.getDataUso();
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

    public Long getPromptId() {
        return promptId;
    }

    public void setPromptId(Long promptId) {
        this.promptId = promptId;
    }

    public String getTituloPrompt() {
        return tituloPrompt;
    }

    public void setTituloPrompt(String tituloPrompt) {
        this.tituloPrompt = tituloPrompt;
    }

    public String getCategoriaPrompt() {
        return categoriaPrompt;
    }

    public void setCategoriaPrompt(String categoriaPrompt) {
        this.categoriaPrompt = categoriaPrompt;
    }

    public String getTextoPrompt() {
        return textoPrompt;
    }

    public void setTextoPrompt(String textoPrompt) {
        this.textoPrompt = textoPrompt;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public LocalDateTime getDataUso() {
        return dataUso;
    }

    public void setDataUso(LocalDateTime dataUso) {
        this.dataUso = dataUso;
    }
}
