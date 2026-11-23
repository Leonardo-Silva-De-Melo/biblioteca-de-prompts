package br.uerj.dgti.bibliotecaprompts.dto;

import java.io.Serializable;

/**
 * - Classe criada para atender ao retorno do 'buscarPorId' <br>
 * - Retorna apenas um objeto puro ao invés de retornar um objeto dentro de um
 * array
 * 
 * 
 */
public class RetornoPadraoFrontendObjetoDTO implements Serializable {
	private static final long serialVersionUID = 1L;

	private int status;
	private String mensagem;
	Object data = new Object();

	public RetornoPadraoFrontendObjetoDTO() {
	}

	public RetornoPadraoFrontendObjetoDTO(int status, String mensagem, Object data) {
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

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

}
