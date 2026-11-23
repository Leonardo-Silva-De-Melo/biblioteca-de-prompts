package br.uerj.dgti.bibliotecaprompts.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "feedbacks_ia")
public class FeedbackIA implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String usuarioId;

    @Column(columnDefinition = "TEXT")
    private String promptUtilizado;

    @Column(columnDefinition = "TEXT")
    private String respostaIA;

    @Column(nullable = false)
    private Boolean foiUtil;

    private Integer minutosEconomizados;

    @Column(updatable = false)
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
    }

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
        FeedbackIA other = (FeedbackIA) obj;
        return Objects.equals(id, other.id);
    }
}
