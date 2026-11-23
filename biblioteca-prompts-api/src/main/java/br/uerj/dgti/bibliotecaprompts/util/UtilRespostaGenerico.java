package br.uerj.dgti.bibliotecaprompts.util;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;

/**
 * - 13/03/2025 - Classe usada para reduzir código na classe Controller, pois, <br>
 *   devido ao retorno customizado no cabeçalho, as classes do tipo controller ficaram com muito código
 * @author Leonardo Melo
 * 
 * Classe copiada do SFS para ser reutilizada no SAG.
 */
@Component
public class UtilRespostaGenerico {
	
	@Autowired
	private Util util;
	
	/** - Método genérico - Retorno com objeto <br>
	 */
	public <T> ResponseEntity<?> retornoObjetoCorpo(T dto,String msg,String detalhes,HttpStatus httpStatus,String status) {
		// Substitui caracteres especiais para o header (que deve ser ASCII para o Tomcat não estourar 500)
		String headerMsg = java.text.Normalizer.normalize(msg, java.text.Normalizer.Form.NFD)
				.replaceAll("[^\\p{ASCII}]", "");

		return ResponseEntity.status(httpStatus)
							 .contentType(MediaType.APPLICATION_JSON)
							 .header("status", status)
							 .header("httpStatus", httpStatus.toString())
							 .header("mensagem", headerMsg)
							 .header("detalhes", detalhes)
							 .header("tipoConteudo", "json")
							 .body(dto);
	}
	
	/** - Método genérico - Retorno sem objeto <br>
	 */
	public ResponseEntity<?> retornoSemObjetoCorpo(String msg,String detalhes, HttpStatus httpStatus,String status) {
		return ResponseEntity.status(httpStatus)
							 .contentType(MediaType.APPLICATION_JSON)
							 .header("status", status)
							 .header("httpStatus", httpStatus.toString())
							 .header("mensagem", msg)
							 .header("detalhes", detalhes)
							 .header("tipoConteudo", "json")
							 .body(null);
	}
	
	public <T> ResponseEntity<?> retornoListarPaginado(T dto, String msg, String detalhes, HttpStatus httpStatus, String status) {
		  return ResponseEntity.status(httpStatus)
		        .contentType(MediaType.APPLICATION_JSON)
		        .header("status", status)
		        .header("httpStatus", httpStatus.toString())
		        .header("mensagem", msg)
		        .header("detalhes", detalhes)
		        .header("tipoConteudo", "json")
		        .body(dto);
		 } 
	
	
			//##############   Os métodos abaixo usarão os métodos genéricos acima   ##############
	
	
	/** - 09/05/2025 - Padrão Frontend - Listar todos
	 */
	public ResponseEntity<?> retornarListarTodosPadraoFrontend(RetornoFrontendListaDTO dto){
		int tam = dto.getData().size();
		return retornoObjetoCorpo(dto,util.getMsg("msg.sucesso.lista"),msgRegRetornado(tam), HttpStatus.OK,"sucesso");
	}


	/** - 09/05/2025 - Retorno no padrão usado pelo frontend - 404 - NOT_FOUND
	 */
	public <T> ResponseEntity<?> exceptionPadraoFrontend_404(T e) {
		RetornoFrontendListaDTO dto = new RetornoFrontendListaDTO(404,(String)e, new ArrayList<>());
		return retornoObjetoCorpo(dto,(String)e,"", HttpStatus.NOT_FOUND, "404");
	}
	
	
	/** - 09/05/2025 - Retorno no padrão usado pelo frontend - 400 - Bad Request
	 */
	public <T> ResponseEntity<?> exceptionPadraoFrontend_400(T msg) {
		RetornoFrontendListaDTO dto = new RetornoFrontendListaDTO(400,(String)msg, new ArrayList<>());
		return retornoObjetoCorpo(dto, (String)msg,"", HttpStatus.BAD_REQUEST, "400");
	}
	
	
	/** - 09/05/2025 - Retorno no padrão usado pelo frontend - 500 - ERROR
	 */
	public <T> ResponseEntity<?> exceptionPadraoFrontend_500(T msg) {
		RetornoFrontendListaDTO dto = new RetornoFrontendListaDTO(500, (String) msg, new ArrayList<>());
		return retornoObjetoCorpo(dto, (String) msg, "", HttpStatus.INTERNAL_SERVER_ERROR, "500");
	}
	
	
	/** - 13/05/2025 - Retorno no padrão usado pelo frontend - 409 - Conflict
	 */
	public <T> ResponseEntity<?> exceptionPadraoFrontend_409(T e) {
		RetornoFrontendListaDTO dto = null;
		String msg = (String)e;
		if(msg.contains("duplicate key value violates unique constraint")) {
			msg = util.getMsg("msg.validacao.violacao.fk");
			dto = new RetornoFrontendListaDTO(409, msg, new ArrayList<>());
			return retornoObjetoCorpo(dto,msg,"",HttpStatus.CONFLICT, "409");
		}else {
			dto = new RetornoFrontendListaDTO(409, ((String) e) , new ArrayList<>());
			return retornoObjetoCorpo(dto,util.violacaoFK(),util.chaveDuplicada(), HttpStatus.CONFLICT, "409");
		}
		
	}
	
	
	/** - 07/07/2025
	 */
	public String msgRegRetornado(int tam) {
		String msg = tam + ((tam>1) ? " registros retornados":" registro retornado");
		return msg;
	}
	
	
}
