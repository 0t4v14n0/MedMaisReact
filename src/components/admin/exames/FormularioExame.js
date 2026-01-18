import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';

const FormularioExame = ({ exameParaEditar, onSave, onCancel }) => {
  const { isDarkMode } = useTheme();
  const theme = generateStyles(isDarkMode) || {};
  const styles = theme.styles || { app: {} };
  const colors = theme.colors || {};

  const inputStyles = {
    ...(styles.app.input || {}),
    borderColor: styles.app.input?.borderColor || '#ccc',
    width: '100%',
    boxSizing: 'border-box'
  };

  const estadoInicial = {
    nome: '',
    codigo: '',
    categoria: 'LABORATORIAL',
    descricao: '',
    preparacao: '',
    valor: '',
    ativo: true
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (exameParaEditar) {
      setFormData({
        nome: exameParaEditar.nome || '',
        codigo: exameParaEditar.codigo || '',
        categoria: exameParaEditar.categoria || 'LABORATORIAL',
        descricao: exameParaEditar.descricao || '',
        preparacao: exameParaEditar.preparacao || '',
        valor: exameParaEditar.valor?.toString() || '',
        ativo: exameParaEditar.ativo
      });
    } else {
      setFormData(estadoInicial);
    }
  }, [exameParaEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.codigo.trim()) newErrors.codigo = 'Código é obrigatório';
    if (!formData.valor || isNaN(formData.valor) || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'Valor deve ser um número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
  };

  const categoriasExame = ['LABORATORIAL', 'IMAGEM', 'CARDIOLOGICO', 'ENDOSCOPIA', 'OUTROS'];

  return (
    <div style={{ 
      ...styles.app.card,
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ 
        ...styles.app.title, 
        marginBottom: '25px',
        fontSize: '1.5rem',
        textAlign: 'center',
        color: colors.textPrimary
      }}>
        {exameParaEditar ? 'Editar Exame' : 'Cadastrar Novo Exame'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={styles.app.formGroup}>
            <label style={styles.app.label}>Nome do Exame *</label>
            <input 
              style={{ 
                ...inputStyles,
                borderColor: errors.nome ? colors.danger : inputStyles.borderColor
              }} 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              placeholder="Ex: Hemograma Completo"
            />
            {errors.nome && (
              <span style={{ 
                color: colors.danger, 
                fontSize: '0.8rem',
                marginTop: '5px',
                display: 'block'
              }}>
                {errors.nome}
              </span>
            )}
          </div>
          
          <div style={styles.app.formGroup}>
            <label style={styles.app.label}>Código *</label>
            <input 
              style={{ 
                ...inputStyles,
                borderColor: errors.codigo ? colors.danger : inputStyles.borderColor
              }} 
              type="text" 
              name="codigo" 
              value={formData.codigo} 
              onChange={handleChange} 
              placeholder="Ex: HEMO-001"
            />
            {errors.codigo && (
              <span style={{ 
                color: colors.danger, 
                fontSize: '0.8rem',
                marginTop: '5px',
                display: 'block'
              }}>
                {errors.codigo}
              </span>
            )}
          </div>
          
          <div style={styles.app.formGroup}>
            <label style={styles.app.label}>Categoria *</label>
            <select 
              style={inputStyles} 
              name="categoria" 
              value={formData.categoria} 
              onChange={handleChange} 
              required
            >
              {categoriasExame.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.app.formGroup}>
            <label style={styles.app.label}>Valor (R$) *</label>
            <input 
              style={{ 
                ...inputStyles,
                borderColor: errors.valor ? colors.danger : inputStyles.borderColor
              }} 
              type="number" 
              name="valor" 
              value={formData.valor} 
              onChange={handleChange} 
              step="0.01" 
              min="0" 
              placeholder="0,00"
            />
            {errors.valor && (
              <span style={{ 
                color: colors.danger, 
                fontSize: '0.8rem',
                marginTop: '5px',
                display: 'block'
              }}>
                {errors.valor}
              </span>
            )}
          </div>
        </div>
        
        <div style={styles.app.formGroup}>
          <label style={styles.app.label}>Descrição</label>
          <textarea 
            style={{ 
              ...inputStyles,
              minHeight: '100px',
              resize: 'vertical'
            }} 
            name="descricao" 
            value={formData.descricao} 
            onChange={handleChange} 
            placeholder="Descreva o exame e seus componentes"
          />
        </div>
        
        <div style={styles.app.formGroup}>
          <label style={styles.app.label}>Instruções de Preparação</label>
          <textarea 
            style={{ 
              ...inputStyles,
              minHeight: '100px',
              resize: 'vertical'
            }} 
            name="preparacao" 
            value={formData.preparacao} 
            onChange={handleChange} 
            placeholder="Informe as instruções para o paciente"
          />
        </div>
        
        {exameParaEditar && (
          <div style={{ 
            ...styles.app.formGroup, 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <input 
              type="checkbox" 
              id="ativo" 
              name="ativo" 
              checked={formData.ativo} 
              onChange={handleChange} 
              style={{ 
                marginRight: '10px',
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }} 
            />
            <label 
              htmlFor="ativo" 
              style={{ 
                ...styles.app.label,
                marginBottom: 0,
                cursor: 'pointer'
              }}
            >
              Ativo
            </label>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '15px', 
          marginTop: '30px',
          flexWrap: 'wrap'
        }}>
          <button 
            type="button" 
            onClick={onCancel} 
            style={{ 
              ...styles.app.button, 
              backgroundColor: colors.secondary || 'grey',
              minWidth: '120px',
              padding: '10px 15px'
            }} 
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            style={{ 
              ...styles.app.button, 
              backgroundColor: colors.primary || 'blue',
              minWidth: '120px',
              padding: '10px 15px',
              opacity: isLoading ? 0.7 : 1
            }} 
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ marginRight: '8px' }}>Salvando...</span>
                <div className="spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${colors.white}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </span>
            ) : 'Salvar'}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          form > div:first-child {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default FormularioExame;