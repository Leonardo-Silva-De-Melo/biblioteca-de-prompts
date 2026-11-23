import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../../../assets/DGTI.png';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import "./Header.css";
import NotificationBadge from '../../notifications/NotificationBadge/NotificationBadge';
import keycloak from '../../../keycloak';

const Header = ({ nomeUsuario, onAbrirMenu, setTelaAtual, onNotificacoes }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const nomeExibicao = keycloak.tokenParsed?.given_name 
    ? `${keycloak.tokenParsed.given_name} ${keycloak.tokenParsed.family_name || ''}`.trim() 
    : nomeUsuario;

  const handleLogout = () => {
    setShowDropdown(false);
    keycloak.logout({ redirectUri: window.location.origin });
    // OpenWebUi.logout(); // Chamada para deslogar do Open Web UI
  };
  // colocar junto o open web UI para deslogar o openWebUi junto.


  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="container header-content">

        {/* LADO ESQUERDO: LOGO E TÍTULO SLIM (image_24b862) */}
        <div className="logo">
          <img src={logoImg} alt="Logo DGTI" className="header-logo-img" />
          <div className="logo-text">
            <h1>Biblioteca de Prompts</h1>
          </div>
        </div>

        {/* LADO DIREITO: PERFIL E MENU HAMBÚRGUER (image_315480) */}
        <div className="header-actions">
          {/* O Sino entra aqui, como parte do grupo de ações */}
          <NotificationBadge
            nomeUsuario={nomeUsuario}
            onClick={onNotificacoes}
          />
          <div className="user-area-wrapper" ref={dropdownRef}>
            <button
              className="user-profile-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar-initials">
                {nomeExibicao ? nomeExibicao.split(' ').map(n => n[0]).join('').slice(0, 2) : 'LS'}
              </div>
              <span className="user-name-display">{nomeExibicao}</span>
              <ChevronDown size={14} className={`chevron-icon ${showDropdown ? 'rotate' : ''}`} />
            </button>

            {/* DROPDOWN DE PERFIL (image_315480) */}
            {showDropdown && (
              <div className="floating-user-dropdown">

                <div className="dropdown-header-info">
                  <strong>{nomeExibicao}</strong>
                </div>

                <div className="dropdown-body-content">
                  <div className="info-group">
                    <label>Unidade</label>
                    <p className="unit-text">{keycloak.tokenParsed?.unidade || 'Não informada'}</p> {/* Classe unit-text aplicada */}
                  </div>
                  <div className="info-group">
                    <label>Função</label>
                    <span className="function-badge">{keycloak.tokenParsed?.funcao || 'Não informada'}</span>
                  </div>
                </div>

                <div className="dropdown-footer-actions">
                  <button className="action-item logout" onClick={handleLogout}>
                    <LogOut size={16} /> Sair do Sistema
                  </button>
                </div>

              </div>
            )}
          </div>

          <button className="side-menu-trigger" onClick={onAbrirMenu}>
            <Menu size={24} color="white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;