import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000 // Aumentado para 2 minutos (Tempo de sobra para a IA pensar)
});

api.interceptors.request.use(
  async config => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);

    try {
      const { default: keycloak } = await import('../keycloak.js');
      console.log('[KEYCLOAK] authenticated:', keycloak.authenticated);
      console.log('[KEYCLOAK] token:', keycloak.token ? 'existe' : 'NULO');

      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        config.headers['Authorization'] = `Bearer ${keycloak.token}`;
        console.log('[KEYCLOAK] Token adicionado ao header!');
      } else {
        console.warn('[KEYCLOAK] Usuário não autenticado!');
      }
    } catch (e) {
      console.warn('[API] Erro ao obter token:', e);
    }

    return config;
  },
  error => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Desempacota o envelope global UtilRespostaGenerico do SAG
    if (
      response.data &&
      typeof response.data === 'object' &&
      'status' in response.data &&
      'mensagem' in response.data &&
      'data' in response.data
    ) {
      if (response.data.paginacao) {
        response.data = {
          conteudo: response.data.data,
          paginacao: response.data.paginacao
        };
      } else {
        response.data = response.data.data;
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════
// FEEDBACK DA PLATAFORMA (SISTEMA GERAL)
// ═══════════════════════════════════════════════════════════════

export const feedbackPlataformaAPI = {
  enviar: (nota, comentario, usuario) =>
    api.post('/feedbacks-plataforma', {
      nota: nota,
      comentario: comentario,
      usuario: usuario
    }),

  listarTodos: () => api.get('/feedbacks-plataforma')
};



// ═══════════════════════════════════════════════════════════════
// PROMPTS
// ═══════════════════════════════════════════════════════════════

export const promptsAPI = {
  listarTodos: (pagina = 0, tamanho = 10, termo = '', categoria = '') =>
    api.get('/prompts', { params: { pagina, tamanho, termo, categoria } }),
  buscarPorId: (id) => api.get(`/prompts/${id}`),
  criar: (prompt) => api.post('/prompts', prompt),
  editar: (id, prompt) => api.put(`/prompts/${id}`, prompt),
  deletar: (id) => api.delete(`/prompts/${id}`),

  //  CORREÇÃO: Enviando o usuário como query string (URL) para bater com o @RequestParam do Java
  incrementarUso: (id, usuario) => api.post(`/prompts/${id}/usar?usuario=${encodeURIComponent(usuario)}`),

  buscarPorCategoria: (categoria) => api.get(`/prompts/categoria/${categoria}`),
  buscarPorAutor: (autor) => api.get(`/prompts?autor=${autor}`),

  listarMeusPrompts: (pagina = 0, tamanho = 10, usuario = '') =>
    api.get('/prompts/meus', { params: { pagina, tamanho, usuario } }),

  listarHistoricoPessoal: (pagina, tamanho, usuario) =>
    api.get(`/prompts/historico-pessoal?pagina=${pagina}&tamanho=${tamanho}&usuario=${encodeURIComponent(usuario)}`),
};

// ═══════════════════════════════════════════════════════════════
// HISTÓRICO 
// ═══════════════════════════════════════════════════════════════

export const historicoAPI = {
  /**
   * Listar histórico do usuário
   * Retorna: Page<HistoricoUso>
   */
  listar: (usuario, page = 0, size = 50) =>
    api.get(`/historico-uso/usuario/${encodeURIComponent(usuario)}`, {
      params: { page, size }
    }),

  /**
   * Registrar uso de um prompt (automático ao copiar)
   */
  registrar: (usuario, promptId, observacao = null) =>
    api.post('/historico-uso/registrar', { usuario, promptId, observacao }),

  /**
   * Listar histórico com filtro de data
   */
  buscarComFiltro: (usuario, dataInicio, dataFim, page = 0, size = 50) =>
    api.get(`/historico-uso/usuario/${encodeURIComponent(usuario)}/filtro-data`, {
      params: { dataInicio, dataFim, page, size }
    }),

  /**
   * Listar histórico por categoria
   */
  buscarPorCategoria: (usuario, categoria, page = 0, size = 50) =>
    api.get(`/historico-uso/usuario/${encodeURIComponent(usuario)}/categoria/${encodeURIComponent(categoria)}`, {
      params: { page, size }
    }),

  /**
   * Deletar item do histórico
   */
  deletar: (historicoId) =>
    api.delete(`/historico-uso/${historicoId}`),

  /**
   * Limpar todo histórico do usuário
   */
  limparTudo: (usuario) =>
    api.delete(`/historico-uso/usuario/${encodeURIComponent(usuario)}/limpar`)
};

// ═══════════════════════════════════════════════════════════════
// HISTÓRICO DE VERSÕES
// ═══════════════════════════════════════════════════════════════

// export const historicoVersaoAPI = {
//   buscarHistorico: (promptId) => api.get(`/prompts/${promptId}/historico`),
//   buscarVersao: (promptId, versao) => api.get(`/prompts/${promptId}/historico/${versao}`),
//   editarMotivo: (promptId, versao, novoMotivo) => 
//     api.put(`/prompts/${promptId}/historico/${versao}/motivo`, { motivo: novoMotivo }),
//   deletarVersao: (promptId, versao) => api.delete(`/prompts/${promptId}/historico/${versao}`),
// };

export const historicoVersaoAPI = {
  buscarHistorico: (promptId) => api.get(`/prompts/${promptId}/historico`),
  buscarVersao: (promptId, versao) => api.get(`/prompts/${promptId}/historico/${versao}`),

  editarMotivo: (promptId, versao, novoMotivo) =>
    api.put(`/prompts/${promptId}/historico/${versao}/motivo?motivo=${encodeURIComponent(novoMotivo)}`),

  atualizarVersao: (promptId, versaoId, texto, motivo) =>
    api.put(`/prompts/${promptId}/historico/${versaoId}?texto=${encodeURIComponent(texto)}&motivo=${encodeURIComponent(motivo)}`),

  deletarVersao: (promptId, versaoId) => api.delete(`/prompts/${promptId}/historico/${versaoId}`),
};



// ═══════════════════════════════════════════════════════════════
// COMENTÁRIOS
// ═══════════════════════════════════════════════════════════════

export const comentariosAPI = {
  listar: (promptId) => api.get(`/prompts/${promptId}/comentarios`),

  // CORREÇÃO: Enviando texto e autor como query string, conforme o Java (@RequestParam) espera
  adicionar: (promptId, texto, autor) =>
    api.post(`/prompts/${promptId}/comentarios?texto=${encodeURIComponent(texto)}&autor=${encodeURIComponent(autor)}`),

  editar: (promptId, comentarioId, novoTexto) =>
    api.put(`/prompts/${promptId}/comentarios/${comentarioId}?texto=${encodeURIComponent(novoTexto)}`),

  deletar: (promptId, comentarioId) => api.delete(`/prompts/${promptId}/comentarios/${comentarioId}`),
};

// ═══════════════════════════════════════════════════════════════
// AVALIAÇÕES
// ═══════════════════════════════════════════════════════════════

export const avaliacoesAPI = {
  // A Rota para LISTAR deve apontar para o PromptController (se for lá que está)
  listar: (promptId) => api.get(`/prompts/${promptId}/avaliacoes`),
  // A Rota para SALVAR deve apontar para o FeedbackController
  avaliarPrompt: (promptId, nota, comentario, usuario) =>
    api.post(`/feedbacks/prompt/${promptId}`, {
      nota: nota,
      comentario: comentario,
      usuario: usuario
    }),
  editarAvaliacao: (promptId, avaliacaoId, novaAvaliacao) =>
    api.put(`/prompts/${promptId}/avaliacoes/${avaliacaoId}`, novaAvaliacao),
  deletar: (promptId, avaliacaoId) => api.delete(`/prompts/${promptId}/avaliacoes/${avaliacaoId}`),
};

// ═══════════════════════════════════════════════════════════════
// FAVORITOS
// ═══════════════════════════════════════════════════════════════

export const favoritosAPI = {

  adicionar: (promptId, usuario) => api.post(`/favoritos`, { promptId, usuario }),

  remover: (promptId, usuario) => api.delete(`/favoritos?promptId=${promptId}&usuario=${usuario}`),
  //  Volta para o formato /api/favoritos/NOME_USUARIO
  listar: (usuario) => api.get(`/favoritos/${usuario}`),

  //  Volta para o formato /api/favoritos/NOME_USUARIO/ID_PROMPT
  toggle: (usuario, promptId) => api.post(`/favoritos/${usuario}/${promptId}`),

  // Endpoints opcionais, usados apenas se expostos pelo backend:
  verificar: (promptId, usuario) => api.get(`/favoritos/verificar/${usuario}/${promptId}`),
};

// ═══════════════════════════════════════════════════════════════
// ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════════

export const statsAPI = {
  get: () => api.get('/stats'),
  porCategoria: () => api.get('/stats/categoria'),
  porAutor: () => api.get('/stats/autor'),
  maisUsados: () => api.get('/stats/mais-usados'),
};

// ═══════════════════════════════════════════════════════════════
// ARQUITETO VIRTUAL IA
// ═══════════════════════════════════════════════════════════════

export const iaAPI = {
  status: () => api.get('/ia/status'),
  modelos: () => api.get('/ia/models'),

  gerar: (categoria, descricao, arquivo = null) => {
    //  Agora SEMPRE empacotamos como FormData (evita o erro 415 e 404)
    const formData = new FormData();
    formData.append('categoria', categoria);
    formData.append('descricao', descricao);

    // Só anexa o arquivo se o usuário tiver escolhido um
    if (arquivo) {
      formData.append('arquivo', arquivo);
    }

    // Envia tudo para a rota única /gerar
    return api.post('/ia/gerar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  streamChat: async (chatId, mensagem, arquivo = null, modelo = null, signal = null, onMessage) => {
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('mensagem', mensagem);
    if (arquivo) {
      formData.append('arquivo', arquivo);
    }
    if (modelo) {
      formData.append('modelo', modelo);
    }

    const { default: keycloak } = await import('../keycloak.js');
    let headers = {};
    if (keycloak.authenticated) {
      await keycloak.updateToken(30);
      headers['Authorization'] = `Bearer ${keycloak.token}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

    try {
      const response = await fetch(`${baseUrl}/ia/chat/stream`, {
        method: 'POST',
        headers: headers,
        body: formData,
        signal: signal
      });

    if (!response.ok) {
      throw new Error('Erro na comunicação com a IA');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE separa eventos com dupla quebra de linha
      const events = buffer.split('\n\n');
      buffer = events.pop(); // Mantém o último trecho incompleto no buffer

      for (const event of events) {
        const lines = event.split('\n');
        let eventText = '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('data:')) {
            let text = line.substring(5);
            // IMPORTANTE: Não removemos o primeiro espaço porque o Spring WebFlux 
            // não envia o espaço de padding do SSE. Se removermos, ele engole os espaços reais!
            if (eventText.length > 0) {
              eventText += '\n'; // Múltiplas linhas 'data:' no mesmo evento viram \n
            }
            eventText += text;
          }
        }

        if (eventText.length > 0 || event.includes('data:')) {
          // Mesmo se text for vazio, dispara onMessage se for um evento válido para manter as quebras!
          onMessage(eventText);
        }
      }
    }
  } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream cancelado pelo usuário.');
        return;
      }
      throw error;
    }
  },
};


// ═══════════════════════════════════════════════════════════════
// NOTIFICAÇÕES (NOVO!)
// ═══════════════════════════════════════════════════════════════

export const notificacoesAPI = {
  listar: (usuario, page = 0, size = 20) =>
    api.get(`/notificacoes?usuario=${encodeURIComponent(usuario)}&page=${page}&size=${size}`),

  listarNaoLidas: (usuario) =>
    api.get(`/notificacoes/nao-lidas?usuario=${encodeURIComponent(usuario)}`),

  count: (usuario) =>
    api.get(`/notificacoes/count?usuario=${encodeURIComponent(usuario)}`),

  marcarLida: (id) =>
    api.put(`/notificacoes/${id}/marcar-lida`),

  marcarTodasLidas: (usuario) =>
    api.put(`/notificacoes/marcar-todas-lidas?usuario=${encodeURIComponent(usuario)}`),

  deletar: (id) =>
    api.delete(`/notificacoes/${id}`),
};

// ═══════════════════════════════════════════════════════════════
// DIAGNÓSTICO (FASE 1)
// ═══════════════════════════════════════════════════════════════

export const diagnosticoAPI = {
  salvar: (dados) => api.post('/diagnosticos', dados),
  buscarPorUsuario: (usuarioId) => api.get(`/diagnosticos/usuario/${encodeURIComponent(usuarioId)}`),
  buscarTodos: () => api.get('/diagnosticos/todos')
};

// ═══════════════════════════════════════════════════════════════
// FEEDBACK IA (FASE 4)
// ═══════════════════════════════════════════════════════════════

export const feedbackIaAPI = {
  salvar: (dados) => api.post('/feedbacks-ia', dados)
};

// ============================================
// HELPERS
// ============================================

export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/prompts');
    return {
      status: 'ok',
      message: 'API está respondendo',
      data: response.data
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Erro ao conectar com a API',
      error: error.message
    };
  }
};

export const formatPromptForAPI = (promptData) => {
  return {
    titulo: promptData.titulo || '',
    categoria: promptData.categoria || '',
    descricao: promptData.descricao || '',
    textoPrompt: promptData.textoPrompt || '',
    autor: promptData.autor || '',
    tags: promptData.tags || [],
    editadoPor: promptData.editadoPor || promptData.autor || '',
    motivoEdicao: promptData.motivoEdicao || ''
  };
};

export const handleAPIError = (error) => {
  if (error.response) {
    return {
      type: 'server_error',
      status: error.response.status,
      message: error.response.data.message || 'Erro no servidor',
      data: error.response.data
    };
  } else if (error.request) {
    return {
      type: 'network_error',
      message: 'Erro de conexão. Verifique se o backend está rodando',
      details: 'Backend não respondeu'
    };
  } else {
    return {
      type: 'client_error',
      message: error.message || 'Erro desconhecido',
      details: error
    };
  }
};

export default api;