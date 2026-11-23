import { useState } from 'react';
import './FormularioPrompt.css';
import { promptsAPI } from '../../../services/api';

function FormularioPrompt({ isOpen, onClose, onSuccess, nomeUsuario, toast }) {
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descricao: '',
    textoPrompt: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    'Documentação',
    'Arquitetura',
    'Desenvolvimento',
    'Testes',
    'DevOps',
    'Banco de Dados',
    'Segurança',
    'Onboarding'

  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.titulo.trim()) {
      novosErros.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length > 200) {
      novosErros.titulo = 'Título deve ter no máximo 200 caracteres';
    }

    if (!formData.categoria) {
      novosErros.categoria = 'Selecione uma categoria';
    }

    if (!formData.textoPrompt.trim()) {
      novosErros.textoPrompt = 'O texto do prompt é obrigatório';
    } else if (formData.textoPrompt.length < 50) {
      novosErros.textoPrompt = 'O prompt deve ter pelo menos 50 caracteres';
    }

    if (formData.descricao && formData.descricao.length > 500) {
      novosErros.descricao = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Processar tags (separadas por vírgula)
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const promptDTO = {
        titulo: formData.titulo.trim(),
        categoria: formData.categoria,
        descricao: formData.descricao.trim(),
        textoPrompt: formData.textoPrompt.trim(),
        autor: nomeUsuario,
        tags: tagsArray
      };

      await promptsAPI.criar(promptDTO);

      if (toast?.current) {
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Prompt criado com sucesso!', life: 3000 });
      } else {
        alert('✅ Prompt criado com sucesso!');
      }

      // Resetar formulário
      setFormData({
        titulo: '',
        categoria: '',
        descricao: '',
        textoPrompt: '',
        tags: ''
      });

      // Chamar callback de sucesso e fechar modal
      if (onSuccess) onSuccess();
      if (onClose) onClose();

    } catch (error) {
      console.error('Erro ao criar prompt:', error);
      
      const isForbidden = error.response?.status === 403;
      const summary = isForbidden ? 'Acesso Negado' : 'Erro';
      const detail = isForbidden ? 'Você não tem permissão para criar novos prompts.' : 'Erro ao criar prompt. Tente novamente.';

      if (toast?.current) {
        toast.current.show({ severity: 'error', summary, detail, life: 4000 });
      } else {
        alert(`❌ ${summary}: ${detail}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // if (window.confirm('Deseja cancelar? Os dados não salvos serão perdidos.')) 

    setFormData({
      titulo: '',
      categoria: '',
      descricao: '',
      textoPrompt: '',
      tags: ''
    });
    setErrors({});
    if (onClose) onClose();

  };

  if (!isOpen) return null;

  return (
    <div className="form-modal-overlay" onClick={handleCancel}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="form-modal-header">
          <div>
            <h2 className="form-modal-title">➕ Adicionar Novo Prompt</h2>
            <p className="form-modal-subtitle">
              Compartilhe seu conhecimento com a equipe da DGTI
            </p>
          </div>
          <button className="form-close-btn" onClick={handleCancel}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="prompt-form">

          {/* Título */}
          <div className="form-group">
            <label htmlFor="titulo" className="form-label">
              Título do Prompt <span className="required">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              className={`form-input ${errors.titulo ? 'input-error' : ''}`}
              placeholder="Ex: Geração de CRUD Completo"
              value={formData.titulo}
              onChange={handleChange}
              maxLength={200}
            />
            {errors.titulo && <span className="error-message">{errors.titulo}</span>}
            <span className="char-count">{formData.titulo.length}/200</span>
          </div>

          {/* Categoria */}
          <div className="form-group">
            <label htmlFor="categoria" className="form-label">
              Categoria <span className="required">*</span>
            </label>
            <select
              id="categoria"
              name="categoria"
              className={`form-select ${errors.categoria ? 'input-error' : ''}`}
              value={formData.categoria}
              onChange={handleChange}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.categoria && <span className="error-message">{errors.categoria}</span>}
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="descricao" className="form-label">
              Descrição Breve
            </label>
            <textarea
              id="descricao"
              name="descricao"
              className={`form-textarea ${errors.descricao ? 'input-error' : ''}`}
              placeholder="Uma breve descrição do que este prompt faz..."
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              maxLength={500}
            />
            {errors.descricao && <span className="error-message">{errors.descricao}</span>}
            <span className="char-count">{formData.descricao.length}/500</span>
          </div>

          {/* Texto do Prompt */}
          <div className="form-group">
            <label htmlFor="textoPrompt" className="form-label">
              Texto Completo do Prompt <span className="required">*</span>
            </label>
            <textarea
              id="textoPrompt"
              name="textoPrompt"
              className={`form-textarea prompt-textarea ${errors.textoPrompt ? 'input-error' : ''}`}
              placeholder="Cole aqui o texto completo do seu prompt...

            Exemplo:
            Você é um desenvolvedor sênior especializado em...

            Tarefa: Crie um CRUD completo para [ENTIDADE] com:
            - Backend: [FRAMEWORK]
            - Banco de dados: [DATABASE]
            ..."
              value={formData.textoPrompt}
              onChange={handleChange}
              rows={12}
            />
            {errors.textoPrompt && <span className="error-message">{errors.textoPrompt}</span>}
            <span className="char-count">{formData.textoPrompt.length} caracteres</span>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              className="form-input"
              placeholder="Ex: crud, api, backend, spring-boot"
              value={formData.tags}
              onChange={handleChange}
            />
            <span className="form-hint">
              💡 Adicione palavras-chave para facilitar a busca
            </span>
          </div>

          Preview de Tags
          {formData.tags && (
            <div className="tags-preview">
              <strong>Preview das tags:</strong>
              <div className="tags-list">
                {formData.tags.split(',').map((tag, i) => (
                  tag.trim() && <span key={i} className="tag-preview">#{tag.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Informações do Autor */}
          <div className="form-info">
            <p>📝 <strong>Autor:</strong> {nomeUsuario}</p>
            <p>📅 <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            {/* <button 
              type="button" 
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              ✕ Cancelar
            </button> */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Salvando...' : '✅ Salvar Prompt'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default FormularioPrompt;