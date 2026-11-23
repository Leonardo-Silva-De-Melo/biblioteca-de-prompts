package br.uerj.dgti.bibliotecaprompts.util;


import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

/**
 * Classe utilitária para manipular <code>Date</code>s.
 * 
 */
public class DateUtils {

	/**
	 * Calcula a idade de uma pessoa comparando sua data de nascimento com a data atual.
	 * Classe criada no SFS e copiada para o SAG para seguir o padrão de desenvolvimento
	 * @param datNascimento Data de nascimento
	 * @param hoje Data atual
	 * @return Idade calculada
	 */
	public static int calculaIdade(Date datNascimento, Date hoje) {
		
		Calendar cal = new GregorianCalendar();
		cal.setTime(datNascimento);
		cal.set(Calendar.HOUR, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.MILLISECOND, 0);
		
		int qtdAnos = 0;
		while(cal.getTime().before(hoje)) {
			cal.add(Calendar.YEAR, 1);
			if(cal.getTime().before(hoje)) {
				qtdAnos++;
			}
		}
		
		return qtdAnos;
	}
}
