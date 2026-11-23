import React, { useState, useEffect } from 'react';
import { X, Home, Info, MessageSquare, BarChart, Heart, FileText, HelpCircle, History, Bell, Shield } from 'lucide-react';
import { notificacoesAPI } from '../../../services/api';
import keycloak from '../../../keycloak';
import ThemeToggle from '../../ui/ThemeToggle/ThemeToggle';
import "./SideMenu.css";

const SideMenu = ({ isOpen, onClose, setTelaAtual, telaAtual, nomeUsuario }) => {
  const [countNotificacoes, setCountNotificacoes] = useState(0);

  // Verifica se o usuário logado tem a role ADMIN (client ou realm)
  const isAdmin = keycloak.hasResourceRole('ADMIN', 'biblioteca-prompts-frontend')
    || keycloak.hasRealmRole('ADMIN');

  useEffect(() => {
    if (nomeUsuario && isOpen) {
      carregarCount();
    }
  }, [nomeUsuario, isOpen]);

  const carregarCount = async () => {
    try {
      const response = await notificacoesAPI.count(nomeUsuario);
      setCountNotificacoes(response.data.count);
    } catch (error) {
      console.error('Erro ao carregar count:', error);
    }
  };
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'favoritos', label: 'Meus Favoritos', icon: Heart },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: countNotificacoes },
    { id: 'historico', label: 'Meu Histórico', icon: History },
    { id: 'meus-prompts', label: 'Meus Prompts', icon: FileText },
    { id: 'ajuda', label: 'Ajuda', icon: HelpCircle },
    { id: 'sobre', label: 'Sobre o Sistema', icon: Info },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    // Itens exclusivos para ADMIN — ocultos para USER
    ...(isAdmin ? [
      { id: 'admin-stats', label: 'Estatísticas (Admin)', icon: BarChart },
      { id: 'admin-resultados', label: 'Respostas do Formulário', icon: Shield },
    ] : []),
  ];

  const handleNavegacao = (id) => {
    setTelaAtual(id);
    onClose();
  };

  return (
    <>
      {/* Overlay Escuro (Fundo transparente que aparece quando o menu abre) */}
      <div
        className={`sidemenu-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar Lateral */}
      <div className={`sidemenu-container ${isOpen ? 'open' : ''}`}>

        <div className="sidemenu-header">
          <span className="sidemenu-title">Menu</span>
          <button onClick={onClose} className="sidemenu-close">
            <X size={24} />
          </button>
        </div>

        <nav className="sidemenu-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const ativo = telaAtual === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavegacao(item.id)}
                className={`sidemenu-item ${ativo ? 'active' : ''}`}
              >
                <Icon size={20} className="sidemenu-icon" />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="menu-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* THEME TOGGLE */}
        <div className="sidemenu-theme">
          <ThemeToggle />
        </div>

        <div className="sidemenu-footer">
          <p>DGTI • UERJ</p>
          <small>Versão 1.0.0</small>
        </div>
      </div>
    </>
  );
};

export default SideMenu;