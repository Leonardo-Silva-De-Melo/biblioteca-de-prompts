package br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO;

import java.util.List;
import java.util.Map;


public class EstatisticasDTO {
    
	private Long totalPrompts;
   
	private Long totalUsosSemana;
   
    private Long contribuidoresAtivos;
   
    private String mediaSatisfacao; // String para bater com o String.format do Service
    
    private Long totalVisualizacoesReais; //  O NOME QUE O REACT PROCURA
    
    private Map<String, Long> usoPorCategoria; // O NOME QUE O REACT PROCURA
    
    private Map<String, Long> distribuicaoNotas;
	
    private List<Map<String, String>> ultimasAtividades;
    
    public EstatisticasDTO() {
		
	}

	public List<Map<String, String>> getUltimasAtividades() {
		return ultimasAtividades;
	}

	public void setUltimasAtividades(List<Map<String, String>> ultimasAtividades) {
		this.ultimasAtividades = ultimasAtividades;
	}

	public Long getTotalPrompts() {
		return totalPrompts;
	}

	public void setTotalPrompts(Long totalPrompts) {
		this.totalPrompts = totalPrompts;
	}

	public Long getTotalUsosSemana() {
		return totalUsosSemana;
	}

	public void setTotalUsosSemana(Long totalUsosSemana) {
		this.totalUsosSemana = totalUsosSemana;
	}

	public Long getContribuidoresAtivos() {
		return contribuidoresAtivos;
	}

	public void setContribuidoresAtivos(Long contribuidoresAtivos) {
		this.contribuidoresAtivos = contribuidoresAtivos;
	}

	public String getMediaSatisfacao() {
		return mediaSatisfacao;
	}

	public void setMediaSatisfacao(String mediaSatisfacao) {
		this.mediaSatisfacao = mediaSatisfacao;
	}

	public Long getTotalVisualizacoesReais() {
		return totalVisualizacoesReais;
	}

	public void setTotalVisualizacoesReais(Long totalVisualizacoesReais) {
		this.totalVisualizacoesReais = totalVisualizacoesReais;
	}

	public Map<String, Long> getUsoPorCategoria() {
		return usoPorCategoria;
	}

	public void setUsoPorCategoria(Map<String, Long> usoPorCategoria) {
		this.usoPorCategoria = usoPorCategoria;
	}

	public Map<String, Long> getDistribuicaoNotas() {
		return distribuicaoNotas;
	}

	public void setDistribuicaoNotas(Map<String, Long> distribuicaoNotas) {
		this.distribuicaoNotas = distribuicaoNotas;
	}

	
    
    
    
}