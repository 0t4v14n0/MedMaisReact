import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// 1. Importando os componentes de seus respectivos arquivos
import FormularioMedico from './FormularioMedico';
import TabelaMedicos from './TabelaMedicos'; 
// import { Toast, Modal } from '../ui/Components'; // Idealmente, viriam de um arquivo de UI

// =================================================================
// COMPONENTES AUXILIARES (Idealmente, em seus próprios arquivos de UI)
// =================================================================
const Toast = ({ message, type, onClose, colors }) => (
  <div style={{
      position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', 
      borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1002,
      backgroundColor: type === 'success' ? colors.success : colors.danger,
      color: colors.white,
      display: 'flex', alignItems: 'center', gap: '15px'
  }}>
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>&times;</button>
  </div>
);

const Modal = ({ message, onConfirm, onCancel, styles, colors }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1001
    }}>
        <div style={{...styles.app.card, padding: '25px', width: '90%', maxWidth: '450px'}}>
            <p style={{...styles.app.text, margin: 0, marginBottom: '20px', whiteSpace: 'pre-wrap'}}>{message}</p>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                <button onClick={onCancel} style={{...styles.app.button, backgroundColor: colors.secondary}}>Cancelar</button>
                <button onClick={onConfirm} style={{...styles.app.button, backgroundColor: colors.danger}}>Confirmar</button>
            </div>
        </div>
    </div>
);


// =================================================================
// COMPONENTE PRINCIPAL: Gerenciador de Médicos
// =================================================================
const GerenciarMedicos = () => {
  const { isDarkMode } = useTheme();
  
  const theme = generateStyles(isDarkMode) || {};
  const styles = theme.styles || { app: {} }; 
  const colors = theme.colors || {};

  const [vistaAtual, setVistaAtual] = useState("TabelaMedicos");
  const [medicoParaEditar, setMedicoParaEditar] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [modal, setModal] = useState({ show: false, message: '', onConfirm: () => {} });
  const [refreshKey, setRefreshKey] = useState(0);

  const mostrarToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => { setToast({ show: false, message: '', type: 'success' }); }, 3000);
  };

  const mostrarModal = (message, onConfirm) => {
    setModal({ show: true, message, onConfirm });
  };

  const fecharModal = () => setModal({ show: false, message: '', onConfirm: null });

  const handleSave = async (formDataRequest) => {
    try {
      if (medicoParaEditar) {
        // Para atualizar com multipart, o ideal é usar POST no backend
        await api.post(`/admin/medico/atualizar/${medicoParaEditar.id}`, formDataRequest);
        mostrarToast("Médico atualizado com sucesso!");
      } else {
        await api.post('/admin/medico/cadastroMedico', formDataRequest);
        mostrarToast("Médico cadastrado com sucesso!");
      }
      setVistaAtual("TabelaMedicos");
      setMedicoParaEditar(null);
      setRefreshKey(prevKey => prevKey + 1);
    } catch(error) {
      console.error("Erro ao salvar médico:", error);
      mostrarToast(error.response?.data?.message || "Erro ao salvar médico.", "error");
    }
  };

  const handleToggleStatus = (medico) => {
    const statusAtual = medico?.dataDetalhesFuncionario?.status;
    const nomeMedico = medico?.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome || 'o médico';
    const novoStatus = statusAtual === 'ATIVO' ? 'DEMITIDO' : 'ATIVO';
    const message = `Tem a certeza que deseja alterar o status de ${nomeMedico} para ${novoStatus}?`;

    const confirmAction = async () => {
        try {
            await api.put(`/admin/funcionario/status/${medico.id}/${novoStatus}`);
            mostrarToast(`Status do médico alterado para ${novoStatus} com sucesso!`);
            setRefreshKey(prevKey => prevKey + 1);
        } catch(error) {
            mostrarToast("Erro ao alterar status.", "error");
        }
        fecharModal();
    };
    
    mostrarModal(message, confirmAction);
  };
  
  const handleDelete = (medico) => {
    const nomeMedico = medico?.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome || 'o médico';
    const message = `ATENÇÃO: AÇÃO IRREVERSÍVEL!\n\nIsto irá apagar PERMANENTEMENTE ${nomeMedico} do sistema.\n\nEsta ação não é recomendada se o médico possuir histórico. Para isso, use a opção "Demitir".\n\nDeseja continuar?`;

    const confirmAction = async () => {
        try {
            await api.delete(`/admin/medico/${medico.id}`);
            mostrarToast("Médico deletado permanentemente com sucesso!");
            setRefreshKey(prevKey => prevKey + 1);
        } catch(error) {
            console.error("Erro ao deletar médico:", error);
            mostrarToast(error.response?.data?.message || "Erro ao deletar médico.", "error");
        }
        fecharModal();
    };

    mostrarModal(message, confirmAction);
  };

  const handleEdit = (medico) => {
    setMedicoParaEditar(medico);
    setVistaAtual("Formulario");
  };

  const renderizarConteudo = () => {
    switch (vistaAtual) {
      case "TabelaMedicos":
        return <TabelaMedicos 
                  key={refreshKey} 
                  onEdit={handleEdit} 
                  onToggleStatus={handleToggleStatus} 
                  onDelete={handleDelete}
                  onRefresh={refreshKey}
                />;
      case "Formulario":
        return <FormularioMedico 
                  medicoParaEditar={medicoParaEditar} 
                  onSave={handleSave} 
                  onCancel={() => {
                      setMedicoParaEditar(null);
                      setVistaAtual("TabelaMedicos");
                  }} 
                />;
      default:
        return <TabelaMedicos onEdit={handleEdit} />;
    }
  };

  return (
    <div>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: ''})} colors={colors} />}
      {modal.show && <Modal message={modal.message} onConfirm={modal.onConfirm} onCancel={fecharModal} styles={styles} colors={colors} />}
      
      <nav style={{ ...styles.app.card, padding: '15px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => {
              setMedicoParaEditar(null);
              setVistaAtual("Formulario")
          }}
          style={{...styles.app.button, backgroundColor: vistaAtual === "Formulario" && !medicoParaEditar ? colors.primaryDark : colors.primary, margin: 0}}
        >
          Cadastrar Novo Médico
        </button>
        <button 
          onClick={() => setVistaAtual("TabelaMedicos")}
          style={{...styles.app.button, backgroundColor: vistaAtual === "TabelaMedicos" ? colors.primaryDark : colors.primary, margin: 0}}
        >
          Listar Médicos
        </button>
      </nav>
      
      {renderizarConteudo()}
    </div>
  );
};

export default GerenciarMedicos;
