import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/api';
import { useAuth } from "../auth/AuthContext";

const UserProfile = () => {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();
  const [pessoaData, setPessoaData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verifica se o usuário tem algum role (pega o primeiro role como principal)
  const userRole = roles.length > 0 ? roles[0] : null;

  useEffect(() => {
    // Só faz fetch se for usuário válido, tiver token e não for ADMIN
    if (user?.token && userRole && userRole !== 'ADMIN') {
      setLoading(true);
      const fetchPessoaData = async () => {
        try {
          const response = await api.get('/pessoa/dados', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          setPessoaData(response.data);
        } catch (error) {
          console.error("Erro ao buscar dados da pessoa:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPessoaData();
    }
  }, [user, userRole]);

  const handleLogout = () => {
    // Reset local state before logout
    setPessoaData(null);
    setLoading(false);
    
    // Perform logout
    logout();
    
    // Redirect
    navigate('/');
  };

  if (!user || !userRole) return null;

  const renderProfileContent = () => {
    switch(userRole) {
      case 'ADMIN':
        return (
          <div style={{ textAlign: "right" }}>
            <div style={{ 
              fontWeight: "600",
              color: "#333",
              fontSize: "14px",
              marginBottom: "4px"
            }}>
              Admin
            </div>
            <div style={{
              fontSize: "13px",
              color: "#6c757d",
              fontWeight: "500"
            }}>
              Acesso total ao sistema
            </div>
          </div>
        );
      
      case 'MEDICO':
        return (
          <div style={{ textAlign: "right" }}>
            <div style={{ 
              fontWeight: "600",
              color: "#333",
              fontSize: "14px",
              marginBottom: "4px"
            }}>
              Dr. {pessoaData?.dataDetalhesPessoa?.nome || 'Médico'}
            </div>
            <div style={{
              display: "flex",
              gap: "10px",
              fontSize: "13px"
            }}>
              <span style={{ color: "#6c757d", fontWeight: "500" }}>
                CRM: {pessoaData?.crm || 'N/A'}
              </span>
              <span style={{ color: "#17a2b8", fontWeight: "500" }}>
                Especialidade: {pessoaData?.especialidade || 'N/A'}
              </span>
            </div>
          </div>
        );
      
      case 'PACIENTE':
        return (
          <div style={{ textAlign: "right" }}>
            <div style={{ 
              fontWeight: "600",
              color: "#333",
              fontSize: "14px",
              marginBottom: "4px"
            }}>
              {pessoaData?.dataDetalhesPessoa?.nome || 'Paciente'}
            </div>
            <div style={{
              display: "flex",
              gap: "10px",
              fontSize: "13px"
            }}>
              <span style={{ color: "#28a745", fontWeight: "500" }}>
                {/* LINHA CORRIGIDA ABAIXO */}
                Plano: {pessoaData?.plano?.nome || 'Sem Plano'}
              </span>
              <span style={{ color: "#17a2b8", fontWeight: "500" }}>
                Saldo: R$ {pessoaData?.dataDetalhesPessoa?.saldo?.toFixed(2) ?? '0.00'}
              </span>
            </div>
          </div>
        );
      
      default:
        return (
          <div style={{ textAlign: "right" }}>
            <div style={{ 
              fontWeight: "600",
              color: "#333",
              fontSize: "14px",
              marginBottom: "4px"
            }}>
              Usuário
            </div>
            <div style={{ fontSize: "13px", color: "#6c757d" }}>
              Tipo de conta não identificado
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "15px",
      padding: "8px 12px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <>
          {renderProfileContent()}
          <button 
            onClick={handleLogout}
            style={{ 
              padding: "6px 12px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              transition: "background 0.2s"
            }}
          >
            Sair
          </button>
        </>
      )}
    </div>
  );
};

export default UserProfile;
