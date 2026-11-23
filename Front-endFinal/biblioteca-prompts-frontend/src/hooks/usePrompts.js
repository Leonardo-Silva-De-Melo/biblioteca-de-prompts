import { useState, useEffect, useRef } from 'react';
import { promptsAPI, statsAPI, favoritosAPI, avaliacoesAPI } from '../services/api';
import { NOME_USUARIO, CATEGORIAS } from '../config/constants';
import { historicoAPI } from '../services/api';

/**
 * Hook que centraliza toda a lógica de prompts do dashboard principal:
 * carregamento, paginação, busca, filtro por categoria, abertura de modal,
 * cópia e avaliação de prompts.
 */
export function usePrompts() {
    const toast = useRef(null);

    // Paginação
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(5);
    const [totalRecords, setTotalRecords] = useState(0);

    // Dados
    const [prompts, setPrompts] = useState([]);
    const [stats, setStats] = useState(null);

    // Filtros
    const [busca, setBusca] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');

    // Modal de visualização
    const [promptSelecionado, setPromptSelecionado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoverNota, setHoverNota] = useState(0);
    const [isAvaliando, setIsAvaliando] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Favoritos (IDs) — recebido via prop/contexto, gerenciado pelo useFavoritos
    const [favoritos, setFavoritos] = useState([]);

    // Ao mudar filtros, volta para a página 1
    useEffect(() => {
        setFirst(0);
    }, [busca, categoriaFiltro]);

    // Recarrega dados com debounce ao mudar paginação ou filtros
    useEffect(() => {
        const delay = setTimeout(() => {
            carregarDados();
        }, 300);
        return () => clearTimeout(delay);
    }, [first, rows, busca, categoriaFiltro]);

    const carregarDados = async () => {
        try {
            if (prompts.length === 0 && !stats) {
                setLoading(true);
            }
            setError(null);

            const paginaAtual = first / rows;
            const [promptsRes, statsRes, favsRes] = await Promise.all([
                promptsAPI.listarTodos(paginaAtual, rows, busca, categoriaFiltro),
                statsAPI.get(),
                favoritosAPI.listar(NOME_USUARIO),
            ]);

            setPrompts(promptsRes.data.conteudo);
            setTotalRecords(promptsRes.data.paginacao.totalElementos);
            setStats(statsRes.data);
            setFavoritos(favsRes.data);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const abrirPrompt = async (prompt, carregarComentariosCallback, carregarHistoricoCallback) => {
        try {
            await promptsAPI.incrementarUso(prompt.id, NOME_USUARIO);

            const paginaAtual = first / rows;
            const [statsRes, promptsRes] = await Promise.all([
                statsAPI.get(),
                promptsAPI.listarTodos(paginaAtual, rows),
            ]);

            setStats(statsRes.data);
            setPrompts(promptsRes.data.conteudo);

            const promptAtualizado = promptsRes.data.conteudo.find(p => p.id === prompt.id);
            setPromptSelecionado(promptAtualizado || prompt);
            setShowModal(true);
            document.body.style.overflow = 'hidden';

            if (carregarComentariosCallback) carregarComentariosCallback(prompt.id);
            if (carregarHistoricoCallback) carregarHistoricoCallback(prompt.id);
        } catch (err) {
            console.error('Erro ao abrir prompt:', err);
        }
    };

    const copiarPrompt = async () => {
        if (!promptSelecionado) return;
        try {
            await navigator.clipboard.writeText(promptSelecionado.textoPrompt);
            try {
                await historicoAPI.registrar(NOME_USUARIO, promptSelecionado.id);
            } catch {
                // Já registrado hoje — comportamento esperado
            }
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Prompt copiado com sucesso!', sticky: true });
        } catch (err) {
            console.error('Erro ao copiar:', err);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao copiar.', sticky: true });
        }
    };

    const fecharModal = () => {
        setShowModal(false);
        setPromptSelecionado(null);
        document.body.style.overflow = 'auto';
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
        document.getElementById('lista-prompts')?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleCategoria = (categoria) => {
        setCategoriaFiltro(prev => (prev === categoria ? '' : categoria));
    };

    const getCategoriasComCount = () => {
        return CATEGORIAS.map(cat => ({
            ...cat,
            count: stats?.usoPorCategoria?.[cat.nome] || 0,
        }));
    };

    const dispararAtualizacaoGeral = () => {
        carregarDados();
        setRefreshTrigger(prev => prev + 1);
    };

    const enviarAvaliacaoRapida = async (notaDada) => {
        if (!promptSelecionado || isAvaliando) return;
        setIsAvaliando(true);
        try {
            await avaliacoesAPI.avaliarPrompt(promptSelecionado.id, notaDada, '', NOME_USUARIO);
            const paginaAtual = first / rows;
            const response = await promptsAPI.listarTodos(paginaAtual, rows);
            setPrompts(response.data.conteudo);
            const atualizado = response.data.conteudo.find(p => p.id === promptSelecionado.id);
            if (atualizado) setPromptSelecionado(atualizado);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Avaliação registrada com sucesso!', sticky: true });
        } catch (err) {
            const mensagemErro = err.response?.data?.message || 'Você já avaliou este prompt.';
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: mensagemErro, sticky: true });
        } finally {
            setIsAvaliando(false);
            setHoverNota(0);
        }
    };

    return {
        // Refs
        toast,
        // Paginação
        first, rows, totalRecords, onPageChange,
        // Dados
        prompts, setPrompts, stats, setStats,
        // Filtros
        busca, setBusca, categoriaFiltro, setCategoriaFiltro, toggleCategoria,
        // Modal
        promptSelecionado, setPromptSelecionado, showModal, setShowModal, fecharModal,
        // UI
        loading, error, hoverNota, setHoverNota, isAvaliando, refreshTrigger,
        // Favoritos (IDs gerenciados aqui para stats)
        favoritos, setFavoritos,
        // Funções
        carregarDados, abrirPrompt, copiarPrompt, getCategoriasComCount,
        dispararAtualizacaoGeral, enviarAvaliacaoRapida,
    };
}
