package br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO;

import java.time.LocalDateTime;

public class HistoricoEdicaoDTO {
    private Long id;
    private String textoVersao;
    private String editadoPor;
    private LocalDateTime dataEdicao;
    private String motivoEdicao;
    private String diffJson;
    private Integer numeroVersao;

    public HistoricoEdicaoDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
