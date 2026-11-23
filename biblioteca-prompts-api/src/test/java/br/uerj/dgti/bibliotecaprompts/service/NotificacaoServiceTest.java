package br.uerj.dgti.bibliotecaprompts.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.uerj.dgti.bibliotecaprompts.exception.RegistroNaoEncontradoException;
import br.uerj.dgti.bibliotecaprompts.model.Notificacao;
import br.uerj.dgti.bibliotecaprompts.repository.NotificacaoRepository;
import br.uerj.dgti.bibliotecaprompts.util.Util;

/**
 * Testes unitários de bugs críticos para o NotificacaoService.
 * Seguindo o padrão SAG: @ExtendWith(MockitoExtension.class) + @DisplayName("[BUG CRÍTICO]")
 *
 * Foco exclusivo em cenários que, se falharem, causam:
 * - Spam de notificações duplicadas
 * - Links quebrados no frontend (linkAcao com "null")
 * - Erros silenciosos ao marcar como lida
 */
@ExtendWith(MockitoExtension.class)
class NotificacaoServiceTest {

    @Mock
    private NotificacaoRepository notificacaoRepository;

    @Mock
    private Util util;

    @InjectMocks
    private NotificacaoService notificacaoService;

    private static final String USUARIO_TESTE = "Leonardo Silva";

    // ═══════════════════════════════════════════════════════════════
    // BUG CRÍTICO 1: Anti-duplicata de Notificações
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[BUG CRÍTICO] Deve evitar duplicata de notificação nas últimas 24h")
    void deveEvitarDuplicataDeNotificacaoNas24h() {
        // Arrange — Simula que JÁ existe uma notificação similar nas últimas 24h
        when(notificacaoRepository.existeSimilar(
            eq(USUARIO_TESTE),
            eq("AVALIACAO"),
            eq(1L),
            any(LocalDateTime.class)
        )).thenReturn(true); // Já existe!

        // Act
        Notificacao resultado = notificacaoService.criar(
            USUARIO_TESTE, "AVALIACAO", "Nova avaliação", "5 estrelas!", 1L
        );

        // Assert — Não deve salvar nada (evita spam)
        assertNull(resultado);
        verify(notificacaoRepository, never()).save(any(Notificacao.class));
    }

    // ═══════════════════════════════════════════════════════════════
    // BUG CRÍTICO 2: Criação correta quando NÃO há duplicata
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[BUG CRÍTICO] Deve criar notificação com linkAcao correto quando não existir similar")
    void deveCriarNotificacaoQuandoNaoExistirSimilar() {
        // Arrange — Não existe similar
        when(notificacaoRepository.existeSimilar(
            eq(USUARIO_TESTE),
            eq("COMENTARIO"),
            eq(5L),
            any(LocalDateTime.class)
        )).thenReturn(false);

        when(notificacaoRepository.save(any(Notificacao.class)))
            .thenAnswer(invocation -> {
                Notificacao n = invocation.getArgument(0);
                n.setId(100L); // Simula o ID gerado pelo banco
                return n;
            });

        // Act
        Notificacao resultado = notificacaoService.criar(
            USUARIO_TESTE, "COMENTARIO", "Novo comentário", "Ótimo prompt!", 5L
        );

        // Assert — Deve ter salvo corretamente
        assertNotNull(resultado);
        assertEquals(100L, resultado.getId());
        assertEquals(USUARIO_TESTE, resultado.getUsuario());
        assertEquals("COMENTARIO", resultado.getTipo());

        // O ponto crítico: linkAcao deve ser "/prompts/5" e NÃO "/prompts/null"
        assertEquals("/prompts/5", resultado.getLinkAcao());

        // Captura o que foi salvo
        ArgumentCaptor<Notificacao> captor = ArgumentCaptor.forClass(Notificacao.class);
        verify(notificacaoRepository).save(captor.capture());

        Notificacao salva = captor.getValue();
        assertEquals("/prompts/5", salva.getLinkAcao());
        assertEquals(false, salva.getLida());
    }

    // ═══════════════════════════════════════════════════════════════
    // BUG CRÍTICO 3: Marcar notificação inexistente como lida
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("[BUG CRÍTICO] Deve lançar exceção ao tentar marcar notificação inexistente como lida")
    void deveLancarExcecaoAoMarcarNotificacaoInexistenteComoLida() {
        // Arrange — ID 999 não existe no banco
        when(notificacaoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RegistroNaoEncontradoException exception = assertThrows(
            RegistroNaoEncontradoException.class,
            () -> notificacaoService.marcarComoLida(999L)
        );

        assertEquals("Notificação não encontrada.", exception.getMessage());

        // Garante que save NUNCA foi chamado
        verify(notificacaoRepository, never()).save(any(Notificacao.class));
    }
}
