import React, { useState, useEffect } from 'react';
import { FileText, Star, TrendingUp, Edit, Trash2, Eye, BarChart2 } from 'lucide-react';
import { promptsAPI } from '../../services/api';
import './MeusPrompts.css';

const MeusPrompts = ({ nomeUsuario, aoAbrir, setPromptSelecionado, setModalAberto, onAbrirEditar, toast, refreshTrigger }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordenacao, setOrdenacao] = useState('recentes');

  useEffect(() => {
    carregarMeusPrompts();
  }, [ordenacao, nomeUsuario, refreshTrigger]);

  const carregarMeusPrompts = async () => {
    setLoading(true);
    try {
      const response = await promptsAPI.listarMeusPrompts(0, 50, nomeUsuario);

      // Extrai a lista do objeto de paginação do Spring
      let listaMeusPrompts = response.data.conteudo || [];

      // Lógica de Ordenação no Front-end
      switch (ordenacao) {
        case 'populares':
          listaMeusPrompts.sort((a, b) => (b.vezesUsado || 0) - (a.vezesUsado || 0));
          break;
        case 'avaliacao':
          listaMeusPrompts.sort((a, b) => (b.mediaAvaliacao || 0) - (a.mediaAvaliacao || 0));
          break;
        case 'recentes':
          listaMeusPrompts.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
          break;
        default:
          break;
      }

      setPrompts([...listaMeusPrompts]);
    } catch (error) {
      console.error("Erro ao carregar/ordenar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para o ícone de Olho (Visualizar)
  const abrirVisualizacao = (prompt) => {
    setPromptSelecionado(prompt);
    setModalAberto(true);
  };

  const deletarPrompt = async (id) => {
    try {
      await promptsAPI.deletar(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Prompt deletado com sucesso',
        sticky: true
      });
      carregarMeusPrompts();
    } catch (error) {
      console.error('Erro ao deletar prompt:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao deletar prompt',
        sticky: true
      });
    }
  };

  const calcularEstatisticas = () => {
    const totalPrompts = prompts.length;
    // Usando os nomes de variáveis do Java: vezesUsado e mediaAvaliacao
    const totalUsos = prompts.reduce((sum, p) => sum + (p.vezesUsado || 0), 0);
    const mediaAvaliacoes = prompts.length > 0
      ? prompts.reduce((sum, p) => sum + (p.mediaAvaliacao || 0), 0) / prompts.length
      : 0;

    return { totalPrompts, totalUsos, mediaAvaliacoes };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="meus-prompts">

      <div className="prompts-header">
        <div className="header-title">
          <FileText size={32} />
          <div>
            <h1>Meus Prompts</h1>
            <p>Prompts que você criou e compartilhou</p>
          </div>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalPrompts}</span>
            <span className="stat-label">Prompts Criados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalUsos}</span>
            <span className="stat-label">Usos Totais</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>
            <Star size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.mediaAvaliacoes.toFixed(1)}⭐</span>
            <span className="stat-label">Média de Avaliações</span>
          </div>
        </div>
      </div>

      <div className="prompts-filtros">
        <div className="filtro-grupo">
          <BarChart2 size={18} />
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="filtro-select"
          >
            <option value="recentes">Mais recentes</option>
            <option value="populares">Mais usados</option>
            <option value="avaliacao">Melhor avaliados</option>
          </select>
        </div>
      </div>

      <div className="prompts-lista">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando seus prompts...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>Você ainda não criou nenhum prompt</h3>
            <p>Crie seu primeiro prompt e compartilhe com a equipe!</p>
          </div>
        ) : (
          prompts.map((prompt) => (
            <div key={prompt.id} className="prompt-card">
              <div className="card-header">
                <div className="card-info">
                  <h3>{prompt.titulo}</h3>
                  <span className="categoria">{prompt.categoria}</span>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => aoAbrir(prompt)}
                    title="Ver detalhes"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onAbrirEditar(prompt)}
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => deletarPrompt(prompt.id)}
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="card-descricao">
                {prompt.descricao}
              </div>

              <div className="card-stats">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{prompt.vezesUsado || 0} usos</span>
                </div>
                <div className="stat-item">
                  <Star size={16} />
                  <span>{prompt.mediaAvaliacao?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="stat-item">
                  <span className="data">
                    {prompt.dataCriacao ? new Date(prompt.dataCriacao).toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                </div>
              </div>

              {prompt.tags && prompt.tags.length > 0 && (
                <div className="card-tags">
                  {prompt.tags.map((tag, index) => (
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

export default MeusPrompts;