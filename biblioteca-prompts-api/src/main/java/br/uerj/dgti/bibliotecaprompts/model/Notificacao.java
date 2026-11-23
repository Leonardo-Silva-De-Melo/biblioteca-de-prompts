package br.uerj.dgti.bibliotecaprompts.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidade que representa notificações do sistema
 */
@Entity
@Table(name = "notificacoes")
public class Notificacao implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String usuario;

    @Column(nullable = false, length = 50)
    private String tipo; // NOVO_PROMPT, PROMPT_EDITADO, COMENTARIO, RESPOSTA, AVALIACAO

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(length = 500)
    private String mensagem;

    @Column(name = "prompt_id")
    private Long promptId;

    @Column(name = "link_acao", length = 300)
    private String linkAcao;

    @Column(nullable = false)
    private Boolean lida = false;

    @Column(name = "criada_em", nullable = false)
    private LocalDateTime criadaEm;

    @Column(name = "lida_em")
    private LocalDateTime lidaEm;

    // Construtores
    public Notificacao() {
        this.criadaEm = LocalDateTime.now();
        this.lida = false;
    }

    public Notificacao(String usuario, String tipo, String titulo, String mensagem, Long promptId) {
        this();
        this.usuario = usuario;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.promptId = promptId;
    }

    // Getters e Setters
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
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

    public Long getPromptId() {
        return promptId;
    }

    public void setPromptId(Long promptId) {
        this.promptId = promptId;
    }

    public String getLinkAcao() {
        return linkAcao;
    }

    public void setLinkAcao(String linkAcao) {
        this.linkAcao = linkAcao;
    }

    public Boolean getLida() {
        return lida;
    }

    public void setLida(Boolean lida) {
        this.lida = lida;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public void setCriadaEm(LocalDateTime criadaEm) {
        this.criadaEm = criadaEm;
    }

    public LocalDateTime getLidaEm() {
        return lidaEm;
    }

    public void setLidaEm(LocalDateTime lidaEm) {
        this.lidaEm = lidaEm;
    }

    // Métodos auxiliares
    public void marcarComoLida() {
        this.lida = true;
        this.lidaEm = LocalDateTime.now();
    }

    public boolean isRecente() {
        return criadaEm.isAfter(LocalDateTime.now().minusDays(7));
    }

    // equals, hashCode e toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Notificacao that = (Notificacao) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Notificacao{" +
                "id=" + id +
                ", usuario='" + usuario + '\'' +
                ", tipo='" + tipo + '\'' +
                ", titulo='" + titulo + '\'' +
                ", lida=" + lida +
                ", criadaEm=" + criadaEm +
                '}';
    }
}