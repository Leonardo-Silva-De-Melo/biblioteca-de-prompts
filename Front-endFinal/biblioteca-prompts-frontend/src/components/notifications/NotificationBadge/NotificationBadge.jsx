import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificacoesAPI } from '../../../services/api';

const NotificationBadge = ({ nomeUsuario, onClick }) => {
  const [count, setCount] = useState(0);

  const carregarCount = async () => {
    try {
      const response = await notificacoesAPI.count(nomeUsuario);
      setCount(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem');
    }
  };

  useEffect(() => {
    if (nomeUsuario) {
      carregarCount();
      window.addEventListener('atualizarSino', carregarCount);
      const interval = setInterval(carregarCount, 30000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('atualizarSino', carregarCount);
      };
    }
  }, [nomeUsuario]);

  return (
    <button className="sino-premium-btn" onClick={onClick} title="Notificações">
      <Bell size={22} className="sino-icon" />
      {count > 0 && (
        <span className="sino-badge-notif">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;