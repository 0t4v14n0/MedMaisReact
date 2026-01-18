import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/api';
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { generateStyles } from "../styles/globalStyles";
import { useRole } from "../contexts/RoleContext";
import { FiLogOut, FiUser } from 'react-icons/fi';

const UserProfile = () => {
    const { user, roles, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { activeRole } = useRole(); 

    const [pessoaData, setPessoaData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const shouldFetchData = user?.token && roles.some(r => r !== 'ADMIN');

        if (shouldFetchData) {
            setLoading(true);
            const fetchPessoaData = async () => {
                try {
                    const response = await api.get('/pessoa/dados/profile');
                    setPessoaData(response.data);
                } catch (error) {
                    console.error("Erro ao buscar dados de perfil:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPessoaData();
        }
    }, [user?.token, JSON.stringify(roles)]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const getFirstName = (fullName) => fullName ? fullName.split(' ')[0] : 'Usuário';
    const fotoUrl = pessoaData?.dataDetalhesPessoa?.fotoPerfilUrl;

    // --- LÓGICA DE CONTEÚDO DO PERFIL ---
    const getProfileContent = () => {
        if (loading && activeRole !== 'ADMIN') {
            return { name: 'Carregando...', detail: '...' };
        }

        switch (activeRole) {
            case 'ADMIN':
                return { name: 'Administrador', detail: 'Gerenciamento' };
            
            case 'MEDICO':
                return {
                    name: `Dr(a). ${getFirstName(pessoaData?.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome)}`,
                    detail: pessoaData?.especialidadesMedica?.[0]?.nome || 'Especialista'
                };
            
            case 'PACIENTE':
                return {
                    name: getFirstName(pessoaData?.dataDetalhesPessoa?.nome),
                    detail: pessoaData?.plano ? `Plano: ${pessoaData.plano.nome}` : 'Particular',
                    // ✨ AQUI: Adicionamos o saldo especificamente para o Paciente
                    saldo: pessoaData?.dataDetalhesPessoa?.saldo
                };
            
            case 'RECEPCAO':
            case 'FINANCEIRO':
            case 'COLETA':
            case 'LABORATORIO':
            case 'PROFESSOR':
                return {
                    name: getFirstName(pessoaData?.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome),
                    detail: activeRole.charAt(0) + activeRole.slice(1).toLowerCase()
                };
            
            default:
                return {
                    name: getFirstName(user.name) || 'Colaborador',
                    detail: 'Bem-vindo'
                };
        }
    };

    const content = getProfileContent();

    // Formata moeda
    const formatarDinheiro = (valor) => {
        return valor ? Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    };

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "6px 8px 6px 16px",
            backgroundColor: styles.colors.lightGray,
            borderRadius: "30px",
            border: `1px solid ${styles.colors.borderLight}`,
            transition: 'all 0.2s ease'
        }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: styles.colors.textDark, whiteSpace: "nowrap" }}>
                    {content.name}
                </span>
                
                <span style={{ fontSize: "11px", fontWeight: "500", color: styles.colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {content.detail}
                </span>

                {/* ✨ VISUALIZAÇÃO DO SALDO (Só aparece se content.saldo existir) */}
                {content.saldo !== undefined && (
                    <span style={{ 
                        fontSize: "11px", 
                        fontWeight: "800", 
                        color: styles.colors.success, // Verde para dinheiro
                        marginTop: '2px'
                    }}>
                        {formatarDinheiro(content.saldo)}
                    </span>
                )}
            </div>

            {/* Avatar */}
            <div style={{
                width: "36px", height: "36px", borderRadius: "50%", // Aumentei levemente para acomodar 3 linhas de texto se precisar
                backgroundColor: styles.colors.white,
                display: "flex", alignItems: "center", justifyContent: 'center',
                color: styles.colors.textMuted,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                overflow: "hidden",
                border: `1px solid ${styles.colors.borderLight}`
            }}>
                {fotoUrl ? (
                    <img 
                        src={fotoUrl} 
                        alt="Perfil" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                ) : (
                    <FiUser size={18} />
                )}
            </div>

            <div style={{ width: "1px", height: "24px", backgroundColor: styles.colors.border, margin: "0 4px" }}></div>

            <button 
                onClick={handleLogout}
                title="Sair do sistema"
                style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: styles.colors.danger, display: "flex", alignItems: "center",
                    justifyContent: "center", padding: "6px", borderRadius: "50%",
                    transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${styles.colors.danger}15`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
                <FiLogOut size={18} />
            </button>
        </div>
    );
};

export default UserProfile;