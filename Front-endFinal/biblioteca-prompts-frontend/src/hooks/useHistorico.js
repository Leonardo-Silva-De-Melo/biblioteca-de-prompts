import { useState } from 'react';
import { historicoVersaoAPI } from '../services/api';

/**
 * Hook que centraliza toda a lógica de histórico de versões de um prompt:
 * carregar, visualizar, editar e excluir versões históricas.
 */
export function useHistorico() {
    const [historico, setHistorico] = useState([]);
    const [showHistorico, setShowHistorico] = useState(false);

    // Modal: visualizar versão completa
    const [showModalVersao, setShowModalVersao] = useState(false);
    const [versaoVisualizando, setVersaoVisualizando] = useState(null);

    // Modal: editar versão
    const [showModalEditarVersao, setShowModalEditarVersao] = useState(false);
    const [versaoEmEdicao, setVersaoEmEdicao] = useState(null);
    const [textoMotivoEdicao, setTextoMotivoEdicao] = useState('');
    const [textoVersaoEmEdicao, setTextoVersaoEmEdicao] = useState('');

    // Modal: excluir versão
    const [showModalExcluirVersao, setShowModalExcluirVersao] = useState(false);
    const [versaoParaExcluir, setVersaoParaExcluir] = useState(null);

    const carregarHistoricoVersoes = async (promptId) => {
        try {
            const response = await historicoVersaoAPI.buscarHistorico(promptId);
            setHistorico(response.data || []);
        } catch {
            setHistorico([]);
        }
    };

    const verVersaoCompleta = async (promptId, numeroVersao, toast) => {
        if (!promptId) return;
        try {
            const response = await historicoVersaoAPI.buscarVersao(promptId, numeroVersao);
            setVersaoVisualizando(response.data);
            setShowModalVersao(true);
        } catch {
            toast?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar versão.', sticky: true });
        }
    };

    const fecharModalVersao = () => {
        setShowModalVersao(false);
        setVersaoVisualizando(null);
    };

    const abrirModalEditarVersao = (versao) => {
        setVersaoEmEdicao(versao);
        setTextoMotivoEdicao(versao.motivoEdicao || '');
        setTextoVersaoEmEdicao(versao.textoVersao || '');
        setShowModalEditarVersao(true);
    };

    const fecharModalEditarVersao = () => {
        setVersaoEmEdicao(null);
        setTextoMotivoEdicao('');
        setShowModalEditarVersao(false);
    };

    const salvarEdicaoVersao = async (promptId, toast) => {
        if (!versaoEmEdicao || !textoMotivoEdicao.trim() || !textoVersaoEmEdicao.trim()) {
            toast?.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha o motivo e o conteúdo da especificação.', sticky: true });
            return;
        }
        try {
            await historicoVersaoAPI.atualizarVersao(
                promptId,
                versaoEmEdicao.id,
                textoVersaoEmEdicao,
                textoMotivoEdicao.trim()
            );
            toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Versão histórica atualizada com sucesso!', sticky: true });
            await carregarHistoricoVersoes(promptId);
            fecharModalEditarVersao();
        } catch {
            toast?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar no banco de dados. Verifique a conexão.', sticky: true });
        }
    };

    const abrirModalExcluirVersao = (versao) => {
        setVersaoParaExcluir(versao);
        setShowModalExcluirVersao(true);
    };

    const fecharModalExcluirVersao = () => {
        setVersaoParaExcluir(null);
        setShowModalExcluirVersao(false);
    };

    const confirmarExclusaoVersao = async (promptId, toast) => {
        if (!versaoParaExcluir) return;
        try {
            await historicoVersaoAPI.deletarVersao(promptId, versaoParaExcluir.id);
            toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Versão deletada do histórico!', sticky: true });
            await carregarHistoricoVersoes(promptId);
            if (versaoVisualizando?.id === versaoParaExcluir.id) {
                fecharModalVersao();
            }
            fecharModalExcluirVersao();
        } catch {
            toast?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar versão do histórico.', sticky: true });
        }
    };

    const resetarHistorico = () => {
        setHistorico([]);
        setShowHistorico(false);
    };

    return {
        // Estado
        historico, showHistorico, setShowHistorico,
        // Modal visualização
        showModalVersao, versaoVisualizando, fecharModalVersao,
        // Modal edição
        showModalEditarVersao, versaoEmEdicao,
        textoMotivoEdicao, setTextoMotivoEdicao,
        textoVersaoEmEdicao, setTextoVersaoEmEdicao,
        fecharModalEditarVersao,
        // Modal exclusão
        showModalExcluirVersao, versaoParaExcluir, fecharModalExcluirVersao,
        // Funções
        carregarHistoricoVersoes, verVersaoCompleta,
        abrirModalEditarVersao, salvarEdicaoVersao,
        abrirModalExcluirVersao, confirmarExclusaoVersao,
        resetarHistorico,
    };
}
