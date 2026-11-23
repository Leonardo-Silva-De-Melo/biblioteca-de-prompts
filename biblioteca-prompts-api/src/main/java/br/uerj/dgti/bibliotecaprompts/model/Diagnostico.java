package br.uerj.dgti.bibliotecaprompts.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "diagnosticos")
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bloco 1: Perfil e Escopo
    @Column(nullable = false)
    private String usuarioId; // Sub do Keycloak ou e-mail

    @Column(nullable = false)
    private String papel; // Desenvolvedor, Analista, etc.

    @ElementCollection
    @CollectionTable(name = "diagnostico_tecnologias", joinColumns = @JoinColumn(name = "diagnostico_id"))
    @Column(name = "tecnologia")
    private List<String> tecnologiasPrincipais;

    // Bloco 2: Fluxos e Prazos
    private String etapaMaisDemorada;
    private String principalCausaAtraso;
    private Integer horasPerdidasSemana;

    // Bloco 3: Qualidade do Código e Gargalos
    private Integer notaDocumentacaoSistemas;

    @ElementCollection
    @CollectionTable(name = "diagnostico_motivo_bugs", joinColumns = @JoinColumn(name = "diagnostico_id"))
    @Column(name = "motivo")
    private List<String> motivoComumBugs;

    // Bloco 4: Maturidade e Adoção de IA
    private String nivelExperienciaIA;

    @ElementCollection
    @CollectionTable(name = "diagnostico_tarefas_ia", joinColumns = @JoinColumn(name = "diagnostico_id"))
    @Column(name = "tarefa")
    private List<String> tarefasParaDelegarIA;

    @Column(name = "comentario_livre", columnDefinition = "TEXT")
    private String comentarioLivre;

    // --- NOVOS CAMPOS (WIZARD) ---
    @Column(name = "satisfacao_ferramentas")
    private Integer satisfacaoFerramentas;

    @Column(name = "foco_trabalho")
    private String focoTrabalho;

    @Column(name = "metodo_revisao")
    private String metodoRevisao;

    @Column(name = "cobertura_testes")
    private String coberturaTestes;

    @Column(name = "usa_ia_por_conta_propria")
    private String usaIaPorContaPropria;

    @Column(name = "maior_preocupacao_ia")
    private String maiorPreocupacaoIa;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
    }

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

    public String getPapel() {
        return papel;
    }

    public void setPapel(String papel) {
        this.papel = papel;
    }

    public List<String> getTecnologiasPrincipais() {
        return tecnologiasPrincipais;
    }

    public void setTecnologiasPrincipais(List<String> tecnologiasPrincipais) {
        this.tecnologiasPrincipais = tecnologiasPrincipais;
    }

    public String getEtapaMaisDemorada() {
        return etapaMaisDemorada;
    }

    public void setEtapaMaisDemorada(String etapaMaisDemorada) {
        this.etapaMaisDemorada = etapaMaisDemorada;
    }

    public String getPrincipalCausaAtraso() {
        return principalCausaAtraso;
    }

    public void setPrincipalCausaAtraso(String principalCausaAtraso) {
        this.principalCausaAtraso = principalCausaAtraso;
    }

    public Integer getHorasPerdidasSemana() {
        return horasPerdidasSemana;
    }

    public void setHorasPerdidasSemana(Integer horasPerdidasSemana) {
        this.horasPerdidasSemana = horasPerdidasSemana;
    }

    public Integer getNotaDocumentacaoSistemas() {
        return notaDocumentacaoSistemas;
    }

    public void setNotaDocumentacaoSistemas(Integer notaDocumentacaoSistemas) {
        this.notaDocumentacaoSistemas = notaDocumentacaoSistemas;
    }

    public List<String> getMotivoComumBugs() {
        return motivoComumBugs;
    }

    public void setMotivoComumBugs(List<String> motivoComumBugs) {
        this.motivoComumBugs = motivoComumBugs;
    }

    public String getNivelExperienciaIA() {
        return nivelExperienciaIA;
    }

    public void setNivelExperienciaIA(String nivelExperienciaIA) {
        this.nivelExperienciaIA = nivelExperienciaIA;
    }

    public List<String> getTarefasParaDelegarIA() {
        return tarefasParaDelegarIA;
    }

    public void setTarefasParaDelegarIA(List<String> tarefasParaDelegarIA) {
        this.tarefasParaDelegarIA = tarefasParaDelegarIA;
    }

    public String getComentarioLivre() {
        return comentarioLivre;
    }

    public void setComentarioLivre(String comentarioLivre) {
        this.comentarioLivre = comentarioLivre;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public Integer getSatisfacaoFerramentas() {
        return satisfacaoFerramentas;
    }

    public void setSatisfacaoFerramentas(Integer satisfacaoFerramentas) {
        this.satisfacaoFerramentas = satisfacaoFerramentas;
    }

    public String getFocoTrabalho() {
        return focoTrabalho;
    }

    public void setFocoTrabalho(String focoTrabalho) {
        this.focoTrabalho = focoTrabalho;
    }

    public String getMetodoRevisao() {
        return metodoRevisao;
    }

    public void setMetodoRevisao(String metodoRevisao) {
        this.metodoRevisao = metodoRevisao;
    }

    public String getCoberturaTestes() {
        return coberturaTestes;
    }

    public void setCoberturaTestes(String coberturaTestes) {
        this.coberturaTestes = coberturaTestes;
    }

    public String getUsaIaPorContaPropria() {
        return usaIaPorContaPropria;
    }

    public void setUsaIaPorContaPropria(String usaIaPorContaPropria) {
        this.usaIaPorContaPropria = usaIaPorContaPropria;
    }

    public String getMaiorPreocupacaoIa() {
        return maiorPreocupacaoIa;
    }

    public void setMaiorPreocupacaoIa(String maiorPreocupacaoIa) {
        this.maiorPreocupacaoIa = maiorPreocupacaoIa;
    }
}
