package br.uerj.dgti.bibliotecaprompts.dto;

import java.time.LocalDateTime;

public class FeedbackIADTO {

    private Long id;
    private String usuarioId;
    private String promptUtilizado;
    private String respostaIA;
    private Boolean foiUtil;
    private Integer minutosEconomizados;
    private LocalDateTime dataCriacao;

    public FeedbackIADTO() {}

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getPromptUtilizado() {
        return promptUtilizado;
    }

    public void setPromptUtilizado(String promptUtilizado) {
        this.promptUtilizado = promptUtilizado;
    }

    public String getRespostaIA() {
        return respostaIA;
    }

    public void setRespostaIA(String respostaIA) {
        this.respostaIA = respostaIA;
    }

    public Boolean getFoiUtil() {
        return foiUtil;
    }

    public void setFoiUtil(Boolean foiUtil) {
        this.foiUtil = foiUtil;
    }

    public Integer getMinutosEconomizados() {
        return minutosEconomizados;
    }

    public void setMinutosEconomizados(Integer minutosEconomizados) {
        this.minutosEconomizados = minutosEconomizados;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
