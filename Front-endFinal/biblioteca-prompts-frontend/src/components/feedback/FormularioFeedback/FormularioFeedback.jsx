import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Star, Send, CheckCircle } from 'lucide-react';
import "./FormularioFeedback.css";
import { feedbackPlataformaAPI } from '../../../services/api';

const FormularioFeedback = ({ nomeUsuario }) => {
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const toast = useRef(null);

  // 2. Transforma o handleSubmit em ASYNC para falar com o banco
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nota === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, selecione uma nota de 1 a 5 estrelas antes de enviar.',
        sticky: true
      });
      return;
    }

    setEnviando(true);

    try {
      // passamos 'nomeUsuario' para o parâmetro 'usuario'
      // Isso resolve o problema de o banco ficar vazio
      await feedbackPlataformaAPI.enviar(nota, comentario, nomeUsuario);

      console.log("Feedback enviado com sucesso para o banco!");
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso!',
        detail: 'Feedback enviado com sucesso para a DGTI.',
        sticky: true
      });
      setEnviado(true);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Ocorreu um erro ao salvar sua avaliação. Tente novamente.',
        life: 5000
      });
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="feedback-container">
        <div className="feedback-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Muito Obrigado!</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Seu feedback foi registrado e ajudará a DGTI a melhorar a Biblioteca de Prompts.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '2rem' }}
            onClick={() => { setEnviado(false); setNota(0); setComentario(''); }}
          >
            Enviar nova avaliação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <h2>Avalie a Biblioteca de Prompts</h2>
          <p>Sua opinião é fundamental para evoluirmos nossa plataforma de engenharia.</p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-stars-section">
            <label>1. Como você avalia sua experiência com o sistema?</label>
            <div className="stars-container">
              {[...Array(5)].map((_, index) => {
                const valorEstrela = index + 1;
                return (
                  <button
                    type="button"
                    key={valorEstrela}
                    className={`star-button ${valorEstrela <= (hover || nota) ? 'ativo' : ''}`}
                    onClick={() => setNota(valorEstrela)}
                    onMouseEnter={() => setHover(valorEstrela)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star
                      size={40}
                      fill={valorEstrela <= (hover || nota) ? "#fbbf24" : "transparent"}
                      stroke={valorEstrela <= (hover || nota) ? "#f59e0b" : "#cbd5e1"}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <div className="stars-label">
              {nota === 1 && "Péssimo"}
              {nota === 2 && "Ruim"}
              {nota === 3 && "Razoável"}
              {nota === 4 && "Muito Bom"}
              {nota === 5 && "Excelente!"}
            </div>
          </div>

          <div className="feedback-text-section">
            <label htmlFor="comentario">2. O que podemos melhorar? (Opcional)</label>
            <textarea
              id="comentario"
              rows="5"
              placeholder="Ex: Gostaria que a IA gerasse os códigos em Python também..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="feedback-textarea"
            ></textarea>
          </div>

          <button
            type="submit"
            className="feedback-submit-btn"
            disabled={enviando || nota === 0}
          >
            {enviando ? 'Enviando...' : (
              <>
                <Send size={20} />
                Enviar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioFeedback;