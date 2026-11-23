package br.uerj.dgti.bibliotecaprompts.exception;

/**
 * 
 * Erro de acesso a dados
 * 
 */
public class DAOException extends RuntimeException {
	private static final long serialVersionUID = 1L;

	/**
	 * Erro interno do sistema
	 * 
	 * @param message Mensagem
	 * @param cause   Erro original
	 */
	public DAOException(String message, Throwable cause) {
		super(message, cause);
	}

	/**
	 * Erro interno do sistema
	 * 
	 * @param message Mensagem do erro
	 */
	public DAOException(String message) {
		super(message);
	}

	/**
	 * Erro interno do sistema
	 * 
	 * @param cause Erro original
	 */
	public DAOException(Throwable cause) {
		super(cause);
	}

}
