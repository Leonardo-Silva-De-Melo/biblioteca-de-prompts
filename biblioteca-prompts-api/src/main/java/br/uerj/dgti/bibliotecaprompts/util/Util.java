package br.uerj.dgti.bibliotecaprompts.util;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import br.uerj.dgti.bibliotecaprompts.dto.PaginacaoInfoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoFrontendListaPaginadaDTO;
import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.PaginaRespostaDTO;

@Component
public class Util {

	public String operRealizadaComSucesso() {
		return getMsg("msg.operacao.sucesso");
	}

	public String nenhumRegistroLocalizado() {
		return getMsg("msg.registros.nenhum");
	}

	public String registroNaoEncontrado() {
		return getMsg("registro.naoEncontrado");
	}

	public String registrojaExiste() {
		return getMsg("registro.ja.existe");
	}

	public String cadastroSucesso() {
		return getMsg("sucesso.cadastro");
	}

	public String alteradoSucesso() {
		return getMsg("registro.alterado");
	}

	public String registroRemovido() {
		return getMsg("msg.registro.removido");
	}

	public String registroRetornado() {// - 09/07/2025
		return getMsg("msg.registro.retornado");
	}

	public String sucesso() {
		return getMsg("msg.sucesso");
	}

	public String falha() {
		return getMsg("msg.falha");
	}

	public String violacaoFK() {
		return getMsg("msg.validacao.violacao.chave.estrangeira");
	}

	public String chaveDuplicada() {
		return getMsg("msg.erro.chave.duplicada");
	}

	public String jaExisteCandidatoComEsseCpf() {
		return getMsg("registro.ja.cadastrado.cpf.candidato");
	}

	public String registroNaoLocalizado() {
		return getMsg("registro.naoLocalizado");
	}

	public String falhaToken() {
		return getMsg("msg.exception.token.invalido");
	}

	/**
	 * - application.properties
	 */
	public String getBundleApplication(String msg) {
		ResourceBundle rb = ResourceBundle.getBundle("application");
		return rb.getString(msg);
	}

	/**
	 * - mensagem.properties
	 */
	public String getMsg(String msg, String... params) {
		ResourceBundle rb = ResourceBundle.getBundle("mensagem");
		String mensagemFormatada = rb.getString(msg);

		// Verifica se foram passados parâmetros para formatar a mensagem
		if (params != null && params.length > 0) {
			mensagemFormatada = MessageFormat.format(mensagemFormatada, (Object[]) params);
		}

		return mensagemFormatada;
	}

	/**
	 */
	public String retornarMsgDelete(String msg) {
		if (msg.equalsIgnoreCase("m1")) {
			return "Registro removido com sucesso ";
		} else if (msg.equalsIgnoreCase("m2")) {
			return "Registro de código ";
		} else if (msg.equalsIgnoreCase("m3")) {
			return " removido com sucesso";
		}
		return "";
	}

	/**
	 * - RETORNA LISTA
	 * Constrói um DTO de resposta padrão de sucesso para uma lista.
	 *
	 * @param data A 'listaDTO' de DTOs a ser incluída na resposta.
	 * @return Um RetornoFrontendListaDTO com status de sucesso.
	 */
	public <T> RetornoFrontendListaDTO prepararRetornoListaFront(List<T> listaDTO, int status, String msg) {
		RetornoFrontendListaDTO retorno = new RetornoFrontendListaDTO();
		retorno.setStatus(status);
		retorno.setMensagem(msg);
		retorno.setData(new ArrayList<Object>(listaDTO));
		return retorno;
	}

	/**
	 * - RETORNA OBJETO
	 */
	public <T> RetornoPadraoFrontendObjetoDTO prepararRetornoObjetoFront(T dto, int status, String msg) {
		RetornoPadraoFrontendObjetoDTO retorno = new RetornoPadraoFrontendObjetoDTO();
		retorno.setStatus(status);
		retorno.setMensagem(msg);
		retorno.setData(dto);
		return retorno;
	}

	public <T> RetornoFrontendListaPaginadaDTO<T> prepararRetornoListaFrontComPaginacao(Page<T> pagina, int status,
			String msg) {

		// 1. Cria o objeto principal de retorno
		RetornoFrontendListaPaginadaDTO<T> retorno = new RetornoFrontendListaPaginadaDTO<>();
		retorno.setStatus(status);
		retorno.setMensagem(msg);

		// 2. Extrai a lista de dados da página atual (ex: a lista de BolsaModelDTO)
		retorno.setData(pagina.getContent());

		// 3. Cria e popula o objeto com os metadados da paginação
		PaginacaoInfoDTO infoPaginacao = new PaginacaoInfoDTO();
		infoPaginacao.setTotalElementos(pagina.getTotalElements());
		infoPaginacao.setTotalPaginas(pagina.getTotalPages());
		infoPaginacao.setPaginaAtual(pagina.getNumber()); // .getNumber() é base 0, o que é um padrão comum em APIs
		infoPaginacao.setTamanhoPagina(pagina.getSize());
		infoPaginacao.setPrimeiraPagina(pagina.isFirst());
		infoPaginacao.setUltimaPagina(pagina.isLast());

		// 4. Adiciona as informações de paginação ao retorno principal
		retorno.setPaginacao(infoPaginacao);

		return retorno;
	}

	public <T> RetornoFrontendListaPaginadaDTO<T> prepararRetornoListaFrontComPaginacaoGenerico(PaginaRespostaDTO<T> pagina, int status,
			String msg) {

		RetornoFrontendListaPaginadaDTO<T> retorno = new RetornoFrontendListaPaginadaDTO<>();
		retorno.setStatus(status);
		retorno.setMensagem(msg);
		retorno.setData(pagina.getConteudo());
		retorno.setPaginacao(pagina.getPaginacao());

		return retorno;
	}

}
