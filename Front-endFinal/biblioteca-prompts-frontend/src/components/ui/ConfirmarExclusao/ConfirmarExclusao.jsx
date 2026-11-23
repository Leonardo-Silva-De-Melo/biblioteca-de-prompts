import './ConfirmarExclusao.css';

function ConfirmarExclusao({ prompt, isOpen, onConfirm, onCancel, isDeleting }) {
  
  if (!isOpen || !prompt) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Icon */}
        <div className="confirm-icon-container">
          <div className="confirm-icon">⚠️</div>
        </div>

        {/* Content */}
        <div className="confirm-content">
          <h3 className="confirm-title">Confirmar Exclusão</h3>
          <p className="confirm-message">
            Tem certeza que deseja deletar o prompt:
          </p>
          <div className="confirm-prompt-info">
            <div className="confirm-prompt-title">{prompt.titulo}</div>
            <div className="confirm-prompt-meta">
              {prompt.categoria} • {prompt.autor}
            </div>
          </div>
          
          <div className="confirm-warning">
            <strong>⚠️ Atenção:</strong> Esta ação não pode ser desfeita. 
            O prompt, seu histórico e todos os comentários serão permanentemente removidos.
          </div>
        </div>

        {/* Buttons */}
        <div className="confirm-buttons">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            ✕ Cancelar
          </button>
          <button 
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? '⏳ Deletando...' : '🗑️ Excluir'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmarExclusao;