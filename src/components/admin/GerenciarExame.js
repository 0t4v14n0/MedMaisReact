import React, { useState } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import TabelaExames from './exames/TabelaExames';
import FormularioExame from './exames/FormularioExame';

const Toast = ({ message, type, onClose, colors }) => (
  <div style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1002,
    backgroundColor: type === 'success' ? colors.success : colors.danger,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    maxWidth: 'calc(100% - 40px)',
    wordBreak: 'break-word',
    animation: 'slideIn 0.3s ease-out',
    '@media (max-width: 768px)': {
      top: '10px',
      right: '10px',
      left: '10px',
      maxWidth: 'calc(100% - 20px)'
    }
  }}>
    {message}
    <button 
      onClick={onClose} 
      style={{ 
        background: 'none', 
        border: 'none', 
        color: 'white', 
        fontSize: '16px', 
        cursor: 'pointer',
        flexShrink: 0
      }}
    >
      &times;
    </button>
  </div>
);

const Modal = ({ message, onConfirm, onCancel, styles, colors }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
    padding: '15px'
  }}>
    <div style={{ 
      ...styles.app.card, 
      padding: '25px', 
      width: '100%', 
      maxWidth: '450px',
      boxSizing: 'border-box',
      margin: '0 15px',
      border: `2px solid ${colors.primary}`
    }}>
      <p style={{ ...styles.app.text, margin: 0, marginBottom: '20px' }}>{message}</p>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={onCancel} 
          style={{ 
            ...styles.app.button, 
            backgroundColor: colors.secondary,
            minWidth: '100px',
            border: 'none'
          }}
        >
          Cancelar
        </button>
        <button 
          onClick={onConfirm} 
          style={{ 
            ...styles.app.button, 
            backgroundColor: colors.danger,
            minWidth: '100px',
            border: 'none'
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
);

const GerenciarExames = () => {
  const { isDarkMode } = useTheme();
  const theme = generateStyles(isDarkMode) || {};
  const styles = theme.styles || { app: {} };
  const colors = theme.colors || {};

  const [vistaAtual, setVistaAtual] = useState("TabelaExames");
  const [exameParaEditar, setExameParaEditar] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [modal, setModal] = useState({ show: false, message: '', onConfirm: () => {} });
  const [refreshKey, setRefreshKey] = useState(0);

  const mostrarToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => { setToast({ show: false, message: '', type: 'success' }); }, 3000);
  };

  const fecharModal = () => setModal({ show: false, message: '', onConfirm: null });

  const handleSave = async (formData) => {
    try {
      if (exameParaEditar) {
        const payload = { ...formData, valor: parseFloat(formData.valor) };
        await api.put(`/admin/exame/atualizar/${exameParaEditar.id}`, payload);
        mostrarToast("Exame atualizado com sucesso!");
      } else {
        const { ativo, ...rest } = formData;
        const payload = { ...rest, valor: parseFloat(formData.valor) };
        await api.post('/admin/exame/criar', payload);
        mostrarToast("Exame cadastrado com sucesso!");
      }
      setVistaAtual("TabelaExames");
      setExameParaEditar(null);
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error("Erro ao salvar exame:", error);
      mostrarToast(error.response?.data?.message || "Erro ao salvar exame.", "error");
    }
  };

  const handleDesativar = (exame) => {
    const message = `Tem certeza que deseja desativar o exame "${exame.nome}"?`;
    const confirmAction = async () => {
      try {
        await api.delete(`/admin/exame/desativar/${exame.id}`);
        mostrarToast(`Exame "${exame.nome}" desativado com sucesso!`);
        setRefreshKey(prevKey => prevKey + 1);
      } catch (error) {
        mostrarToast("Erro ao desativar o exame.", "error");
      }
      fecharModal();
    };
    setModal({ show: true, message, onConfirm: confirmAction });
  };

  const handleEdit = (exame) => {
    setExameParaEditar(exame);
    setVistaAtual("FormularioExame");
  };

  const renderizarConteudo = () => {
    switch (vistaAtual) {
      case "TabelaExames":
        return (
          <div style={{
            backgroundColor: isDarkMode ? colors.background : colors.backgroundLight,
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: `1px solid ${colors.border}`,
            marginTop: '20px'
          }}>
            <TabelaExames key={refreshKey} onEdit={handleEdit} onDesativar={handleDesativar} onRefresh={refreshKey} />
          </div>
        );
      case "FormularioExame":
        return (
          <div style={{
            backgroundColor: isDarkMode ? colors.primaryLight : colors.primaryLighter,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: `2px solid ${colors.primary}`,
            marginTop: '20px'
          }}>
            <div style={{
              backgroundColor: colors.white,
              padding: '25px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <FormularioExame 
                exameParaEditar={exameParaEditar} 
                onSave={handleSave} 
                onCancel={() => {
                  setExameParaEditar(null);
                  setVistaAtual("TabelaExames");
                }} 
              />
            </div>
          </div>
        );
      default:
        return (
          <div style={{
            backgroundColor: isDarkMode ? colors.background : colors.backgroundLight,
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: `1px solid ${colors.border}`,
            marginTop: '20px'
          }}>
            <TabelaExames key={refreshKey} onEdit={handleEdit} onDesativar={handleDesativar} onRefresh={refreshKey} />
          </div>
        );
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
      minHeight: '100vh'
    }}>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '' })} colors={colors} />}
      {modal.show && <Modal message={modal.message} onConfirm={modal.onConfirm} onCancel={fecharModal} styles={styles} colors={colors} />}
      
      <div style={{
        backgroundColor: isDarkMode ? colors.backgroundDark : colors.background,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{
          ...styles.app.title,
          color: colors.primary,
          marginBottom: '20px',
          fontSize: '1.8rem',
          borderBottom: `2px solid ${colors.primary}`,
          paddingBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ 
            backgroundColor: colors.primary,
            color: colors.white,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>🧪</span>
          Gerenciamento de Exames
        </h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => setVistaAtual("TabelaExames")}
            style={{ 
              ...styles.app.button, 
              backgroundColor: vistaAtual === "TabelaExames" ? colors.primaryDark : colors.primary,
              flex: '1 1 200px',
              minWidth: '250px',
              maxWidth: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              fontSize: '1rem',
              border: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <span>📋</span> Listar Exames
          </button>
          <button 
            onClick={() => { setExameParaEditar(null); setVistaAtual("FormularioExame"); }}
            style={{ 
              ...styles.app.button, 
              backgroundColor: vistaAtual === "FormularioExame" && !exameParaEditar ? colors.primaryDark : colors.primary,
              flex: '1 1 200px',
              minWidth: '250px',
              maxWidth: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              fontSize: '1rem',
              border: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <span>➕</span> Cadastrar Novo Exame
          </button>
        </div>
      </div>
      
      {renderizarConteudo()}
      
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GerenciarExames;