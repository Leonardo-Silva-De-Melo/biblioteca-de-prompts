import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, ChevronDown, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { iaAPI } from '../../../services/api';
import './ChatWidget.css';

const ChatWidget = ({ nomeUsuario }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mensagens, setMensagens] = useState([
    { role: 'assistant', content: 'Olá! Sou o Assistente Virtual da UERJ. Como posso te ajudar hoje?' }
  ]);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [gerando, setGerando] = useState(false);
  const [chatId, setChatId] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);

  // Sugestões Iniciais
  const sugestoes = [
    'Dúvidas sobre calendário?',
    'Como trancar matrícula?',
    'Consulta de Notas',
    'Gerar template de ADR',
    'O que é a Biblioteca de Prompts?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const toggleChat = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 250);
    } else {
      setIsOpen(true);
    }
  };

  const enviarMensagem = async (texto = mensagemAtual) => {
    if (!texto.trim() || gerando) return;

    setGerando(true);
    abortControllerRef.current = new AbortController();
    
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = 'widget-' + Date.now();
      setChatId(currentChatId);
    }

    const newMensagens = [...mensagens, { role: 'user', content: texto }, { role: 'assistant', content: '' }];
    setMensagens(newMensagens);
    setMensagemAtual('');

    try {
      await iaAPI.streamChat(
        currentChatId, 
        texto, 
        null, 
        null, 
        abortControllerRef.current.signal, 
        (chunk) => {
          setMensagens((prev) => {
            const copy = [...prev];
            copy[copy.length - 1].content += chunk;
            return copy;
          });
        }
      );
    } catch (error) {
      if (error.name !== 'AbortError') {
        setMensagens((prev) => {
          const copy = [...prev];
          copy[copy.length - 1].content = 'Desculpe, ocorreu um erro ao conectar com a IA. Tente novamente mais tarde.';
          return copy;
        });
      }
    } finally {
      setGerando(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const pararGeracao = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setGerando(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante (FAB) */}
      <button 
        className={`chat-widget-fab ${isOpen ? 'is-open' : ''}`} 
        onClick={toggleChat}
        aria-label="Abrir Assistente Virtual"
      >
        <div className="fab-icon">
          {isOpen ? <ChevronDown size={28} /> : <MessageSquare size={28} />}
        </div>
        {!isOpen && hasNewMessage && <div className="fab-pulse"></div>}
      </button>

      {/* Painel do Chat */}
      {(isOpen || isClosing) && (
        <div className={`chat-widget-panel ${isClosing ? 'closing' : ''}`}>
          
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-widget-header-left">
              <div className="chat-widget-avatar">
                <img src="/assets/DGTI.png" alt="DGTI" style={{ width: '20px', height: 'auto', filter: 'brightness(0) invert(1)' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '🤖'; }} />
              </div>
              <div className="chat-widget-header-info">
                <h4>Assistente Virtual UERJ</h4>
                <span><div className="online-dot"></div> Online</span>
              </div>
            </div>
            <div className="chat-widget-header-actions">
              <button onClick={toggleChat} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="chat-widget-messages">
            {mensagens.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.role}`}>
                <div className="chat-msg-avatar">
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="chat-msg-bubble">
                  {msg.role === 'assistant' ? (
                    msg.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="chat-typing-indicator">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    )
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões */}
          {mensagens.length <= 1 && (
            <div className="chat-widget-suggestions">
              {sugestoes.map((sugestao, idx) => (
                <button 
                  key={idx} 
                  className="chat-suggestion-btn"
                  onClick={() => enviarMensagem(sugestao)}
                  disabled={gerando}
                >
                  {sugestao}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chat-widget-input-area">
            <input
              ref={inputRef}
              type="text"
              className="chat-widget-input"
              placeholder="Digite sua pergunta..."
              value={mensagemAtual}
              onChange={(e) => setMensagemAtual(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={gerando}
            />
            {gerando ? (
              <button 
                className="chat-widget-send-btn" 
                onClick={pararGeracao}
                style={{ background: '#ef4444' }}
                title="Parar geração"
              >
                <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px' }}></div>
              </button>
            ) : (
              <button 
                className="chat-widget-send-btn" 
                onClick={() => enviarMensagem()}
                disabled={!mensagemAtual.trim()}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
