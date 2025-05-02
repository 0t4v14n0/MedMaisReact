import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/api';
import { useAuth } from "../auth/AuthContext";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pessoaData, setPessoaData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPessoaData = async () => {
      if (user?.token) {
        setLoading(true);
        try {
          const response = await api.get('/pessoa/dados', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          setPessoaData(response.data);
          console.log(pessoaData.saldo);
        } catch (error) {
          console.error("Erro ao buscar dados da pessoa:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPessoaData();
  }, [user]);

  if (!user) return null;

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
          <div style={{ textAlign: "right" }}>
            <div style={{ 
              fontWeight: "600",
              color: "#333",
              fontSize: "14px",
              marginBottom: "4px"
            }}>
              {pessoaData?.dataDetalhesPessoa.nome || user.nome}
            </div>
            <div style={{
              display: "flex",
              gap: "10px",
              fontSize: "13px"
            }}>
              <span style={{ color: "#28a745", fontWeight: "500" }}>
                Plano: {pessoaData?.plano || 'N/A'}
              </span>
              {pessoaData?.dataDetalhesPessoa?.saldo !== undefined && (
                <span style={{ color: "#17a2b8", fontWeight: "500" }}>
                  Saldo: R$ {pessoaData.dataDetalhesPessoa.saldo.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{ 
              padding: "6px 12px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              transition: "background 0.2s",
              ':hover': {
                background: "#c82333"
              }
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