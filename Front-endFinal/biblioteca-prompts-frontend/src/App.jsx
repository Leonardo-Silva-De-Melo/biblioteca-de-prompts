import { useState, useEffect } from 'react';
import './theme.css';
import './App.css';

// Layout
import Header from './components/layout/Header/Header';
import SideMenu from './components/layout/SideMenu/SideMenu';

// Componentes de Prompt
import FormularioPrompt from './components/prompts/FormularioPrompt/FormularioPrompt';
import EditarPrompt from './components/prompts/EditarPrompt/EditarPrompt';
import ModalIA from './components/prompts/ModalIA/ModalIA';
import ConfirmarExclusao from './components/ui/ConfirmarExclusao/ConfirmarExclusao';
import ChatWidget from './components/ui/ChatWidget/ChatWidget';

// Componentes de Feedback
import DashboardEstatisticas from './components/feedback/DashboardEstatisticas/DashboardEstatisticas';
import FormularioFeedback from './components/feedback/FormularioFeedback/FormularioFeedback';

// Componentes de Notificações
import Notificacoes from './components/notifications/Notificacoes/Notificacoes';

// Páginas
import Favoritos from './pages/Favoritos/Favoritos';
import MeusPrompts from './pages/MeusPrompts/MeusPrompts';
import MeuHistorico from './pages/MeuHistorico/MeuHistorico';
import PaginaAjuda from './pages/Ajuda/PaginaAjuda';
import SobreSistema from './pages/SobreSistema/SobreSistema';
import Diagnostico from './pages/Diagnostico/Diagnostico';
import ResultadosDiagnostico from './pages/Admin/ResultadosDiagnostico/ResultadosDiagnostico';

// Hooks customizados
import { usePrompts } from './hooks/usePrompts';
import { useComentarios } from './hooks/useComentarios';
import { useHistorico } from './hooks/useHistorico';
import { useFavoritos } from './hooks/useFavoritos';

// Utilitários e Constantes
import { formatarData, renderizarEstrelas } from './utils/formatadores';
import { NOME_USUARIO, CATEGORIAS } from './config/constants';

// Bibliotecas
import { Toast } from 'primereact/toast';
import { Heart, Search, Home, Library, History, Menu as MenuIcon } from 'lucide-react';
import { Paginator } from 'primereact/paginator';
import { createPortal } from 'react-dom';

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  // ── Navegação e UI global ──────────────────────────────────────────────────
  const [telaAtual, setTelaAtual] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ── Modais de CRUD de Prompt ───────────────────────────────────────────────
  const [showFormulario, setShowFormulario] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showConfirmarExclusao, setShowConfirmarExclusao] = useState(false);
  const [promptParaDeletar, setPromptParaDeletar] = useState(null);
  const [isDeletando, setIsDeletando] = useState(false);

  // ── Modal de escolha de IA ─────────────────────────────────────────────────
  const [showEscolhaIA, setShowEscolhaIA] = useState(false);
  const [showModalIA, setShowModalIA] = useState(false);

  // ── Controle do Formulário de Diagnóstico (Fase 1) ────────────────────────
  const [precisaDiagnostico, setPrecisaDiagnostico] = useState(false);
  const [verificandoDiagnostico, setVerificandoDiagnostico] = useState(true);

  // ── Inicialização do tema salvo e Interceptador de Logout ─────────────────
  useEffect(() => {
    // Tema
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Interceptador de Logout do Open WebUI
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'logout') {
      if (window._keycloak) {
        // Desloga do Keycloak com segurança, passando os tokens e volta pro login
        window._keycloak.logout({ redirectUri: 'http://localhost:3001' });
      }
    }
  }, []);

  // ── Checagem de Diagnóstico Prévio ─────────────────────────────────────────
  useEffect(() => {
    const checkDiagnostico = async () => {
      try {
        const { diagnosticoAPI } = await import('./services/api');
        await diagnosticoAPI.buscarPorUsuario(NOME_USUARIO);
        // Se chegou aqui com sucesso (200), significa que o usuário já respondeu!
        setPrecisaDiagnostico(false);
      } catch (error) {
        // Se der 404 (Não achou) ou 500 (Tabela não existe ainda), mostramos o form!
        console.warn('[API] Erro ao verificar diagnóstico (Forçando exibição):', error);
        setPrecisaDiagnostico(true);
      } finally {
        setVerificandoDiagnostico(false);
      }
    };
    checkDiagnostico();
  }, [NOME_USUARIO]);

  // ── Hooks de domínio ──────────────────────────────────────────────────────
  const prompts$ = usePrompts();
  const comentarios$ = useComentarios();
  const historico$ = useHistorico();
  const favoritos$ = useFavoritos(
    prompts$.favoritos,
    prompts$.setFavoritos,
    prompts$.setStats,
    prompts$.toast
  );

  // ── Listener de Erro Global da API ─────────────────────────────────────────
  useEffect(() => {
    const handleApiError = (event) => {
      prompts$.toast.current?.show({
        severity: 'error',
        summary: 'Erro de Conexão',
        detail: event.detail.message,
        life: 5000
      });
    };
    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, [prompts$.toast]);

  // Atalhos para não poluir o JSX
  const { toast, prompts, stats, promptSelecionado, setPromptSelecionado,
    showModal, favoritos, loading, error, first, rows, totalRecords,
    busca, setBusca, categoriaFiltro, hoverNota, setHoverNota,
    refreshTrigger, carregarDados, abrirPrompt, copiarPrompt,
    fecharModal: fecharModalPrompt, onPageChange, toggleCategoria,
    getCategoriasComCount, dispararAtualizacaoGeral, enviarAvaliacaoRapida,
  } = prompts$;

  const { promptsFavoritos, toggleFavorito } = favoritos$;

  const {
    comentarios, novoComentario, setNovoComentario, showComentarios, setShowComentarios,
    showConfirmarExclusaoComentario, setShowConfirmarExclusaoComentario,
    showModalEdicaoComentario, setShowModalEdicaoComentario,
    comentarioEmEdicao, textoEdicaoComentario, setTextoEdicaoComentario,
    carregarComentarios, adicionarComentario,
    abrirConfirmarExclusaoComentario, confirmarExclusaoComentario,
    abrirModalEdicaoComentario, salvarEdicaoComentario,
    resetarComentarios,
  } = comentarios$;

  const {
    historico, showHistorico, setShowHistorico,
    showModalVersao, versaoVisualizando, fecharModalVersao,
    showModalEditarVersao, versaoEmEdicao,
    textoMotivoEdicao, setTextoMotivoEdicao,
    textoVersaoEmEdicao, setTextoVersaoEmEdicao, fecharModalEditarVersao,
    showModalExcluirVersao, versaoParaExcluir, fecharModalExcluirVersao,
    carregarHistoricoVersoes, verVersaoCompleta,
    abrirModalEditarVersao, salvarEdicaoVersao,
    abrirModalExcluirVersao, confirmarExclusaoVersao,
    resetarHistorico,
  } = historico$;

  // ── Wrappers que conectam os hooks entre si ────────────────────────────────

  const handleAbrirPrompt = (prompt) => {
    resetarComentarios();
    resetarHistorico();
    abrirPrompt(prompt, carregarComentarios, carregarHistoricoVersoes);
  };

  const fecharModal = () => {
    fecharModalPrompt();
    resetarComentarios();
    resetarHistorico();
  };

  const abrirEditar = () => {
    prompts$.setShowModal(false);
    setShowEditar(true);
  };

  const fecharEditar = () => {
    setShowEditar(false);
    setPromptSelecionado(null);
    document.body.style.overflow = 'auto';
  };

  const abrirConfirmarExclusao = () => {
    setPromptParaDeletar(promptSelecionado);
    setShowConfirmarExclusao(true);
    fecharModalPrompt();
  };

  const fecharConfirmarExclusao = () => {
    setShowConfirmarExclusao(false);
    setPromptParaDeletar(null);
  };

  const confirmarExclusao = async () => {
    if (!promptParaDeletar) return;
    setIsDeletando(true);
    try {
      const { promptsAPI } = await import('./services/api');
      await promptsAPI.deletar(promptParaDeletar.id);
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Prompt deletado com sucesso', sticky: true });
      fecharConfirmarExclusao();
      fecharModal();
      carregarDados();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar prompt', sticky: true });
    } finally {
      setIsDeletando(false);
    }
  };

  const handleFormularioSuccess = () => {
    setShowFormulario(false);
    carregarDados();
    if (telaAtual !== 'meus-prompts') setTelaAtual('meus-prompts');
  };

  // ── Estados de carregamento e erro ────────────────────────────────────────

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando a Biblioteca de Prompts...</p>
      </div>
    );
  }

  if (verificandoDiagnostico) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verificando pendências...</p>
      </div>
    );
  }

  if (precisaDiagnostico) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-x-hidden" style={{ backgroundColor: '#0f172a' }}>
        <Toast ref={toast} position="top-right" />
        <div className="w-full">
          <Diagnostico
            nomeUsuario={NOME_USUARIO}
            onComplete={() => setPrecisaDiagnostico(false)}
            toast={toast}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Erro ao Conectar</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={carregarDados}>
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="App bg-slate-50 min-h-screen">
      <Toast ref={toast} position="top-right" />

      {/* ── Layout ─────────────────────────────────────────────────────── */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        telaAtual={telaAtual}
        setTelaAtual={setTelaAtual}
      />
      <Header
        nomeUsuario={NOME_USUARIO}
        onAbrirMenu={() => setIsMenuOpen(true)}
        onNotificacoes={() => setTelaAtual('notificacoes')}
      />

      <main className="container">

        {/* ── Tela: Dashboard ──────────────────────────────────────────── */}
        {telaAtual === 'dashboard' && (
          <>
            <div style={{ marginTop: '6rem' }}>
              <h2 className="section-title">📂 Dashboard</h2>
            </div>

            {/* Cards de Estatísticas */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-value">{stats.totalPrompts}</div>
                  <div className="stat-label">Prompts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">{stats.totalUsosSemana}</div>
                  <div className="stat-label">Usos Esta Semana</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{stats.contribuidoresAtivos}</div>
                  <div className="stat-label">Contribuidores Ativos</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-value">{stats?.totalVisualizacoesReais || 0}</div>
                  <div className="stat-label">Visualizações</div>
                </div>
              </div>
            )}

            {/* Acesso Rápido aos Favoritos */}
            <section className="quick-favs-section" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <Heart size={24} color="#ef4444" fill="#ef4444" /> Meus Favoritos
                </h2>
                {favoritos.length > 0 && (
                  <button onClick={() => setTelaAtual('favoritos')} className="btn-ver-todos-destaque">
                    Ver minha biblioteca ({favoritos.length}) <span style={{ fontSize: '1.1rem' }}>&rarr;</span>
                  </button>
                )}
              </div>

              <div className="quick-favs-grid">
                {favoritos.length > 0 ? (
                  prompts.filter(p => favoritos.includes(p.id)).slice(0, 4).map(fav => (
                    <div key={fav.id} className="fav-mini-card" onClick={() => handleAbrirPrompt(fav)}>
                      <div className="fav-mini-icon">
                        <span style={{ fontSize: '1.2rem' }}>
                          {CATEGORIAS.find(cat => cat.nome === fav.categoria)?.icone || '💡'}
                        </span>
                      </div>
                      <div className="fav-mini-info">
                        <strong>{fav.titulo}</strong>
                        <span>{fav.categoria}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="fav-empty-state-mini">
                    <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Sua biblioteca pessoal está vazia.</p>
                    <button
                      onClick={() => document.getElementById('lista-prompts')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-call-to-favorito"
                    >
                      Explore a lista abaixo e <span className="highlight-text">clique no coração <Heart size={18} fill="#ef4444" color="#ef4444" className="pulse-heart-inline" /></span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* CTA: Arquiteto Virtual e Adicionar Manual */}
            <section className="cta-section" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
              <div style={{
                background: 'linear-gradient(to right, #1e3a8a, #312e81)',
                borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                  Precisa de uma Especificação Técnica?
                </h2>
                <p style={{ color: '#bfdbfe', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
                  Utilize nosso Assistente de IA para gerar documentação no padrão da UERJ ou contribua com seus próprios prompts manualmente.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }} className="sm:flex-row">
                  <button
                    onClick={() => setShowEscolhaIA(true)}
                    style={{
                      background: 'linear-gradient(to right, #06b6d4, #3b82f6)', color: 'white', padding: '1rem 2rem',
                      borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center',
                      gap: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '1.5rem' }}>✨</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Recomendado</span>
                      <span>Gerar com Arquiteto Virtual</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowFormulario(true)}
                    style={{
                      background: 'transparent', color: '#bfdbfe', padding: '1rem 2rem', borderRadius: '12px',
                      fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px',
                      border: '2px solid rgba(191, 219, 254, 0.3)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(191, 219, 254, 0.1)'; e.currentTarget.style.color = 'white'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#bfdbfe'; }}
                  >
                    <span>📝</span> Adicionar Manualmente
                  </button>
                </div>
              </div>
            </section>

            {/* Categorias */}
            <section>
              <h2 className="section-title">📂 Categorias de Prompts</h2>
              <div className="categories-grid">
                {getCategoriasComCount().map(cat => (
                  <div
                    key={cat.nome}
                    className={`category-card ${categoriaFiltro === cat.nome ? 'active' : ''}`}
                    onClick={() => toggleCategoria(cat.nome)}
                  >
                    <div className="category-icon">{cat.icone}</div>
                    <div className="category-title">{cat.nome}</div>
                    <div className="category-count">{cat.count} prompts</div>
                  </div>
                ))}
              </div>

              {/* Busca */}
              <section className="search-container-right">
                <div className="search-box-modern">
                  <Search size={20} className="search-icon-left" />
                  <input
                    type="text"
                    className="search-input-modern"
                    placeholder="Buscar prompts... (ex: crud, api, testes)"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                  />
                </div>
              </section>
            </section>

            {/* Lista de Prompts */}
            <section id="lista-prompts">
              <h2 className="section-title">
                {categoriaFiltro ? `📂 ${categoriaFiltro}` : '🔥 Prompts Mais Usados Esta Semana'}
              </h2>

              {prompts.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <p>Nenhum prompt encontrado</p>
                  <button className="btn btn-secondary" onClick={() => { setBusca(''); toggleCategoria(''); }}>
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="prompts-list">
                  {prompts.map(prompt => (
                    <div key={prompt.id} className="prompt-item" onClick={() => handleAbrirPrompt(prompt)}>
                      <div className="prompt-info">
                        <div className="prompt-title">{prompt.titulo}</div>
                        <div className="prompt-meta">
                          <span>👁️ {prompt.vezesUsado} visualizações</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {renderizarEstrelas(prompt.mediaAvaliacao)}
                            <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>
                              {Number(prompt.mediaAvaliacao || 0).toFixed(1)}
                            </strong>
                          </span>
                          <span>👤 {prompt.autor}</span>
                          {prompt.dataCriacao && <span>📅 {new Date(prompt.dataCriacao).toLocaleDateString('pt-BR')}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); toggleFavorito(prompt.id); }}
                          style={{
                            background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0', width: '40px', height: '40px', minWidth: '40px', transition: 'transform 0.2s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          title={favoritos.includes(prompt.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                        >
                          <Heart
                            size={24}
                            fill={favoritos.includes(prompt.id) ? '#ef4444' : 'transparent'}
                            color={favoritos.includes(prompt.id) ? '#ef4444' : '#94a3b8'}
                          />
                        </button>
                        <span className="badge">{prompt.categoria}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {totalRecords > rows && (
              <div className="paginator-wrapper">
                <Paginator
                  first={first}
                  rows={rows}
                  totalRecords={totalRecords}
                  onPageChange={onPageChange}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                />
              </div>
            )}
          </>
        )}

        {/* ── Telas Secundárias ────────────────────────────────────────── */}
        {telaAtual === 'favoritos' && (
          <div style={{ marginTop: '6rem' }}>
            <Favoritos
              prompts={promptsFavoritos}
              aoRemover={toggleFavorito}
              aoAbrir={handleAbrirPrompt}
              categorias={CATEGORIAS}
            />
          </div>
        )}

        {telaAtual === 'notificacoes' && (
          <Notificacoes nomeUsuario={NOME_USUARIO} toast={toast} prompts={prompts} aoAbrir={handleAbrirPrompt} />
        )}

        {telaAtual === 'historico' && (
          <MeuHistorico
            nomeUsuario={NOME_USUARIO}
            toast={toast}
            refreshTrigger={refreshTrigger}
            aoAbrir={handleAbrirPrompt}
          />
        )}

        {telaAtual === 'meus-prompts' && (
          <MeusPrompts
            nomeUsuario={NOME_USUARIO}
            aoAbrir={handleAbrirPrompt}
            setPromptSelecionado={setPromptSelecionado}
            setModalAberto={() => { }}
            onAbrirEditar={p => { setPromptSelecionado(p); setShowEditar(true); }}
            toast={toast}
            refreshTrigger={refreshTrigger}
          />
        )}

        {telaAtual === 'ajuda' && (
          <div style={{ marginTop: '6rem' }}>
            <PaginaAjuda />
          </div>
        )}

        {telaAtual === 'sobre' && <SobreSistema />}
        {telaAtual === 'feedback' && <FormularioFeedback nomeUsuario={NOME_USUARIO} />}
        {telaAtual === 'admin-stats' && <DashboardEstatisticas stats={stats} nomeUsuario={NOME_USUARIO} />}
        {telaAtual === 'admin-resultados' && <ResultadosDiagnostico />}

      </main>

      <footer className="footer">
        <div className="container">
          <p><strong>Biblioteca de Prompts UERJ</strong> - Integração de IA ao Ciclo de Desenvolvimento</p>
          <p>DGTI - Diretoria Geral de Tecnologia da Informação</p>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            v1.0.0 | {prompts.length} prompts disponíveis
          </p>
        </div>
      </footer>

      {/* ── Modal: Visualização do Prompt ────────────────────────────────── */}
      {showModal && promptSelecionado && (
        <div className="modal-overlay active" onClick={fecharModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <div>
                <h3 className="modal-title">{promptSelecionado.titulo}</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {promptSelecionado.categoria} • {promptSelecionado.autor}
                </p>
              </div>
              <button className="close-btn" onClick={fecharModal}>✕</button>
            </div>

            <div className="modal-tabs">
              <button className={`tab ${!showHistorico && !showComentarios ? 'active' : ''}`}
                onClick={() => { setShowHistorico(false); setShowComentarios(false); }}>
                📋 Prompt
              </button>
              <button className={`tab ${showHistorico ? 'active' : ''}`}
                onClick={() => { setShowHistorico(true); setShowComentarios(false); }}>
                📜 Histórico ({historico.length})
              </button>
              <button className={`tab ${showComentarios ? 'active' : ''}`}
                onClick={() => { setShowHistorico(false); setShowComentarios(true); }}>
                💬 Comentários ({comentarios.length})
              </button>
            </div>

            <div className="modal-body">

              {/* Tab: Prompt */}
              {!showHistorico && !showComentarios && (
                <>
                  <div className="prompt-detail">
                    <h4>Prompt</h4>
                    <p>{promptSelecionado.descricao || 'Sem descrição'}</p>
                  </div>

                  <div className="prompt-detail">
                    <h4>Descrição</h4>
                    <div className="prompt-text">{promptSelecionado.textoPrompt}</div>
                  </div>

                  {promptSelecionado.tags?.length > 0 && (
                    <div className="prompt-detail">
                      <h4>Tags</h4>
                      <div className="prompt-tags">
                        {promptSelecionado.tags.map((tag, i) => (
                          <span key={i} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prompt-meta" style={{ justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                    <span>👁️ {promptSelecionado.vezesUsado} visualizações</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(star => {
                          const mediaParaExibir = hoverNota > 0 ? hoverNota : (promptSelecionado.mediaAvaliacao || 0);
                          const isAtiva = star <= Math.round(Number(mediaParaExibir));
                          return (
                            <span key={star}
                              onClick={() => enviarAvaliacaoRapida(star)}
                              onMouseEnter={() => setHoverNota(star)}
                              onMouseLeave={() => setHoverNota(0)}
                              style={{ color: isAtiva ? '#f59e0b' : '#475569', fontSize: '1.4rem', cursor: 'pointer', transition: 'transform 0.1s', transform: hoverNota === star ? 'scale(1.2)' : 'scale(1)' }}
                            >★</span>
                          );
                        })}
                      </div>
                      <strong style={{ color: '#f59e0b', fontSize: '1.1rem', minWidth: '25px' }}>
                        {Number(promptSelecionado.mediaAvaliacao || 0).toFixed(1)}
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ({promptSelecionado.totalAvaliacoes || 0} avaliações)
                      </span>
                    </span>
                    <span>📅 {formatarData(promptSelecionado.dataCriacao)}</span>
                  </div>

                  <div className="action-buttons">
                    <button className="btn btn-primary" onClick={copiarPrompt}>📋 Copiar</button>
                    <button className="btn btn-warning" onClick={abrirEditar}>✏️ Editar</button>
                    <button className="btn btn-danger" onClick={abrirConfirmarExclusao}>🗑️ Excluir</button>
                  </div>
                </>
              )}

              {/* Tab: Histórico de Versões */}
              {showHistorico && (
                <div className="historico-container">
                  {historico.length === 0 ? (
                    <div className="empty-state"><p>Este prompt ainda não possui histórico de edições.</p></div>
                  ) : (
                    <div className="historico-list">
                      {[...historico].sort((a, b) => a.numeroVersao - b.numeroVersao).map((versao, index, arr) => {
                        const isAtual = index === arr.length - 1;
                        const isOriginal = versao.numeroVersao === 1;
                        return (
                          <div key={versao.id} className="historico-item">
                            <div className="historico-header">
                              <span className="historico-versao">
                                Versão {versao.numeroVersao}
                                {isAtual && <span className="badge-current">Atual</span>}
                                {isOriginal && !isAtual && <span className="badge-current" style={{ backgroundColor: '#64748b' }}>Original</span>}
                              </span>
                              <span className="historico-data">{formatarData(versao.dataEdicao)}</span>
                            </div>
                            <div className="historico-info">
                              <p><strong>👤 Editado por:</strong> {versao.editadoPor || 'Desconhecido'}</p>
                              {versao.motivoEdicao && <p><strong>📝 Motivo:</strong> {versao.motivoEdicao}</p>}
                            </div>
                            <div className="historico-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => verVersaoCompleta(promptSelecionado.id, versao.numeroVersao, toast)}>
                                👁️ Ver Versão
                              </button>
                              <button className="btn btn-warning btn-sm" onClick={() => abrirModalEditarVersao(versao)}>
                                ✏️ Editar
                              </button>
                              {!isOriginal && (
                                <button className="btn btn-danger btn-sm" onClick={() => abrirModalExcluirVersao(versao)}>
                                  🗑️ Excluir
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Comentários */}
              {showComentarios && (
                <div className="comentarios-container">
                  <div className="novo-comentario">
                    <h4>Adicionar Comentário</h4>
                    <textarea className="comentario-input" placeholder="Escreva seu comentário..."
                      value={novoComentario} onChange={e => setNovoComentario(e.target.value)} rows="3" />
                    <button className="btn btn-primary btn-sm"
                      onClick={() => adicionarComentario(promptSelecionado.id, NOME_USUARIO, toast)}
                      disabled={!novoComentario.trim()}>
                      💬 Comentar
                    </button>
                  </div>

                  {comentarios.length === 0 ? (
                    <p className="empty-state">Seja o primeiro a comentar!</p>
                  ) : (
                    <div className="comentarios-list">
                      {comentarios.map(c => (
                        <div key={c.id} className="comentario-item">
                          <div className="comentario-header">
                            <strong>{c.autor}</strong>
                            <span className="comentario-data">{formatarData(c.dataCriacao)}</span>
                          </div>
                          <p className="comentario-texto">{c.texto}</p>
                          {c.autor?.trim().toLowerCase() === NOME_USUARIO?.trim().toLowerCase() && (
                            <div className="comentario-acoes-bottom">
                              <button className="btn btn-warning btn-sm" onClick={() => abrirModalEdicaoComentario(c)}>✏️ Editar</button>
                              <button className="btn btn-danger btn-sm" onClick={() => abrirConfirmarExclusaoComentario(c)}>🗑️ Excluir</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modais de CRUD de Prompt ─────────────────────────────────────── */}
      <FormularioPrompt isOpen={showFormulario} onClose={() => setShowFormulario(false)}
        onSuccess={handleFormularioSuccess} nomeUsuario={NOME_USUARIO} toast={toast} />

      <EditarPrompt prompt={promptSelecionado} isOpen={showEditar} onClose={fecharEditar}
        onSuccess={() => dispararAtualizacaoGeral()} nomeUsuario={NOME_USUARIO} toast={toast} />

      <ConfirmarExclusao prompt={promptParaDeletar} isOpen={showConfirmarExclusao}
        onConfirm={confirmarExclusao} onCancel={fecharConfirmarExclusao} isDeleting={isDeletando} />

      <ModalIA isOpen={showModalIA} onClose={() => setShowModalIA(false)}
        onSuccess={() => { setShowModalIA(false); carregarDados(); }}
        nomeUsuario={NOME_USUARIO} toast={toast} />

      {/* ── Modal: Editar Versão do Histórico ───────────────────────────── */}
      {showModalEditarVersao && (
        <div className="modal-overlay active" onClick={fecharModalEditarVersao}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Editar Versão {versaoEmEdicao?.numeroVersao}</h3>
              <button className="close-btn" onClick={fecharModalEditarVersao}>✕</button>
            </div>
            <div className="modal-body">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white' }}>Motivo da Alteração:</label>
              <textarea className="comentario-input" rows="3"
                style={{ width: '100%', marginBottom: '1.5rem', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white' }}
                value={textoMotivoEdicao} onChange={e => setTextoMotivoEdicao(e.target.value)} placeholder="Descreva o motivo..." />
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white' }}>Conteúdo da Especificação:</label>
              <textarea className="comentario-input" rows="12"
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.9rem', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', opacity: 1 }}
                value={textoVersaoEmEdicao} onChange={e => setTextoVersaoEmEdicao(e.target.value)} />
              <div className="action-buttons" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary"
                  onClick={() => salvarEdicaoVersao(promptSelecionado.id, toast)}
                  disabled={!textoMotivoEdicao.trim() || !textoVersaoEmEdicao.trim()}>
                  💾 Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Excluir Versão ────────────────────────────────────────── */}
      {showModalExcluirVersao && (
        <div className="modal-overlay active" onClick={fecharModalExcluirVersao}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0, justifyContent: 'flex-end' }}>
              <button className="close-btn" onClick={fecharModalExcluirVersao}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: 0 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 className="modal-title" style={{ justifyContent: 'center', fontSize: '1.5rem' }}>
                Excluir Versão {versaoParaExcluir?.numeroVersao}?
              </h3>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem', lineHeight: '1.6' }}>
                Tem certeza que deseja apagar este registro histórico? <br />
                <strong>Esta ação não pode ser desfeita.</strong>
              </p>
              <div className="action-buttons">
                <button className="btn btn-danger" onClick={() => confirmarExclusaoVersao(promptSelecionado.id, toast)}>
                  🗑️ Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar Exclusão de Comentário ──────────────────────── */}
      {showConfirmarExclusaoComentario && (
        <div className="modal-overlay active" onClick={() => setShowConfirmarExclusaoComentario(false)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0, justifyContent: 'flex-end' }}>
              <button className="close-btn" onClick={() => setShowConfirmarExclusaoComentario(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: 0 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 className="modal-title" style={{ justifyContent: 'center', fontSize: '1.5rem' }}>Excluir Comentário?</h3>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem', lineHeight: '1.6' }}>
                Esta ação não pode ser desfeita. O comentário será removido permanentemente.
              </p>
              <div className="action-buttons">
                <button className="btn btn-danger" onClick={() => confirmarExclusaoComentario(promptSelecionado.id, toast)}>
                  🗑️ Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Comentário ─────────────────────────────────────── */}
      {showModalEdicaoComentario && (
        <div className="modal-overlay active" onClick={() => setShowModalEdicaoComentario(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Editar Comentário</h3>
              <button className="close-btn" onClick={() => setShowModalEdicaoComentario(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Faça as alterações necessárias no seu comentário:
              </label>
              <textarea className="comentario-input" rows="6" style={{ width: '100%', minHeight: '150px' }}
                value={textoEdicaoComentario} onChange={e => setTextoEdicaoComentario(e.target.value)} autoFocus />
              <div className="action-buttons">
                <button className="btn btn-primary"
                  onClick={() => salvarEdicaoComentario(promptSelecionado.id, toast)}
                  disabled={!textoEdicaoComentario.trim()}>
                  💾 Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Visualizar Versão Completa ────────────────────────────── */}
      {showModalVersao && versaoVisualizando && (
        <div className="modal-overlay active" onClick={fecharModalVersao}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">📜 Versão {versaoVisualizando.numeroVersao}</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{promptSelecionado.titulo}</p>
              </div>
              <button className="close-btn" onClick={fecharModalVersao}>✕</button>
            </div>
            <div className="modal-body">
              <div className="prompt-detail">
                <div style={{ background: 'rgba(102,126,234,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                  <p style={{ marginBottom: '0.7rem' }}><strong>👤 Editado por:</strong> {versaoVisualizando.editadoPor}</p>
                  <p style={{ marginBottom: '0.7rem' }}><strong>📅 Data:</strong> {formatarData(versaoVisualizando.dataEdicao)}</p>
                  <p style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    <strong style={{ marginRight: '0.5rem' }}>📝 Motivo:</strong>
                    {versaoVisualizando.motivoEdicao || 'Sem motivo registrado'}
                  </p>
                </div>
              </div>
              {versaoVisualizando.descricao && (
                <div className="prompt-detail">
                  <h4>Prompt</h4>
                  <p style={{ color: 'var(--text)', marginBottom: '1.5rem' }}>{versaoVisualizando.descricao}</p>
                </div>
              )}
              <div className="prompt-detail">
                <h4>Descrição</h4>
                <div className="prompt-text" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {versaoVisualizando.textoVersao}
                </div>
                <p style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  {versaoVisualizando.textoVersao?.length || 0} caracteres
                </p>
              </div>
              {versaoVisualizando.tags?.length > 0 && (
                <div className="prompt-detail">
                  <h4>Tags</h4>
                  <div className="prompt-tags">
                    {versaoVisualizando.tags.map((tag, i) => <span key={i} className="tag">#{tag}</span>)}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(versaoVisualizando.textoVersao);
                    toast.current?.show({ severity: 'info', summary: 'Copiado', detail: 'Texto enviado para área de transferência!', life: 3000 });
                  } catch {
                    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao copiar.', life: 3000 });
                  }
                }}>
                  📋 Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Modal: Escolha de IA */}
      {showEscolhaIA && (
        <div className="modal-overlay active" onClick={() => setShowEscolhaIA(false)}>
          <div className="modal" style={{ maxWidth: '500px', background: '#1e2128', border: '1px solid #334155' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid #334155' }}>
              <h3 className="modal-title" style={{ color: 'white' }}>✨ Escolha o modo da IA</h3>
              <button className="close-btn" onClick={() => setShowEscolhaIA(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => { setShowEscolhaIA(false); window.open('http://localhost:3000', '_blank'); }}
                style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#475569'}>
                <div style={{ fontSize: '2.5rem' }}>💬</div>
                <div>
                  <strong style={{ color: 'white', fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>Chat Interativo</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Acessar a interface original do Ollama.</span>
                </div>
              </button>

              <button onClick={() => { setShowEscolhaIA(false); setShowModalIA(true); }}
                style={{ background: 'transparent', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontSize: '2.5rem' }}>⚡</div>
                <div>
                  <strong style={{ color: 'white', fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>Gerador Expresso</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Preencha os campos e a IA gera tudo de uma vez.</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget nomeUsuario={NOME_USUARIO} />
    </div>
  );
}

export default App;



