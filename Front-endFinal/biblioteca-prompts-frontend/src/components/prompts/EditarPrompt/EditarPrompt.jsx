import React, { useState, useEffect } from 'react';
import './EditarPrompt.css';
import { promptsAPI } from '../../../services/api';

function EditarPrompt({ prompt, isOpen, onClose, onSuccess, nomeUsuario, toast }) {
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descricao: '',
    textoPrompt: '',
    tags: '',
    motivoEdicao: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const categorias = [
    'Documentação',
    'Arquitetura',
    'Desenvolvimento',
    'Testes',
    'DevOps',
    'Banco de Dados'
  ];

  // Carregar dados do prompt ao abrir
  useEffect(() => {
    if (prompt && isOpen) {
      const tagsString = prompt.tags ? prompt.tags.join(', ') : '';
      const data = {
        titulo: prompt.titulo || '',
        categoria: prompt.categoria || '',
        descricao: prompt.descricao || '',
        textoPrompt: prompt.textoPrompt || '',
        tags: tagsString,
        motivoEdicao: ''
      };
      setFormData(data);
      setOriginalData(data);
      setHasChanges(false);
    }
  }, [prompt, isOpen]);

  // Detectar mudanças
  useEffect(() => {
    const changed =
      formData.titulo !== originalData.titulo ||
      formData.categoria !== originalData.categoria ||
      formData.descricao !== originalData.descricao ||
      formData.textoPrompt !== originalData.textoPrompt ||
      formData.tags !== originalData.tags;

    setHasChanges(changed);
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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

    if (hasChanges && !formData.motivoEdicao.trim()) {
      novosErros.motivoEdicao = 'Por favor, descreva o motivo da edição';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      //  Adicionado um Toast sutil de aviso em vez de travar o usuário
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos obrigatórios.', life: 3000 });
      return;
    }

    if (!hasChanges) {
      // Substituído o alert('ℹ️ Nenhuma alteração foi feita')
      toast.current?.show({ severity: 'info', summary: 'Info', detail: 'Nenhuma alteração foi feita.', life: 3000 });
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const promptDTO = {
        titulo: formData.titulo.trim(),
        categoria: formData.categoria,
        descricao: formData.descricao.trim(),
        textoPrompt: formData.textoPrompt.trim(),
        tags: tagsArray,
        editadoPor: nomeUsuario,
        motivoEdicao: formData.motivoEdicao.trim()
      };

      await promptsAPI.editar(prompt.id, promptDTO);

      //  Substituído o alert de sucesso pelo Toast
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Prompt atualizado com sucesso!', life: 3000 });

      if (onSuccess) onSuccess();
      if (onClose) onClose();

    } catch (error) {
      console.error('Erro ao atualizar prompt:', error);
      //  Substituído o alert de erro pelo Toast
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar o prompt. Tente novamente.', life: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Fecha sem o confirm() nativo do navegador. A perda de alterações é
      // aceitável aqui porque o cancelamento foi uma ação explícita do usuário.
      if (onClose) onClose();
    } else {
      if (onClose) onClose();
    }
  };

  const getChangeSummary = () => {
    const changes = [];
    if (formData.titulo !== originalData.titulo) changes.push('Título');
    if (formData.categoria !== originalData.categoria) changes.push('Categoria');
    if (formData.descricao !== originalData.descricao) changes.push('Descrição');
    if (formData.textoPrompt !== originalData.textoPrompt) changes.push('Prompt');
    if (formData.tags !== originalData.tags) changes.push('Tags');
    return changes;
  };

  if (!isOpen || !prompt) return null;

  return (
    <div className="edit-modal-overlay" onClick={handleCancel}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="edit-modal-header">
          <div>
            <h2 className="edit-modal-title">✏️ Editar Prompt</h2>
            <p className="edit-modal-subtitle">
              Editando: <strong>{prompt.titulo}</strong>
            </p>
          </div>
          <button className="edit-close-btn" onClick={handleCancel}>✕</button>
        </div>

        {/* Change Indicator */}
        {hasChanges && (
          <div className="change-indicator">
            <div className="change-badge">
              💡 Alterações detectadas: {getChangeSummary().join(', ')}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-form">

          {/* Título */}
          <div className="form-group">
            <label htmlFor="titulo" className="form-label">
              Título do Prompt <span className="required">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              className={`form-input ${errors.titulo ? 'input-error' : ''} ${formData.titulo !== originalData.titulo ? 'input-changed' : ''
                }`}
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
              className={`form-select ${errors.categoria ? 'input-error' : ''} ${formData.categoria !== originalData.categoria ? 'input-changed' : ''
                }`}
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
              className={`form-textarea ${errors.descricao ? 'input-error' : ''} ${formData.descricao !== originalData.descricao ? 'input-changed' : ''
                }`}
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
              className={`form-textarea prompt-textarea ${errors.textoPrompt ? 'input-error' : ''} ${formData.textoPrompt !== originalData.textoPrompt ? 'input-changed' : ''
                }`}
              placeholder="Cole aqui o texto completo do seu prompt..."
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
              className={`form-input ${formData.tags !== originalData.tags ? 'input-changed' : ''
                }`}
              placeholder="Ex: crud, api, backend, spring-boot"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          {/* Motivo da Edição - OBRIGATÓRIO se houver mudanças */}
          {hasChanges && (
            <div className="form-group motivo-group">
              <label htmlFor="motivoEdicao" className="form-label">
                Motivo da Edição <span className="required">*</span>
              </label>
              <textarea
                id="motivoEdicao"
                name="motivoEdicao"
                className={`form-textarea ${errors.motivoEdicao ? 'input-error' : ''}`}
                placeholder="Ex: Corrigir erro de digitação, Adicionar exemplo, Melhorar explicação..."
                value={formData.motivoEdicao}
                onChange={handleChange}
                rows={2}
                maxLength={500}
              />
              {errors.motivoEdicao && <span className="error-message">{errors.motivoEdicao}</span>}
              <span className="form-hint">
                📝 O motivo da edição será registrado no histórico de versões
              </span>
            </div>
          )}

          {/* Informações */}
          <div className="form-info">
            <p>📝 <strong>Editado por:</strong> {nomeUsuario}</p>
            <p>📅 <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            <p>🔄 <strong>Versão original por:</strong> {prompt.autor}</p>
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? '⏳ Salvando...' : '✅ Salvar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditarPrompt;