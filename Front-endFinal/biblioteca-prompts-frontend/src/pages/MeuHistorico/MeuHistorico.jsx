import React, { useState, useEffect } from 'react';
import { History, Calendar, Filter, Trash2, Eye, Copy } from 'lucide-react';
import { historicoAPI } from '../../services/api';
import './MeuHistorico.css';

// Atualizamos as Props recebidas do App.jsx
const MeuHistorico = ({ nomeUsuario, toast, aoAbrir, refreshTrigger }) => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroData, setFiltroData] = useState('todos');

  const categorias = [
    'Documentação', 'Arquitetura', 'Desenvolvimento',
    'Testes', 'DevOps', 'Banco de Dados', 'Segurança', 'Onboarding'
  ];

  // Adicionamos o refreshTrigger aqui para a tela atualizar sozinha após uma edição
  useEffect(() => {
    carregarHistorico();
  }, [filtroCategoria, filtroData, refreshTrigger]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      let response;

      if (filtroCategoria) {
        response = await historicoAPI.buscarPorCategoria(nomeUsuario, filtroCategoria);
      } else if (filtroData !== 'todos') {
        const { dataInicio, dataFim } = calcularPeriodo(filtroData);
        response = await historicoAPI.buscarComFiltro(nomeUsuario, dataInicio, dataFim);
      } else {
        response = await historicoAPI.listar(nomeUsuario);
      }

      setHistorico(response.data.conteudo || response.data.content || response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar histórico',
        sticky: true
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularPeriodo = (periodo) => {
    const hoje = new Date();
    let dataInicio = new Date();

    switch (periodo) {
      case 'hoje':
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        dataInicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        dataInicio.setMonth(hoje.getMonth() - 1);
        break;
      default:
        dataInicio = null;
    }

    return {
      dataInicio: dataInicio?.toISOString(),
      dataFim: hoje.toISOString()
    };
  };

  const deletarItem = async (id) => {
    try {
      await historicoAPI.deletar(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Item removido do histórico',
        sticky: true
      });
      carregarHistorico();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao remover item',
        life: 3000
      });
    }
  };

  const limparTudo = async () => {
    try {
      await historicoAPI.limparTudo(nomeUsuario);
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Histórico limpo com sucesso!',
        sticky: true
      });
      carregarHistorico();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao limpar histórico',
        sticky: true
      });
    }
  };

  const copiarPrompt = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.current?.show({
        severity: 'info',
        summary: 'Copiado',
        detail: 'Prompt copiado para área de transferência!',
        sticky: true
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao copiar',
        sticky: true
      });
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="meu-historico">

      {/* HEADER */}
      <div className="historico-header">
        <div className="header-title">
          <History size={32} />
          <div>
            <h1>Meu Histórico</h1>
            <p>Prompts que você já utilizou</p>
          </div>
        </div>

        {historico.length > 0 && (
          <button className="btn-danger" onClick={limparTudo}>
            <Trash2 size={18} />
            Limpar Tudo
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="historico-filtros">
        <div className="filtro-grupo">
          <Calendar size={18} />
          <select
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos os períodos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mês</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <Filter size={18} />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {(filtroCategoria || filtroData !== 'todos') && (
          <button
            className="btn-ghost"
            onClick={() => {
              setFiltroCategoria('');
              setFiltroData('todos');
            }}
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* LISTA DE HISTÓRICO */}
      <div className="historico-lista">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando histórico...</p>
          </div>
        ) : historico.length === 0 ? (
          <div className="empty-state">
            <History size={64} />
            <h3>Nenhum prompt usado ainda</h3>
            <p>Quando você usar prompts, eles aparecerão aqui para acesso rápido.</p>
          </div>
        ) : (
          historico.map((item) => (
            <div key={item.id} className="historico-card">
              <div className="card-header">
                <div className="card-info">
                  <h3>{item.tituloPrompt}</h3>
                  <div className="card-meta">
                    <span className="categoria">{item.categoriaPrompt}</span>
                    <span className="data">{formatarData(item.dataUso)}</span>
                  </div>
                </div>

                <div className="card-actions">
                  {/*  Agora chamamos a função 'aoAbrir' */}
                  <button
                    className="btn-icon"
                    onClick={() => aoAbrir({ id: item.promptId, titulo: item.tituloPrompt, categoria: item.categoriaPrompt })}
                    title="Ver detalhes do Prompt"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => copiarPrompt(item.textoPrompt)}
                    title="Copiar prompt"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => deletarItem(item.id)}
                    title="Remover do histórico"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="card-descricao">
                {item.descricao}
              </div>

              {item.observacao && (
                <div className="card-observacao">
                  <strong>Observação:</strong> {item.observacao}
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="card-tags">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default MeuHistorico;