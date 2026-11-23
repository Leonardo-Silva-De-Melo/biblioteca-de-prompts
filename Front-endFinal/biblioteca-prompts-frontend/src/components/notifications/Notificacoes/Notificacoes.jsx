import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { notificacoesAPI } from '../../../services/api';
import './Notificacoes.css';

//  Adicione o 'toast' nas props
const Notificacoes = ({ nomeUsuario, toast, prompts, aoAbrir }) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas'); // todas, nao-lidas


  useEffect(() => {
    carregarNotificacoes();
  }, [filtro]);

  const handleLinkClick = async (e, notif) => {
    e.preventDefault();
    if (notif.linkAcao && (notif.linkAcao.includes('/prompts/') || notif.linkAcao.includes('/prompt/'))) {
      const id = parseInt(notif.linkAcao.split('/').pop());
      if (isNaN(id)) return;

      let promptTarget = prompts?.find(p => p.id === id);

      if (!promptTarget) {
        try {
          const { promptsAPI } = await import('../../../services/api');
          const res = await promptsAPI.buscarPorId(id);
          promptTarget = res.data;
        } catch (err) {
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Prompt não encontrado ou removido.' });
          return;
        }
      }

      if (promptTarget && aoAbrir) {
        aoAbrir(promptTarget);
      }
    }
  };

  const carregarNotificacoes = async () => {
    setLoading(true);
    try {
      let response;

      if (filtro === 'nao-lidas') {
        response = await notificacoesAPI.listarNaoLidas(nomeUsuario);
        setNotificacoes(response.data);
      } else {
        response = await notificacoesAPI.listar(nomeUsuario);
        setNotificacoes(response.data.conteudo || response.data.content || response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar notificações.', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id) => {
    try {
      await notificacoesAPI.marcarLida(id);
      // Ajuste a chamada do Toast
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Notificação marcada como lida!', life: 2000 });
      carregarNotificacoes();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao marcar como lida.', life: 3000 });
    }
  };

  const marcarTodasLidas = async () => {
    try {
      const response = await notificacoesAPI.marcarTodasLidas(nomeUsuario);
      // Ajuste a chamada do Toast
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: response.data.mensagem || 'Todas lidas!', life: 3000 });
      carregarNotificacoes();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao marcar todas como lidas.', life: 3000 });
    }
  };

  const deletar = async (id) => {
    try {
      await notificacoesAPI.deletar(id);
      // Ajuste a chamada do Toast
      toast.current?.show({ severity: 'success', summary: 'Removida', detail: 'Notificação removida com sucesso!', life: 2000 });
      carregarNotificacoes();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover notificação.', life: 3000 });
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diff = agora - data;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `${minutos}min atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias < 7) return `${dias}d atrás`;

    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: data.getFullYear() !== agora.getFullYear() ? 'numeric' : undefined
    });
  };

  const getIconeNotificacao = (tipo) => {
    const icones = {
      'NOVO_PROMPT': '📝',
      'PROMPT_EDITADO': '✏️',
      'COMENTARIO': '💬',
      'RESPOSTA': '↩️',
      'AVALIACAO': '⭐'
    };
    return icones[tipo] || '🔔';
  };

  return (
    <div className="notificacoes-page">

      {/* HEADER */}
      <div className="notificacoes-header">
        <div className="header-title">
          <Bell size={32} />
          <div>
            <h1>Notificações</h1>
            <p>Mantenha-se atualizado sobre suas atividades</p>
          </div>
        </div>

        {notificacoes.length > 0 && (
          <button className="btn-marcar-todas" onClick={marcarTodasLidas}>
            <CheckCheck size={18} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="notificacoes-filtros">
        <button
          className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas
        </button>
        <button
          className={`filtro-btn ${filtro === 'nao-lidas' ? 'active' : ''}`}
          onClick={() => setFiltro('nao-lidas')}
        >
          Não lidas
        </button>
      </div>

      {/* LISTA */}
      <div className="notificacoes-lista">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando notificações...</p>
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} />
            <h3>Nenhuma notificação</h3>
            <p>
              {filtro === 'nao-lidas'
                ? 'Você está em dia! Não há notificações não lidas.'
                : 'Você ainda não tem notificações.'}
            </p>
          </div>
        ) : (
          notificacoes.map((notif) => (
            <div
              key={notif.id}
              className={`notificacao-card ${notif.lida ? 'lida' : 'nao-lida'}`}
            >
              <div className="notif-icon">
                {getIconeNotificacao(notif.tipo)}
              </div>

              <div className="notif-content">
                <div className="notif-header">
                  <h3>{notif.titulo}</h3>
                  <span className="notif-data">{formatarData(notif.dataCriacao)}</span>
                </div>
                <p className="notif-mensagem">{notif.mensagem}</p>
                {notif.linkAcao && (
                  <a href={notif.linkAcao} className="notif-link" onClick={(e) => handleLinkClick(e, notif)}>
                    Ver detalhes →
                  </a>
                )}
              </div>

              <div className="notif-actions">
                {!notif.lida && (
                  <button
                    className="btn-icon"
                    onClick={() => marcarComoLida(notif.id)}
                    title="Marcar como lida"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  className="btn-icon danger"
                  onClick={() => deletar(notif.id)}
                  title="Remover"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {!notif.lida && <div className="notif-badge"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notificacoes;