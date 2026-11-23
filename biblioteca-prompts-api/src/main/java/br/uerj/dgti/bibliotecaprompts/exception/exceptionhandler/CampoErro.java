package br.uerj.dgti.bibliotecaprompts.exception.exceptionhandler;

import lombok.Builder;

@Builder
public class CampoErro {

	// private LocalDateTime dataHora;
	private String campo;
	private String mensagem;

	public CampoErro(String campo, String mensagem) {
		this.campo = campo;
		this.mensagem = mensagem;
	}

	public String getCampo() {
		return campo;
	}

	public String getMensagem() {
		return mensagem;
	}

}

