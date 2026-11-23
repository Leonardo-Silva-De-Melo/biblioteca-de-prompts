package br.uerj.dgti.bibliotecaprompts.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import br.uerj.dgti.bibliotecaprompts.dto.RetornoPadraoFrontendObjetoDTO;
import br.uerj.dgti.bibliotecaprompts.util.Util;
import org.springframework.stereotype.Service;

import br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.DashboardStatsDTO;
import br.uerj.dgti.bibliotecaprompts.model.Prompt;
import br.uerj.dgti.bibliotecaprompts.repository.FavoritoRepository;
import br.uerj.dgti.bibliotecaprompts.repository.FeedbackRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptVisualizacaoRepository;

@Service
public class StatsService {

    private final PromptRepository promptRepository;
    private final FeedbackRepository feedbackRepository;
    private final PromptVisualizacaoRepository visualizacaoRepository;
    private final FavoritoRepository favoritoRepository;
    private final Util util;

    public StatsService(PromptRepository promptRepository, 
                        FeedbackRepository feedbackRepository,
                        PromptVisualizacaoRepository visualizacaoRepository,
                        FavoritoRepository favoritoRepository,
                        Util util){
        this.promptRepository = promptRepository;
        this.feedbackRepository = feedbackRepository;
        this.visualizacaoRepository = visualizacaoRepository;
        this.favoritoRepository = favoritoRepository;
        this.util = util;
    }

    public RetornoPadraoFrontendObjetoDTO calcularEstatisticasGerais() {
        
        // 1. Consultas ultra-rápidas no banco
        long totalPrompts = promptRepository.count();
        long totalUsos = promptRepository.somaTotalUsos();
        long totalFavoritos = favoritoRepository.count();
        long totalVisualizacoesReais = visualizacaoRepository.count();
        long contribuidoresAtivos = promptRepository.contarAutoresUnicos();
        Double mediaBanco = promptRepository.findAll().stream()
        	    .filter(p -> p.getMediaAvaliacao() != null && p.getMediaAvaliacao() > 0)
        	    .mapToDouble(Prompt::getMediaAvaliacao)
        	    .average()
        	    .orElse(0.0);
        String mediaSatisfacao = String.format(Locale.US, "%.1f", mediaBanco != null ? mediaBanco : 0.0);

        // 2. Uso por Categoria
        Map<String, Long> usoPorCategoria = promptRepository.contarPorCategoria().stream()
                .collect(Collectors.toMap(
                        obj -> (String) obj[0], 
                        obj -> (Long) obj[1]
                ));

        // 3. Distribuição de Notas
        Map<Integer, Long> notasBanco = feedbackRepository.countDistribuicaoNotas().stream()
                .collect(Collectors.toMap(
                        obj -> (Integer) obj[0], 
                        obj -> (Long) obj[1]
                ));
        
        Map<String, Long> distribuicaoNotas = Map.of(
            "umaEstrela", notasBanco.getOrDefault(1, 0L),
            "duasEstrelas", notasBanco.getOrDefault(2, 0L),
            "tresEstrelas", notasBanco.getOrDefault(3, 0L),
            "quatroEstrelas", notasBanco.getOrDefault(4, 0L),
            "cincoEstrelas", notasBanco.getOrDefault(5, 0L)
        );

        // 4. Evolução Anual
        int anoAtual = LocalDate.now().getYear();
        String[] nomesMeses = {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};
        List<Integer> criacoesPorMes = new ArrayList<>();
        List<Integer> acessosPorMes = new ArrayList<>(); 

        for (int i = 1; i <= 12; i++) {
            long criadosNesteMes = promptRepository.countCriacoesPorMesEData(anoAtual, i);
            criacoesPorMes.add((int) criadosNesteMes);
            // Simulação de acessos
            acessosPorMes.add((int) (criadosNesteMes * 5.5 + (Math.random() * 20)));
        }

        Map<String, Object> evolucaoAnual = Map.of(
            "labels", nomesMeses,
            "promptsCriados", criacoesPorMes,
            "acessos", acessosPorMes
        );

        // 5. TOP Prompts
        List<Map<String, Object>> topPrompts = promptRepository.findTop5ByOrderByVezesUsadoDesc().stream()
            .map(p -> Map.<String, Object>of(
                "titulo", p.getTitulo(),
                "categoria", p.getCategoria(),
                "usos", p.getVezesUsado()
            )).collect(Collectors.toList());

        // ÚLTIMAS ATIVIDADES" foi totalmente removido daqui!

        DashboardStatsDTO dashboardStatsDTO = new DashboardStatsDTO(
            totalPrompts, totalUsos, totalFavoritos, totalVisualizacoesReais, 
            contribuidoresAtivos, mediaSatisfacao, usoPorCategoria, distribuicaoNotas, 
            evolucaoAnual, topPrompts
        );

        return util.prepararRetornoObjetoFront(dashboardStatsDTO, 200, util.registroRetornado());
    }
}