package br.uerj.dgti.bibliotecaprompts.dto;

import java.time.LocalDateTime;

public class NotificacaoDTO {

    private Long id;
    private String usuario;
    private String titulo;
    private String mensagem;
    private String tipo;
    private String linkAcao;
    private boolean lida;
    private LocalDateTime dataCriacao;

    public NotificacaoDTO() {}

    public NotificacaoDTO(br.uerj.dgti.bibliotecaprompts.model.Notificacao model) {
        this.id = model.getId();
        this.usuario = model.getUsuario();
        this.titulo = model.getTitulo();
        this.mensagem = model.getMensagem();
        this.tipo = model.getTipo();
        this.linkAcao = model.getLinkAcao();
        this.lida = model.getLida() != null ? model.getLida() : false;
        this.dataCriacao = model.getCriadaEm();
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

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getLinkAcao() {
        return linkAcao;
    }

    public void setLinkAcao(String linkAcao) {
        this.linkAcao = linkAcao;
    }

    public boolean isLida() {
        return lida;
    }

    public void setLida(boolean lida) {
        this.lida = lida;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
