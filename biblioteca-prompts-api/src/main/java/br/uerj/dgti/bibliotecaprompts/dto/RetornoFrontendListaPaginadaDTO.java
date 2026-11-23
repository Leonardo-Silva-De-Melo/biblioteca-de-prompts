package br.uerj.dgti.bibliotecaprompts.dto;

import java.util.List;

public class RetornoFrontendListaPaginadaDTO<T> {

	 private int status;
	    private String mensagem;
	    private List<T> data;
	    private PaginacaoInfoDTO paginacao;
	    
	 public int getStatus() {
	  return status;
	 }
	 public void setStatus(int status) {
	  this.status = status;
	 }
	 public String getMensagem() {
	  return mensagem;
	 }
	 public void setMensagem(String mensagem) {
	  this.mensagem = mensagem;
	 }
	 public List<T> getData() {
	  return data;
	 }
	 public void setData(List<T> data) {
	  this.data = data;
	 }
	 public PaginacaoInfoDTO getPaginacao() {
	  return paginacao;
	 }
	 public void setPaginacao(PaginacaoInfoDTO paginacao) {
	  this.paginacao = paginacao;
	 }

	}
