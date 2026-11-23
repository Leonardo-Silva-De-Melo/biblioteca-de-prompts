import React, { useState, useEffect, useRef } from 'react';
import { Save, Copy, RotateCcw, FileText, X, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { iaAPI, promptsAPI } from '../../../services/api';
import './ModalIA.css';

const ModalIA = ({ isOpen, onClose, onSuccess, nomeUsuario, toast }) => {
  const [iaDisponivel, setIaDisponivel] = useState(false);
  const [verificandoIA, setVerificandoIA] = useState(true);
  const [modelosDisponiveis, setModelosDisponiveis] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [etapa, setEtapa] = useState(1);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [tituloSalvamento, setTituloSalvamento] = useState('');
  const [templateAtivo, setTemplateAtivo] = useState(null);
  const [modalWebUIAberto, setModalWebUIAberto] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const fileInputRef = useRef(null);

  // Estados do Chat V2.0
  const [chatId, setChatId] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [selecionandoAcao, setSelecionandoAcao] = useState(true);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const OPEN_WEBUI_URL = import.meta.env.VITE_OPEN_WEBUI_URL || 'http://localhost:3000';

  const TEMPLATES_POR_CATEGORIA = {
    'Documentação': [
      { titulo: 'Doc de API', prompt: 'Crie uma documentação detalhada para uma API RESTful usando padrão OpenAPI/Swagger para o seguinte escopo: ' },
      { titulo: 'ADR', prompt: 'Escreva um Architecture Decision Record (ADR) justificando a adoção de: ' },
    ],
    'Arquitetura': [
      { titulo: 'Design Pattern', prompt: 'Sugira o melhor padrão de projeto (Design Pattern) para resolver o seguinte problema: ' },
      { titulo: 'Arq. Hexagonal', prompt: 'Descreva como estruturar a seguinte funcionalidade usando Arquitetura Hexagonal: ' },
    ],
    'Desenvolvimento': [
      {
        titulo: 'Landing Page',
        prompt: 'Você é um gerador de landing pages. Crie um arquivo HTML completo, em uma única página, usando apenas HTML, CSS e JavaScript vanilla (sem frameworks).\n\nA página deve seguir esta estrutura obrigatória:\n1. Navbar com logo e menu de navegação âncora\n2. Seção hero com título principal e subtítulo\n3. Seção "Sobre" com 3 ou 4 cards de funcionalidades com ícone emoji\n4. Seção de conteúdo/descrição com texto explicativo\n5. Formulário de contato simples (nome, e-mail, mensagem)\n6. Rodapé com nome do projeto e instituição\n\nRegras obrigatórias de estilo:\n- Layout responsivo com media queries para mobile\n- Paleta de cores derivada da cor principal informada\n- Navegação suave entre seções (scroll-behavior: smooth)\n- Fonte: Google Fonts — use Inter ou Poppins\n- Cards com hover com leve elevação (box-shadow)\n- Código limpo, comentado por seção e pronto para abrir no navegador\n\nAo final, exiba o código completo dentro de uma única tag <html>.',
        campos: '— Nome do projeto: \n— Instituição / organização: \n— Tema central / área de atuação: \n— Público-alvo: \n— Cor principal (hex ou nome): \n— E-mail de contato: \n— Endereço (opcional): '
      },
    ],
    'Testes': [
      { titulo: 'Testes JUnit', prompt: 'Crie testes unitários usando JUnit 5 e Mockito cobrindo todos os cenários para a seguinte classe: ' },
    ],
    'DevOps': [
      { titulo: 'Dockerfile Otimizado', prompt: 'Crie um Dockerfile otimizado com build multi-stage para uma aplicação: ' },
    ],
    'Banco de Dados': [
      { titulo: 'Migration SQL', prompt: 'Escreva um script de migração DDL (SQL) focado em performance para criar a tabela e índices de: ' },
    ],
    'Segurança': [
      { titulo: 'Análise OWASP', prompt: 'Analise o fluxo abaixo e aponte possíveis vulnerabilidades baseando-se no OWASP Top 10: ' },
    ],
    'Onboarding': [
      { titulo: 'README de Setup', prompt: 'Crie um arquivo README.md com o passo a passo completo de setup local para um projeto: ' },
    ]
  };

  const categorias = [
    { id: 'Documentação', nome: 'Documentação', icon: '📄', cor: '#3b82f6', desc: 'Specs, ADRs, Docs' },
    { id: 'Arquitetura', nome: 'Arquitetura', icon: '🏗️', cor: '#8b5cf6', desc: 'Design patterns, Diagramas' },
    { id: 'Desenvolvimento', nome: 'Desenvolvimento', icon: '💻', cor: '#10b981', desc: 'APIs, Front-end, Features' },
    { id: 'Testes', nome: 'Testes', icon: '🧪', cor: '#f59e0b', desc: 'Unit, Integration, E2E' },
    { id: 'DevOps', nome: 'DevOps', icon: '🚀', cor: '#ef4444', desc: 'CI/CD, Docker, K8s' },
    { id: 'Banco de Dados', nome: 'Banco de Dados', icon: '🗄️', cor: '#06b6d4', desc: 'Schemas, Migrations' },
    { id: 'Segurança', nome: 'Segurança', icon: '🛡️', cor: '#ec4899', desc: 'LGPD, Auth, Firewall' },
    { id: 'Onboarding', nome: 'Onboarding', icon: '🤝', cor: '#a855f7', desc: 'Setup, Guias, READMEs' },
  ];

  useEffect(() => {
    if (isOpen) {
      verificarStatusIA();
      resetarModal();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll do chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const resetarModal = () => {
    setEtapa(1);
    setCategoriaSelecionada(null);
    setDescricao('');
    setArquivoSelecionado(null);
    setTituloSalvamento('');
    setTemplateAtivo(null);
    setMensagens([]);
    setChatId('');
    setMensagemAtual('');
    setGerando(false);
  };

  const verificarStatusIA = async () => {
    setVerificandoIA(true);
    try {
      const response = await iaAPI.status();
      setIaDisponivel(response.data.disponivel);
      if (response.data.disponivel) {
        const resModelos = await iaAPI.modelos();
        if (resModelos.data && resModelos.data.modelos) {
          setModelosDisponiveis(resModelos.data.modelos);
          if (resModelos.data.modelos.length > 0) {
            setModeloSelecionado(resModelos.data.modelos[0]);
          }
        }
      }
    } catch (error) {
      setIaDisponivel(false);
    } finally {
      setVerificandoIA(false);
    }
  };

  const selecionarCategoria = (categoria) => {
    setCategoriaSelecionada(categoria);
    setEtapa(2);
  };

  const voltarParaCategorias = () => {
    setEtapa(1);
    setCategoriaSelecionada(null);
    setDescricao('');
    setArquivoSelecionado(null);
    setTemplateAtivo(null);
  };

  // DRAG & DROP HANDLERS
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validarArquivo(file)) setArquivoSelecionado(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validarArquivo(file)) setArquivoSelecionado(file);
  };

  const validarArquivo = (file) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.sql', '.md'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(extension)) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Tipo de arquivo não suportado.', life: 4000 });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Arquivo muito grande. Máximo: 10MB.', life: 4000 });
      return false;
    }
    return true;
  };

  const removerArquivo = () => {
    setArquivoSelecionado(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ════════════════════════════════════════════════════════════════
  // GERAÇÃO COM STREAMING (V2.0)
  // ════════════════════════════════════════════════════════════════

  const iniciarChatStream = async (isPrimeiraMensagem = true, prompt = null) => {
    const promptParaEnviar = prompt || mensagemAtual;
    if (!promptParaEnviar.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Escreva uma mensagem!', life: 4000 });
      return;
    }

    setGerando(true);
    abortControllerRef.current = new AbortController();
    let idDoChat = chatId;

    if (isPrimeiraMensagem) {
      setEtapa(3);
      idDoChat = 'chat-' + Date.now();
      setChatId(idDoChat);
    }

    const novaMensagemUsuario = { role: 'user', content: promptParaEnviar };
    setMensagens(prev => [...prev, novaMensagemUsuario, { role: 'assistant', content: '' }]);
    setMensagemAtual('');

    try {
      await iaAPI.streamChat(idDoChat, promptParaEnviar, isPrimeiraMensagem ? arquivoSelecionado : null, modeloSelecionado, abortControllerRef.current.signal, (chunk) => {
        setMensagens((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content += chunk;
          return newMsgs;
        });
      });
      if (isPrimeiraMensagem) {
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Especificação gerada!', life: 3000 });
      }
    } catch (error) {
      console.error('Erro:', error);
      if (error.name !== 'AbortError') {
        toast.current?.show({ severity: 'error', summary: 'Falha', detail: 'Erro no processamento. Verifique o arquivo.', life: 5000 });
      }
    } finally {
      setGerando(false);
    }
  };

  const gerarEspecificacaoInicio = () => {
    if (!descricao.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Descreva o que você precisa!', life: 4000 });
      return;
    }
    const promptFinal = templateAtivo
      ? `${templateAtivo.prompt}\n\nUse as seguintes informações para preencher o conteúdo:\n${descricao.trim()}`
      : descricao.trim();

    iniciarChatStream(true, promptFinal);
  };

  const copiarEspecificacao = async () => {
    try {
      const ultimaResposta = mensagens.filter(m => m.role === 'assistant').pop()?.content || '';
      await navigator.clipboard.writeText(ultimaResposta);
      toast.current?.show({ severity: 'info', summary: 'Copiado', detail: 'Texto enviado para área de transferência!', life: 3000 });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível copiar.', life: 3000 });
    }
  };

  const abrirNoOpenWebUI = () => {
    if (!descricao.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Descreva o que você precisa ou selecione um template!', life: 4000 });
      return;
    }
    if (arquivoSelecionado) {
      setModalWebUIAberto(true);
      return;
    }
    abrirNoOpenWebUIConfirmado();
  };

  const abrirNoOpenWebUIConfirmado = async () => {
    let promptFinal = templateAtivo
      ? `${templateAtivo.prompt}\n\nUse as seguintes informações para preencher o conteúdo:\n${descricao}`
      : descricao;

    if (arquivoSelecionado) {
      // Quando tem arquivo: copia o texto para o clipboard e abre o Open WebUI LIMPO
      // Assim o usuário anexa o arquivo primeiro e depois cola com Ctrl+V
      try {
        await navigator.clipboard.writeText(promptFinal);
        toast.current?.show({ severity: 'success', summary: 'Texto copiado!', detail: 'Cole com Ctrl+V no chat do Open WebUI após anexar o arquivo.', life: 5000 });
      } catch (err) {
        console.error('Erro ao copiar para clipboard:', err);
      }
      window.open(OPEN_WEBUI_URL, '_blank');
    } else {
      // Sem arquivo: envia via URL normalmente (auto-submit é ok)
      const encodedPrompt = encodeURIComponent(promptFinal);
      const url = `${OPEN_WEBUI_URL}/?q=${encodedPrompt}`;
      window.open(url, '_blank');
    }

    setModalWebUIAberto(false);
    fecharModal();
  };

  const irParaSalvamento = () => {
    setTituloSalvamento(`Especificação ${categoriaSelecionada.nome} - ${new Date().toLocaleDateString('pt-BR')}`);
    setEtapa(4);
  };

  const confirmarSalvamento = async () => {
    if (!tituloSalvamento.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Por favor, digite um título válido.', life: 3000 });
      return;
    }
    try {
      const ultimaResposta = mensagens.filter(m => m.role === 'assistant').pop()?.content || '';
      await promptsAPI.criar({
        titulo: tituloSalvamento,
        categoria: categoriaSelecionada.id,
        textoPrompt: ultimaResposta,
        descricao: mensagens[0]?.content.substring(0, 200) || '',
        autor: nomeUsuario,
        tags: ['ia-gerado', 'arquiteto-virtual', categoriaSelecionada.id.toLowerCase()],
        criadoEm: new Date().toISOString()
      });

      toast.current?.show({ severity: 'success', summary: 'Salvo!', detail: 'Especificação salva na biblioteca da UERJ!', life: 3000 });
      onSuccess();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar no banco de dados.', life: 4000 });
    }
  };

  const fecharModal = () => {
    if (gerando) {
      setShowConfirmCancel(true);
      return;
    }
    resetarModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${etapa === 3 ? 'fullscreen-chat-overlay' : ''}`} onClick={fecharModal} style={etapa === 3 ? { padding: 0, background: '#111111' } : {}}>
      <div
        className={etapa === 3 ? '' : 'modal-arquiteto'}
        onClick={(e) => e.stopPropagation()}
        style={etapa === 3 ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '100%',
          height: '100%',
          maxHeight: '100%',
          margin: 0,
          padding: 0,
          borderRadius: 0,
          background: '#111111',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column'
        } : {}}
      >

        {/* HEADER DO MODAL E BANNER (Ocultos no modo Fullscreen/Etapa 3) */}
        {etapa !== 3 && (
          <>
            <div className="modal-arquiteto-header">
              <div>
                <h2>✨ Arquiteto Virtual</h2>
                <p>Geração de especificações técnicas baseadas nos padrões da DGTI</p>
              </div>
              <button className="modal-close-btn" onClick={fecharModal} aria-label="Fechar">✕</button>
            </div>

            <div className={`ia-status-banner ${iaDisponivel ? 'online' : 'offline'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {verificandoIA ? (
                  <>⏳ Verificando conexão com IA...</>
                ) : iaDisponivel ? (
                  <>
                    <span style={{ fontSize: '1.2rem' }}>✅</span>
                    <span style={{ color: '#34D399', textShadow: '0 0 10px rgba(52, 211, 153, 0.3)', letterSpacing: '0.3px' }}>IA Ollama on</span>
                  </>
                ) : (
                  <>❌ Ollama offline. Execute: <code>ollama serve</code></>
                )}
              </div>

              {/* SELETOR DE MODELOS (V2.0) - Escondido na etapa 3 pois vai para o input */}
              {iaDisponivel && modelosDisponiveis.length > 0 && etapa !== 3 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#93C5FD', letterSpacing: '0.5px' }}>🧠 Cérebro:</span>
                  <select
                    value={modeloSelecionado}
                    onChange={(e) => setModeloSelecionado(e.target.value)}
                    className="ollama-model-selector"
                    disabled={gerando}
                    style={{ fontSize: '0.95rem', padding: '4px 8px', fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(147, 197, 253, 0.3)', color: '#E2E8F0', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {modelosDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
            </div>
          </>
        )}

        {/* ETAPA 1: CATEGORIAS */}
        {etapa === 1 && (
          <div className="modal-arquiteto-content">
            <div className="secao-titulo">
              <h3>1. Escolha a Categoria Principal</h3>
              <p className="secao-subtitulo">Selecione o tipo de especificação que você precisa</p>
            </div>

            <div className="categorias-grid">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  className="categoria-card"
                  onClick={() => selecionarCategoria(cat)}
                  disabled={!iaDisponivel}
                  style={{ '--categoria-cor': cat.cor }}
                >
                  <div className="categoria-icon">{cat.icon}</div>
                  <div className="categoria-info">
                    <div className="categoria-nome">{cat.nome}</div>
                    <div className="categoria-desc">{cat.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 2: FORMULÁRIO */}
        {etapa === 2 && (
          <div className="modal-arquiteto-content">
            <div className="categoria-selecionada" style={{ '--categoria-cor': categoriaSelecionada.cor }}>
              <span className="cat-icon">{categoriaSelecionada.icon}</span>
              <div>
                <span className="cat-nome">{categoriaSelecionada.nome}: </span>
                <span className="cat-desc-inline">{categoriaSelecionada.desc}</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descricao" className="form-label">
                {templateAtivo ? `2. Preencha os dados para: ${templateAtivo.titulo}` : '2. O que você precisa desenvolver?'}
              </label>
              <p className="form-hint">
                {templateAtivo ? 'Preencha cada campo ao lado do traço (—)' : 'Descreva o requisito, funcionalidade ou problema'}
              </p>
              {templateAtivo && (
                <div className="template-ativo-badge">
                  <span>📋 Template: <strong>{templateAtivo.titulo}</strong></span>
                  <button className="template-limpar-btn" onClick={() => { setTemplateAtivo(null); setDescricao(''); }}>✕ Limpar</button>
                </div>
              )}
              <textarea
                id="descricao"
                className="descricao-textarea"
                placeholder={templateAtivo ? 'Preencha os campos acima...' : 'Ex: Preciso de uma API REST em Spring Boot...'}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={templateAtivo ? 8 : 5}
                maxLength={2000}
              />
              <div className="char-count">{descricao.length} / 2000 caracteres</div>
            </div>

            {/* SEÇÃO DE TEMPLATES */}
            {TEMPLATES_POR_CATEGORIA[categoriaSelecionada.id] && (
              <div className="form-group templates-section">
                <label className="form-label">💡 Templates Rápidos</label>
                <div className="templates-pills">
                  {TEMPLATES_POR_CATEGORIA[categoriaSelecionada.id].map((template, idx) => (
                    <button
                      key={idx}
                      className={`template-pill ${templateAtivo?.titulo === template.titulo ? 'active' : ''}`}
                      onClick={() => {
                        if (template.campos) {
                          setTemplateAtivo(template);
                          setDescricao(template.campos);
                        } else {
                          setTemplateAtivo(null);
                          setDescricao(template.prompt);
                        }
                      }}
                    >
                      {template.titulo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">📎 Documento de Referência (Opcional)</label>
              <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${arquivoSelecionado ? 'has-file' : ''}`}
                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                onClick={() => !arquivoSelecionado && fileInputRef.current?.click()}
              >
                {!arquivoSelecionado ? (
                  <>
                    <div className="upload-text">
                      <p className="upload-primary">{isDragging ? 'Solte aqui' : 'Arraste e solte ou clique 📤'}</p>
                      <p className="upload-secondary">PDF, DOC, TXT, CSV, SQL, MD • Máx 10MB</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.sql,.md" onChange={handleFileChange} style={{ display: 'none' }} />
                  </>
                ) : (
                  <div className="arquivo-selecionado">
                    <div className="arquivo-info-container">
                      <div className="arquivo-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d1d5db' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <div className="arquivo-details-box">
                        <div className="arquivo-nome-text">{arquivoSelecionado.name}</div>
                        <div className="arquivo-tamanho-text">{(arquivoSelecionado.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button type="button" className="arquivo-remover-btn" onClick={(e) => { e.stopPropagation(); removerArquivo(); }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-arquiteto-footer">
              <button className="btn-secondary" onClick={voltarParaCategorias}>← Voltar</button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={gerarEspecificacaoInicio} disabled={gerando || !iaDisponivel}>
                  ⚙️ Gerar Internamente
                </button>
                <button className="btn-primary" onClick={abrirNoOpenWebUI}>
                  🚀 Abrir no Open WebUI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: CHAT INTERATIVO (V2.0 - ESTILO OPEN WEBUI) */}
        {etapa === 3 && (
          <div className="chat-interface" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flex: 1, background: '#212121', borderRadius: '0', position: 'relative' }}>

            {/* BOTÃO FECHAR FLUTUANTE */}
            <button
              onClick={fecharModal}
              style={{ position: 'absolute', top: '20px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, fontSize: '18px' }}
            >✕</button>

            <div className="chat-messages" style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {mensagens.map((msg, idx) => (
                  <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

                    {msg.role === 'user' ? (
                      <div style={{ maxWidth: '85%', background: '#2f2f2f', padding: '12px 20px', borderRadius: '24px', color: '#ececec', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </div>
                    ) : (
                      <div className="markdown-body" style={{ width: '100%', color: '#ececec', fontSize: '15px', lineHeight: '1.6' }}>
                        {msg.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <div style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', margin: '16px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2d2d2d', padding: '6px 16px', color: '#a3a3a3', fontSize: '12px', fontFamily: 'sans-serif' }}>
                                      <span>{match[1]}</span>
                                      <button
                                        onClick={(e) => {
                                          navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                          e.target.innerText = 'Copied!';
                                          setTimeout(() => e.target.innerText = 'Copy', 2000);
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: '#a3a3a3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                      >
                                        Copy
                                      </button>
                                    </div>
                                    <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', background: '#1e1e1e' }}>
                                      <code className={className} style={{ color: '#e5e5e5', fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace' }} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className={className} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          gerando && idx === mensagens.length - 1 ? (
                            <div className="ia-loader">
                              <span className="loader-text">Processando</span>
                              <div className="dot"></div>
                              <div className="dot"></div>
                              <div className="dot"></div>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}

                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div style={{ padding: '0 24px 24px 24px' }}>
              <div className="chat-input-area" style={{ display: 'flex', alignItems: 'center', background: '#2f2f2f', borderRadius: '24px', padding: '8px 12px', gap: '8px', maxWidth: '800px', margin: '0 auto' }}>
                <input
                  type="text"
                  value={mensagemAtual}
                  onChange={(e) => setMensagemAtual(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') iniciarChatStream(false) }}
                  placeholder="Send a message"
                  disabled={gerando}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '8px 12px', outline: 'none', fontSize: '15px' }}
                />

                {/* Model Selector just like OpenWebUI */}
                <select
                  value={modeloSelecionado}
                  onChange={(e) => setModeloSelecionado(e.target.value)}
                  disabled={gerando}
                  className="ollama-model-selector chat-input-selector"
                >
                  {modelosDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <button
                  onClick={() => {
                    if (gerando) {
                      if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                      }
                      setGerando(false);
                    } else {
                      iniciarChatStream(false);
                    }
                  }}
                  disabled={!gerando && !mensagemAtual.trim()}
                  style={{ background: (!gerando && !mensagemAtual.trim()) ? '#555' : '#fff', color: '#000', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!gerando && !mensagemAtual.trim()) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '18px' }}
                >
                  {gerando ? '■' : '↑'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                <button className="btn-secondary" onClick={copiarEspecificacao} style={{ padding: '6px 16px', fontSize: '13px', background: 'transparent', border: '1px solid #444', color: '#ccc' }}>📋 Copiar Resposta</button>
                <button className="btn-primary" onClick={irParaSalvamento} style={{ padding: '6px 16px', fontSize: '13px', background: '#3b82f6', border: 'none' }}>💾 Salvar na Biblioteca</button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: SALVAMENTO */}
        {etapa === 4 && (
          <div className="modal-arquiteto-content save-step-wrapper">
            <div className="save-card-premium">
              <div className="save-icon-glow">
                <Save size={32} />
              </div>
              <h3>Título da Especificação</h3>
              <p>Escolha um nome claro para que sua equipe encontre esta especificação na biblioteca.</p>
              <div className="input-group-premium">
                <input
                  type="text"
                  className="input-title-premium"
                  value={tituloSalvamento}
                  onChange={(e) => setTituloSalvamento(e.target.value)}
                  placeholder="Ex: Documentação API v1.0"
                  autoFocus
                />
              </div>
            </div>
            <div className="save-actions-senior">
              <button className="btn-secondary" onClick={() => setEtapa(3)}>← Voltar</button>
              <button className="btn-primary" onClick={confirmarSalvamento}>💾 Salvar</button>
            </div>
          </div>
        )}

      </div>

      {modalWebUIAberto && (
        <div className="modal-overlay" style={{ zIndex: 1000000 }} onClick={() => setModalWebUIAberto(false)}>
          <div className="modal-arquiteto" style={{ maxWidth: '480px', textAlign: 'center', padding: '24px 28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ color: '#f59e0b' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
            <h2 style={{ marginBottom: '10px', color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}>Atenção ao Enviar Arquivo</h2>
            <p style={{ color: '#A0AEC0', fontSize: '0.95rem', marginBottom: '14px', lineHeight: '1.5' }}>
              O seu arquivo <strong>NÃO</strong> pode ser enviado automaticamente via link.
            </p>
            <p style={{ color: '#A0AEC0', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.5' }}>
              Quando o Open WebUI abrir, <strong>anexe o documento no botão (+)</strong> e dê um <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}>Ctrl + V</span> no chat para colar seu texto!
            </p>

            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '0 8px 8px 0', padding: '12px 16px', textAlign: 'left', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>💡</span>
                <strong style={{ color: '#93C5FD', fontSize: '0.95rem' }}>Dica de IA</strong>
              </div>
              <p style={{ color: '#3b82f6', margin: '0 0 8px 0', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Para textos normais, qualquer modelo serve.
              </p>
              <p style={{ color: '#3b82f6', margin: 0, fontSize: '0.85rem', lineHeight: '1.6' }}>
                Mas se o seu arquivo for um <strong>PDF Escaneado (Imagem)</strong>, escolha o modelo <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}>qwen3-vl</span> lá no Open WebUI para a IA conseguir "enxergar" o seu documento!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setModalWebUIAberto(false)}>Cancelar</button>
              <button style={{ flex: 1, backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '10px', fontSize: '0.95rem' }} onClick={abrirNoOpenWebUIConfirmado}>
                Abrir Open WebUI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE CONFIRMAÇÃO CUSTOMIZADO */}
      {showConfirmCancel && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }} onClick={(e) => { e.stopPropagation(); }}>
          <div style={{
            background: '#1a1d24', padding: '30px', borderRadius: '12px',
            border: '1px solid #2d333b', width: '420px', maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              width: '64px', height: '64px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <i className="pi pi-exclamation-triangle" style={{ fontSize: '28px' }}></i>
            </div>
            <h3 style={{ color: '#f8fafc', margin: '0 0 12px 0', fontSize: '1.25rem' }}>Cancelar Geração?</h3>
            <p style={{ color: '#94a3b8', margin: '0 0 25px 0', lineHeight: '1.5', fontSize: '0.95rem' }}>
              A IA está trabalhando na sua resposta neste momento. Se você cancelar agora, o progresso será perdido.
            </p>
            <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
              <button
                style={{
                  flex: 1, padding: '12px', background: 'transparent', border: '1px solid #334155',
                  color: '#e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: '0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
                onMouseOver={(e) => e.target.style.background = '#334155'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
                onClick={(e) => { e.stopPropagation(); setShowConfirmCancel(false); }}
              >
                <i className="pi pi-times" style={{ fontSize: '0.9rem' }}></i> Não, Continuar
              </button>
              <button
                style={{
                  flex: 1, padding: '12px', background: '#ef4444', border: 'none',
                  color: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: '0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
                onMouseOver={(e) => e.target.style.background = '#dc2626'}
                onMouseOut={(e) => e.target.style.background = '#ef4444'}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmCancel(false);
                  resetarModal();
                  onClose();
                }}
              >
                <i className="pi pi-check" style={{ fontSize: '0.9rem' }}></i> Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ModalIA;