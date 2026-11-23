package br.uerj.dgti.bibliotecaprompts.exception.exceptionhandler;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import br.uerj.dgti.bibliotecaprompts.exception.RegistroJaExistenteException;
import br.uerj.dgti.bibliotecaprompts.exception.RegistroNaoEncontradoException;
import br.uerj.dgti.bibliotecaprompts.exception.RegraDeNegocioException;
import br.uerj.dgti.bibliotecaprompts.exception.ValidacaoCamposException;
import br.uerj.dgti.bibliotecaprompts.exception.ValidacaoTokenException;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import br.uerj.dgti.bibliotecaprompts.util.UtilRespostaGenerico;

/**
 * * - 03/07/2025 - Classe responsável por interceptar todas as exceptions da
 * aplicação Classe criada no SFS e copiada para o SAG para seguir o padrão de
 * desenvolvimento
 * 
 * @author Leonardo Melo
 */
@ControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

	@Autowired
	private UtilRespostaGenerico util;

	@Autowired
	private Util msg;

	@ExceptionHandler(RegistroNaoEncontradoException.class)
	public ResponseEntity<?> registroNaoEncontrado(RegistroNaoEncontradoException e) {
		return util.exceptionPadraoFrontend_404(e.getMessage());
	}

	@ExceptionHandler(ValidacaoCamposException.class)
	public ResponseEntity<?> validacaoCampos(ValidacaoCamposException e) {
		return util.exceptionPadraoFrontend_400(e.getMessage());
	}

	@ExceptionHandler(ValidacaoTokenException.class)
	public ResponseEntity<?> validacaoToken(ValidacaoTokenException e) {
		return util.exceptionPadraoFrontend_400(e.getMessage());
	}

	@ExceptionHandler(RegistroJaExistenteException.class)
	public ResponseEntity<?> validacaoCampos(RegistroJaExistenteException e) {
		return util.exceptionPadraoFrontend_400(e.getMessage());
	}

	/**
	 * - 29/07/2025 - Para capturar as exceções lançadas pelos validadores
	 * 
	 * @author Leonardo Melo
	 */
	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {

		// 1. Mapeia todos os erros de campo para uma lista de strings
		List<String> listaErros = ex.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(err -> err.getDefaultMessage())
				.toList();

		// 2. Concatena os erros em uma única string, separados por quebra de linha ou
		// vírgula
		// Usamos "\n" (quebra de linha) ou "; " (ponto e vírgula e espaço) para melhor
		// leitura
		String mensagemErros = String.join("; ", listaErros);

		// 2. Chama o utilitário
		ResponseEntity<?> responseUtil = util.exceptionPadraoFrontend_400(mensagemErros);

		// 3. CORREÇÃO: Faz o Cast explícito para (ResponseEntity<Object>)
		// Isso satisfaz a assinatura do método pai do Spring
		@SuppressWarnings("unchecked")
		ResponseEntity<Object> responseFinal = (ResponseEntity<Object>) responseUtil;

		return responseFinal;
	}

	/**
	 * - NOVO HANDLER ADICIONADO. - Trata exceções de violação de
	 * regras de negócio.
	 * 
	 * 
	 */
	@ExceptionHandler(RegraDeNegocioException.class)
	public ResponseEntity<?> regraDeNegocio(RegraDeNegocioException e) {
		return util.exceptionPadraoFrontend_400(e.getMessage());
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<?> dataIntegrityViolationException(DataIntegrityViolationException e) {
		return util.exceptionPadraoFrontend_409(e.getMessage());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleException(Exception e) {
		String erro = e.getMessage();
		if (erro != null && erro.contains("is null")) { // Verificação de nulo adicionada para segurança
			erro = msg.getMsg("msg.erro.acesso.valor.nulo");
		}
		return util.exceptionPadraoFrontend_500(erro);
	}
}