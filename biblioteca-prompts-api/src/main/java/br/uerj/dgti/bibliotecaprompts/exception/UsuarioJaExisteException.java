package br.uerj.dgti.bibliotecaprompts.exception;

/**
 *
 * Exceção lançada quando se tenta cadastar um usuario
 * que já existe no banco de dados (ex.: com o mesmo login).
 * 
 */
public class UsuarioJaExisteException extends RuntimeException {
	private static final long serialVersionUID = 1L;

	public UsuarioJaExisteException(String msg) {
		super(msg);
	}
}
