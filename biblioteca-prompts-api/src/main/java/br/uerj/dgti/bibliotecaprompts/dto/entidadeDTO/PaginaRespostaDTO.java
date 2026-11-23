package br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO;

import java.util.List;

import br.uerj.dgti.bibliotecaprompts.dto.PaginacaoInfoDTO;

public class PaginaRespostaDTO<T> {
    
    private List<T> conteudo;
    private PaginacaoInfoDTO paginacao;

    public PaginaRespostaDTO() {}

    public PaginaRespostaDTO(List<T> conteudo, PaginacaoInfoDTO paginacao) {
        this.conteudo = conteudo;
        this.paginacao = paginacao;
    }

    public List<T> getConteudo() { return conteudo; }
    public void setConteudo(List<T> conteudo) { this.conteudo = conteudo; }

    public PaginacaoInfoDTO getPaginacao() { return paginacao; }
    public void setPaginacao(PaginacaoInfoDTO paginacao) { this.paginacao = paginacao; }
}