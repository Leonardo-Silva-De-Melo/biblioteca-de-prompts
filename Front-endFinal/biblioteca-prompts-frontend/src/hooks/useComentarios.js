import { useState } from 'react';
import { comentariosAPI } from '../services/api';

/**
 * Hook que centraliza toda a lógica de comentários de um prompt:
 * carregar, adicionar, editar e excluir comentários.
 */
export function useComentarios() {
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [showComentarios, setShowComentarios] = useState(false);

    // Modal de exclusão de comentário
    const [showConfirmarExclusaoComentario, setShowConfirmarExclusaoComentario] = useState(false);
    const [comentarioParaDeletar, setComentarioParaDeletar] = useState(null);

    // Modal de edição de comentário
    const [showModalEdicaoComentario, setShowModalEdicaoComentario] = useState(false);
    const [comentarioEmEdicao, setComentarioEmEdicao] = useState(null);
    const [textoEdicaoComentario, setTextoEdicaoComentario] = useState('');

    const carregarComentarios = async (promptId) => {
        try {
            const response = await comentariosAPI.listar(promptId);
            setComentarios(response.data);
        } catch {
            setComentarios([]);
        }
    };

    const adicionarComentario = async (promptId, nomeUsuario, toast) => {
        if (!novoComentario.trim() || !promptId) return;
        try {
            await comentariosAPI.adicionar(promptId, novoComentario, nomeUsuario);
            setNovoComentario('');
            carregarComentarios(promptId);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Comentário adicionado com sucesso!', sticky: true });
        } catch {
            toast?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar comentário.', sticky: true });
        }
    };

    const abrirConfirmarExclusaoComentario = (comentario) => {
        setComentarioParaDeletar(comentario);
        setShowConfirmarExclusaoComentario(true);
    };

    const confirmarExclusaoComentario = async (promptId, toast) => {
        try {
            await comentariosAPI.deletar(promptId, comentarioParaDeletar.id);
            await carregarComentarios(promptId);
            setShowConfirmarExclusaoComentario(false);
            setComentarioParaDeletar(null);
            toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Comentário deletado com sucesso!', sticky: true });
        } catch {
            toast?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar comentário.', sticky: true });
        }
    };

    const abrirModalEdicaoComentario = (comentario) => {
        setComentarioEmEdicao(comentario);
        setTextoEdicaoComentario(comentario.texto);
        setShowModalEdicaoComentario(true);
    };

    const salvarEdicaoComentario = async (promptId, toast) => {
        try {
            await comentariosAPI.editar(promptId, comentarioEmEdicao.id, textoEdicaoComentario);
            await carregarComentarios(promptId);
            setShowModalEdicaoComentario(false);
            setComentarioEmEdicao(null);
            toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Comentário atualizado com sucesso!', sticky: true });
        } catch {
            toast?.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao editar comentário.', sticky: true });
        }
    };

    const resetarComentarios = () => {
        setComentarios([]);
        setNovoComentario('');
        setShowComentarios(false);
    };

    return {
        // Estado
        comentarios, novoComentario, setNovoComentario,
        showComentarios, setShowComentarios,
        // Modal exclusão
        showConfirmarExclusaoComentario, setShowConfirmarExclusaoComentario, comentarioParaDeletar,
        // Modal edição
        showModalEdicaoComentario, setShowModalEdicaoComentario,
        comentarioEmEdicao, textoEdicaoComentario, setTextoEdicaoComentario,
        // Funções
        carregarComentarios, adicionarComentario,
        abrirConfirmarExclusaoComentario, confirmarExclusaoComentario,
        abrirModalEdicaoComentario, salvarEdicaoComentario,
        resetarComentarios,
    };
}
