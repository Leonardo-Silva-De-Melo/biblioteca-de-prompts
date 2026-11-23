package br.uerj.dgti.bibliotecaprompts.util;

import java.util.ResourceBundle;

public class Constantes {
	
	private static ResourceBundle bundle = ResourceBundle.getBundle("constantes");

	
	public static String get(String key) {
		return bundle.getString(key);
	}
	
	public static int getInt(String key) {
		return Integer.parseInt(get(key));
	}
}

