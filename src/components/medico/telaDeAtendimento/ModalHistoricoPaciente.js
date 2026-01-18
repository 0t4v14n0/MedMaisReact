import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const ModalHistoricoPaciente = ({ doenca, onSave, onCancel, styles, colors, isDarkMode }) => {
  const [formData, setFormData] = useState({
    nomeDoenca: '',
    descricao: '',
    dataDiagnostico: '',
    dataRecuperacao: '',
    estadoAtual: 'ATIVA',
    tratamento: '',
    medicamentos: '',
    observacoesMedicas: '',
    gravidade: 'LEVE'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (doenca) {
      setFormData({
        nomeDoenca: doenca.nomeDoenca || '',
        descricao: doenca.descricao || '',
        dataDiagnostico: doenca.dataDiagnostico?.split('T')[0] || '',
        dataRecuperacao: doenca.dataRecuperacao?.split('T')[0] || '',
        estadoAtual: doenca.estadoAtual || 'ATIVA',
        tratamento: doenca.tratamento || '',
        medicamentos: doenca.medicamentos || '',
        observacoesMedicas: doenca.observacoesMedicas || '',
        gravidade: doenca.gravidade || 'LEVE'
      });
    } else {
      setFormData({
        nomeDoenca: '',
        descricao: '',
        dataDiagnostico: '',
        dataRecuperacao: '',
        estadoAtual: 'ATIVA',
        tratamento: '',
        medicamentos: '',
        observacoesMedicas: '',
        gravidade: 'LEVE'
      });
    }
  }, [doenca]);

  const estadosDoenca = ['ATIVA', 'CURADA', 'CRONICA', 'CONTROLADA'];
  const niveisGravidade = ['LEVE', 'MODERADA', 'GRAVE', 'INVESTIGACAO'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nomeDoenca.trim()) newErrors.nomeDoenca = 'Nome da doença é obrigatório';
    if (!formData.dataDiagnostico) newErrors.dataDiagnostico = 'Data de diagnóstico é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Estilos dinâmicos
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const contentStyle = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '25px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: colors.textSecondary,
    ':hover': {
      color: colors.danger
    }
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  };

  const errorTextStyle = {
    color: colors.danger,
    fontSize: '12px',
    marginTop: '5px'
  };

  const sectionStyle = {
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: `1px solid ${colors.border}`
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: colors.primary
  };

  const inputGroupStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: colors.textPrimary
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: colors.primary,
      boxShadow: `0 0 0 2px ${colors.primary}20`
    }
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical'
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '12px'
  };

  const buttonGroupStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: `1px solid ${colors.border}`
  };

  const cancelButtonStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: `${colors.border}20`
    }
  };

  const submitButtonStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: colors.primary,
    color: colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button onClick={onCancel} style={closeButtonStyle}>
          <FiX />
        </button>

        <h2 style={{ 
          marginTop: 0, 
          color: colors.textPrimary,
          marginBottom: '25px',
          fontSize: '22px'
        }}>
          {doenca ? 'Editar Histórico de Doença' : 'Adicionar Histórico de Doença'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Seção 1: Informações Básicas */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Informações Básicas</h4>
            <div style={formGridStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Nome da Doença*</label>
                <input
                  type="text"
                  name="nomeDoenca"
                  value={formData.nomeDoenca}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Ex: Diabetes Tipo 2"
                />
                {errors.nomeDoenca && <span style={errorTextStyle}>{errors.nomeDoenca}</span>}
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  style={textareaStyle}
                  placeholder="Descreva os sintomas e características da doença"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Classificação */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Classificação</h4>
            <div style={formGridStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Estado Atual*</label>
                <select
                  name="estadoAtual"
                  value={formData.estadoAtual}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  {estadosDoenca.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Gravidade*</label>
                <select
                  name="gravidade"
                  value={formData.gravidade}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  {niveisGravidade.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seção 3: Datas */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Período</h4>
            <div style={formGridStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Data de Diagnóstico*</label>
                <input
                  type="date"
                  name="dataDiagnostico"
                  value={formData.dataDiagnostico}
                  onChange={handleChange}
                  style={inputStyle}
                />
                {errors.dataDiagnostico && <span style={errorTextStyle}>{errors.dataDiagnostico}</span>}
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Data de Recuperação</label>
                <input
                  type="date"
                  name="dataRecuperacao"
                  value={formData.dataRecuperacao}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={formData.estadoAtual !== 'CURADA'}
                />
              </div>
            </div>
          </div>

          {/* Seção 4: Tratamento e Medicação */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Tratamento e Medicação</h4>
            <div style={formGridStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Tratamento Prescrito</label>
                <textarea
                  name="tratamento"
                  value={formData.tratamento}
                  onChange={handleChange}
                  style={textareaStyle}
                  placeholder="Descreva o tratamento recomendado"
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Medicamentos</label>
                <textarea
                  name="medicamentos"
                  value={formData.medicamentos}
                  onChange={handleChange}
                  style={textareaStyle}
                  placeholder="Liste os medicamentos prescritos"
                />
              </div>
            </div>
          </div>

          {/* Seção 5: Observações */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Observações Adicionais</h4>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Observações Médicas</label>
              <textarea
                name="observacoesMedicas"
                value={formData.observacoesMedicas}
                onChange={handleChange}
                style={textareaStyle}
                placeholder="Registre quaisquer observações relevantes"
              />
            </div>
          </div>

          {/* Botões */}
          <div style={buttonGroupStyle}>
            <button type="button" onClick={onCancel} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button type="submit" style={submitButtonStyle}>
              {doenca ? 'Atualizar Registro' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalHistoricoPaciente;