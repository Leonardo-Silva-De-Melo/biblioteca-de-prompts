package br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO;

import java.util.List;
import java.util.Map;


public record DashboardStatsDTO(
    long totalPrompts,
    long totalUsosSemana,
    long totalFavoritos,
    long totalVisualizacoesReais,
    long contribuidoresAtivos,
    String mediaSatisfacao,
    Map<String, Long> usoPorCategoria,
    Map<String, Long> distribuicaoNotas,
    Map<String, Object> evolucaoAnual,
    List<Map<String, Object>> topPrompts
) {}