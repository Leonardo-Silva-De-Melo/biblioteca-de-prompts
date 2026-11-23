package br.uerj.dgti.bibliotecaprompts.util.enums;

/**
 * Record para armazenar as informações do usuário extraídas do token.
 *
 * @param username O nome de usuário (ou ID) contido no "subject" do token.
 */
public record UsuarioInfo(String idUnico) {
}
