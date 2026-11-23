package br.uerj.dgti.bibliotecaprompts.exception;

public class RegistroJaExistenteException extends RuntimeException {
	private static final long serialVersionUID = 1L;

	public RegistroJaExistenteException(String msg) {
		super(msg);
	}
}
