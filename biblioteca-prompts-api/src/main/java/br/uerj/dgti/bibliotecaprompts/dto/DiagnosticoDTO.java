package br.uerj.dgti.bibliotecaprompts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class DiagnosticoDTO {

    private Long id;
    
    @NotBlank(message = "ID do usuário é obrigatório")
    private String usuarioId;
    
    @NotBlank(message = "O papel do usuário é obrigatório")
    private String papel;
    
    @NotNull(message = "As tecnologias principais são obrigatórias")
    private List<String> tecnologiasPrincipais;
    
    private String etapaMaisDemorada;
    private String principalCausaAtraso;
    private Integer horasPerdidasSemana;
    private Integer notaDocumentacaoSistemas;
    private List<String> motivoComumBugs;
    private String nivelExperienciaIA;
    private List<String> tarefasParaDelegarIA;
    private String comentarioLivre;
    
    // Novos campos
    private Integer satisfacaoFerramentas;
    private String focoTrabalho;
    private String metodoRevisao;
    private String coberturaTestes;
    private String usaIaPorContaPropria;
    private String maiorPreocupacaoIa;
    
    private LocalDateTime dataCriacao;

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

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
