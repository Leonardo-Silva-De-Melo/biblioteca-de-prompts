package br.uerj.dgti.bibliotecaprompts.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.uerj.dgti.bibliotecaprompts.exception.RegistroNaoEncontradoException;
import br.uerj.dgti.bibliotecaprompts.exception.RegraDeNegocioException;
import br.uerj.dgti.bibliotecaprompts.model.Feedback;
import br.uerj.dgti.bibliotecaprompts.model.HistoricoEdicao;
import br.uerj.dgti.bibliotecaprompts.model.Prompt;
import br.uerj.dgti.bibliotecaprompts.repository.ComentarioRepository;
import br.uerj.dgti.bibliotecaprompts.repository.HistoricoEdicaoRepository;
import br.uerj.dgti.bibliotecaprompts.repository.HistoricoUsoRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptRepository;
import br.uerj.dgti.bibliotecaprompts.repository.PromptVisualizacaoRepository;
import br.uerj.dgti.bibliotecaprompts.util.Util;

/**
 * Testes unitários de bugs críticos para o PromptService.
 * Seguindo o padrão SAG: @ExtendWith(MockitoExtension.class) + @DisplayName("[BUG CRÍTICO]")
 * 
 * Foco exclusivo em cenários que, se falharem, causam:
 * - Perda de dados irreversível
 * - Violação de segurança (acesso entre prompts)
 * - Crash na aplicação (NaN, ArithmeticException)
 */
@ExtendWith(MockitoExtension.class)
class PromptServiceTest {

    @Mock
    private PromptRepository promptRepository;

    @Mock
    private HistoricoEdicaoRepository historicoRepository;

    @Mock
    private ComentarioRepository comentarioRepository;

    @Mock
    private PromptVisualizacaoRepository promptVisualizacaoRepository;

    @Mock
    private HistoricoUsoRepository historicoUsoRepository;

    @Mock
    private Util util;

    @InjectMocks
    private PromptService promptService;

    // ═══════════════════════════════════════════════════════════════
    // BUG CRÍTICO 1: Proteção da Versão Original
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[BUG CRÍTICO] Deve impedir deleção da Versão 1 (original) para evitar perda de dados")
    void deveProtegerVersaoOriginalContraDeletar() {
        // Arrange
        Prompt prompt = new Prompt();
        prompt.setId(1L);

        HistoricoEdicao versaoOriginal = new HistoricoEdicao();
        versaoOriginal.setId(10L);
        versaoOriginal.setPrompt(prompt);
        versaoOriginal.setNumeroVersao(1); // Versão Original — NUNCA pode ser deletada

        when(historicoRepository.findById(10L)).thenReturn(Optional.of(versaoOriginal));

        // Act & Assert
        RegraDeNegocioException exception = assertThrows(
            RegraDeNegocioException.class,
            () -> promptService.deletarVersao(1L, 10L)
        );

        assertEquals("Não é permitido deletar a versão original (Versão 1).", exception.getMessage());

        // Garante que o delete NUNCA foi chamado
        verify(historicoRepository, never()).delete(any(HistoricoEdicao.class));
    }

    // ═══════════════════════════════════════════════════════════════
    // BUG CRÍTICO 2: Isolamento de Segurança entre Prompts
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[BUG CRÍTICO] Deve rejeitar edição de versão que não pertence ao prompt informado")
    void deveRejeitarEdicaoDeVersaoQueNaoPertenceAoPrompt() {
        // Arrange
        // Prompt A (ID=1) é dono da versão
        Prompt promptA = new Prompt();
        promptA.setId(1L);

        HistoricoEdicao versaoDoPromptA = new HistoricoEdicao();
        versaoDoPromptA.setId(50L);
        versaoDoPromptA.setPrompt(promptA);
        versaoDoPromptA.setNumeroVersao(2);

        when(historicoRepository.findById(50L)).thenReturn(Optional.of(versaoDoPromptA));

        // Act & Assert — Tentando editar a versão usando o Prompt B (ID=999)
        RegraDeNegocioException exception = assertThrows(
            RegraDeNegocioException.class,
            () -> promptService.editarMotivoVersao(999L, 50L, "Motivo malicioso")
        );

        assertEquals("A versão informada não pertence ao prompt.", exception.getMessage());

        // Garante que o save NUNCA foi chamado (a versão de outro prompt não foi alterada)
        verify(historicoRepository, never()).save(any(HistoricoEdicao.class));
    }

    // ═══════════════════════════════════════════════════════════════
    // BUG CRÍTICO 3: Cálculo de Sequência de Versões com NULL
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[BUG CRÍTICO] Deve calcular próxima versão corretamente quando não existir histórico (NULL do banco)")
    void deveCalcularProximaVersaoCorretamenteQuandoNaoExistirHistorico() {
        // Arrange
        Prompt prompt = new Prompt();
        prompt.setId(1L);
        prompt.setTitulo("Novo Prompt");
        prompt.setCategoria("Desenvolvimento");
        prompt.setTextoPrompt("Texto do prompt");
        prompt.setAutor("Leonardo Silva");

        when(promptRepository.save(any(Prompt.class))).thenReturn(prompt);
        // Simula cenário onde NÃO existe nenhuma versão no banco → retorna NULL
        when(historicoRepository.findMaxNumeroVersaoByPromptId(1L)).thenReturn(null);
        when(historicoRepository.save(any(HistoricoEdicao.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(util.sucesso()).thenReturn("Sucesso");
        when(util.prepararRetornoObjetoFront(any(), any(Integer.class), any(String.class)))
            .thenAnswer(invocation -> null);

        // Act
        promptService.criar(new br.uerj.dgti.bibliotecaprompts.dto.entidadeDTO.PromptDTO() {{
            setTitulo("Novo Prompt");
            setCategoria("Desenvolvimento");
            setTextoPrompt("Texto do prompt");
            setAutor("Leonardo Silva");
        }});

        // Assert — Captura o que foi salvo no histórico
        ArgumentCaptor<HistoricoEdicao> captor = ArgumentCaptor.forClass(HistoricoEdicao.class);
        verify(historicoRepository).save(captor.capture());

        HistoricoEdicao historicoSalvo = captor.getValue();

        // O ponto crítico: se o NULL não for tratado, versão vira 1 (0 + 1)
        assertNotNull(historicoSalvo.getNumeroVersao());
        assertEquals(1, historicoSalvo.getNumeroVersao());
        assertEquals("Leonardo Silva", historicoSalvo.getEditadoPor());
        assertEquals("Criação inicial", historicoSalvo.getMotivoEdicao());
    }

    // ═══════════════════════════════════════════════════════════════
    // BUG CRÍTICO 4: Média de Avaliação com Lista Vazia
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[BUG CRÍTICO] Deve calcular média de avaliação corretamente com lista vazia (evita NaN/ArithmeticException)")
    void deveCalcularMediaAvaliacaoCorretamenteComListaVazia() {
        // Arrange — Prompt sem nenhum feedback
        Prompt promptSemFeedback = new Prompt();
        promptSemFeedback.setId(1L);
        promptSemFeedback.setFeedbacks(new ArrayList<>());

        // Act — Recalcula as estatísticas
        promptSemFeedback.atualizarEstatisticasAvaliacao();

        // Assert — Deve ser 0.0 e não NaN nem exceção
        assertEquals(0.0, promptSemFeedback.getMediaAvaliacao());
        assertEquals(0, promptSemFeedback.getTotalAvaliacoes());

        // Arrange — Prompt com feedbacks nulos
        Prompt promptFeedbackNull = new Prompt();
        promptFeedbackNull.setId(2L);
        promptFeedbackNull.setFeedbacks(null);

        // Act
        promptFeedbackNull.atualizarEstatisticasAvaliacao();

        // Assert
        assertEquals(0.0, promptFeedbackNull.getMediaAvaliacao());
        assertEquals(0, promptFeedbackNull.getTotalAvaliacoes());

        // Arrange — Prompt com feedbacks reais (cenário feliz de controle)
        Prompt promptComFeedback = new Prompt();
        promptComFeedback.setId(3L);
        List<Feedback> feedbacks = new ArrayList<>();

        Feedback f1 = new Feedback();
        f1.setNota(5);
        f1.setPrompt(promptComFeedback);
        feedbacks.add(f1);

        Feedback f2 = new Feedback();
        f2.setNota(3);
        f2.setPrompt(promptComFeedback);
        feedbacks.add(f2);

        promptComFeedback.setFeedbacks(feedbacks);

        // Act
        promptComFeedback.atualizarEstatisticasAvaliacao();

        // Assert — (5 + 3) / 2 = 4.0
        assertEquals(4.0, promptComFeedback.getMediaAvaliacao());
        assertEquals(2, promptComFeedback.getTotalAvaliacoes());
    }
}
