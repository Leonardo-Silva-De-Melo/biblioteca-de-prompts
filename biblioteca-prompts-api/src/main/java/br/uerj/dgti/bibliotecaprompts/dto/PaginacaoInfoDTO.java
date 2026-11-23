package br.uerj.dgti.bibliotecaprompts.dto;

public class PaginacaoInfoDTO {
	 
	 private long totalElementos;
	    private int totalPaginas;
	    private int paginaAtual;
	    private int tamanhoPagina;
	    private boolean primeiraPagina;
	    private boolean ultimaPagina;
	    
	 public long getTotalElementos() {
	  return totalElementos;
	 }
	 public void setTotalElementos(long totalElementos) {
	  this.totalElementos = totalElementos;
	 }
	 public int getTotalPaginas() {
	  return totalPaginas;
	 }
	 public void setTotalPaginas(int totalPaginas) {
	  this.totalPaginas = totalPaginas;
	 }
	 public int getPaginaAtual() {
	  return paginaAtual;
	 }
	 public void setPaginaAtual(int paginaAtual) {
	  this.paginaAtual = paginaAtual;
	 }
	 public int getTamanhoPagina() {
	  return tamanhoPagina;
	 }
	 public void setTamanhoPagina(int tamanhoPagina) {
	  this.tamanhoPagina = tamanhoPagina;
	 }
	 public boolean isPrimeiraPagina() {
	  return primeiraPagina;
	 }
	 public void setPrimeiraPagina(boolean primeiraPagina) {
	  this.primeiraPagina = primeiraPagina;
	 }
	 public boolean isUltimaPagina() {
	  return ultimaPagina;
	 }
	 public void setUltimaPagina(boolean ultimaPagina) {
	  this.ultimaPagina = ultimaPagina;
	 }
	    
	    
	    
	}
