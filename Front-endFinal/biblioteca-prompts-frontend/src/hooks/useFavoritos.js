import { useState, useEffect } from 'react';
import { favoritosAPI, promptsAPI } from '../services/api';
import { NOME_USUARIO } from '../config/constants';

/**
 * Hook que centraliza a lógica de favoritos:
 * lista de IDs favoritados e objetos completos dos prompts favoritos.
 */
export function useFavoritos(favoritos, setFavoritos, setStats, toast) {
    const [promptsFavoritos, setPromptsFavoritos] = useState([]);

    // Toda vez que a lista de IDs mudar, busca os objetos completos no backend
    useEffect(() => {
        if (favoritos.length > 0) {
            Promise.all(favoritos.map(id => promptsAPI.buscarPorId(id)))
                .then(respostas => setPromptsFavoritos(respostas.map(r => r.data)))
                .catch(err => console.error('Erro ao buscar detalhes dos favoritos:', err));
        } else {
            setPromptsFavoritos([]);
        }
    }, [favoritos]);

    const toggleFavorito = async (promptId) => {
        try {
            await favoritosAPI.toggle(NOME_USUARIO, promptId);

            const isRemovendo = favoritos.includes(promptId);

            setFavoritos(prev =>
                isRemovendo
                    ? prev.filter(id => id !== promptId)
                    : [...prev, promptId]
            );

            setStats(prev => ({
                ...prev,
                totalFavoritos: isRemovendo ? prev.totalFavoritos - 1 : prev.totalFavoritos + 1,
            }));
        } catch {
            toast?.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao favoritar prompt.',
                sticky: true,
            });
        }
    };

    return { promptsFavoritos, toggleFavorito };
}
