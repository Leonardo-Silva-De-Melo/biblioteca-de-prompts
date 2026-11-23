package br.uerj.dgti.bibliotecaprompts.util;

import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


/**
 * Classe utilitária para manipular <code>String</code>s.
 * 
 */
public class StringUtils {

	/**
	 * Classe criada no SFS e copiada para o SAG para seguir o padrão de desenvolvimento
	 * Retorna a String especificada sem acentos
	 * 
	 * @param str String a ser processada
	 * @return String sem acentos
	 */
//	private static Logger logger = Logger.getLogger(StringUtils.class);

	public static String tiraAcentos(String str) {
		str = str.replaceAll("[èéêë]", "e");
		str = str.replaceAll("[ùúûü]", "u");
		str = str.replaceAll("[ìíîï]", "i");
		str = str.replaceAll("[àáâäã]", "a");
		str = str.replaceAll("[òóôöõ]", "o");
		str = str.replaceAll("ç", "c");
		str = str.replaceAll("ñ", "n");

		str = str.replaceAll("[ÈÉÊË]", "E");
		str = str.replaceAll("[ÙÚÛÜ]", "U");
		str = str.replaceAll("[ÌÍÎÏ]", "I");
		str = str.replaceAll("[ÀÁÂÄÃ]", "A");
		str = str.replaceAll("[ÒÓÔÖÕ]", "O");
		str = str.replaceAll("Ç", "C");
		str = str.replaceAll("Ñ", "N");
		str = str.replaceAll("'", " ");
		str = str.replaceAll("´", " ");
		str = str.replaceAll("`", " ");

		return str;
	}

	/**
	 * Left Pad
	 * 
	 * @param original String original
	 * @param length   Tamanho que a string deve ter
	 * @param c        Caractere utilizado para preencher a String
	 * @return String modificada
	 */
	public static String lpad(String original, int length, char c) {
		
		while (original.length() < length) {
			original = c + original;
		}

		return original;
	}

	
	
	/**
	 * Remove caracteres não numéricos
	 * 
	 * @param original String original
	 * @return String modificada.
	 */
	public static String onlyNumbers(String original) {
		String novaStr = "";

		if (original == null)
			return novaStr;

		char[] chars = original.toCharArray();
		for (int i = 0; i < chars.length; i++) {
			if (Character.isDigit(chars[i])) {
				novaStr += chars[i];
			}
		}

		return novaStr;
	}

	
//	
//	public boolean isInt(String v) throws GenericaException {
//		try {
//			Integer.parseInt(v);
//			return true;
//		} catch (NumberFormatException e) {
//			e.printStackTrace();
//			throw new GenericaException("errors.candidato.sistema");
//		}
//	}

	
	
	

	public boolean validaEmail(final String emailValida) {
		final Pattern p = Pattern.compile("^[\\w-]+(\\.[\\w-]+)*@([\\w-]+\\.)+[a-zA-Z]{2,7}$");
		final Matcher m = p.matcher(emailValida);
		final boolean matchEncon = m.matches();
		return matchEncon;
	}
	
	

	public boolean validarSenha(final String senha) {
		final String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{10,100}$";
		final Pattern p = Pattern.compile(regex);
		if (senha == null) {
			return false;
		}
		final Matcher m = p.matcher(senha);
		return m.matches();
	}
	

	/**
	 * 
	 */
	public String getHashSha1(final String senha) {
		String sha1 = "";
		
		try {
			final MessageDigest digest = MessageDigest.getInstance("SHA-1");
			digest.reset();
			digest.update(senha.getBytes("utf8"));
			sha1 = String.format("%040x", new BigInteger(1, digest.digest()));
			
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		} catch (UnsupportedEncodingException e2) {
			e2.printStackTrace();
		}
		return sha1;
	}
	
	
}
