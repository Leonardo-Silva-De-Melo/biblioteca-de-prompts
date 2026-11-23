package br.uerj.dgti.bibliotecaprompts.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 09/05/2025
 * Classe criada no SFS e copiada para o SAG para seguir o padrão de desenvolvimento
 */
public class RetornoFrontendListaDTO implements Serializable {
	private static final long serialVersionUID = 1L;

	private int status;
	private String mensagem;
	private List<Object> data = new ArrayList<>();

	public RetornoFrontendListaDTO() {
	}
			
	public RetornoFrontendListaDTO(int status, String mensagem, List<Object> data) {
		this.status = status;
		this.mensagem = mensagem;
		this.data = data;
	}

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

	public List<Object> getData() {
		return data;
	}

	public void setData(List<Object> data) {
		this.data = data;
	}

}
