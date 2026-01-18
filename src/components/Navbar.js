import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useRole } from "../contexts/RoleContext";
import { generateStyles } from "../styles/globalStyles"; 
import UserProfile from "./UserProfile";
import { FiMenu, FiX } from "react-icons/fi"; // Ícones para o menu mobile

const Navbar = () => {
    const { user, roles } = useAuth();
    const { isDarkMode } = useTheme();
    const { setActiveRole } = useRole();
    
    // Estado para controlar o menu mobile
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const location = useLocation(); // Para fechar o menu ao mudar de rota

    const styles = generateStyles(isDarkMode);
    const { colors } = styles;

    // Monitorar tamanho da tela
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setMenuOpen(false); // Fecha o menu se voltar para desktop
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fecha o menu mobile automaticamente ao clicar em um link
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const roleColors = {
        ADMIN: '#f39c12',
        PACIENTE: '#2ecc71',
        MEDICO: '#3498db',
        FUNCIONARIO: '#8e44ad',
        LABORATORIO: '#0000FF',
        RECEPCAO: '#16a34a',
        FINANCEIRO: '#84cc16',
        COLETA: '#06b6d4',
        PROFESSOR: '#e11d48'
    };

    const getNavLinkStyle = (isActive, roleKey, isMobileItem = false) => {
        const color = roleColors[roleKey] || colors.textMuted;
        
        return {
            textDecoration: "none",
            fontWeight: isActive ? "700" : "500",
            fontSize: "0.95rem",
            padding: isMobileItem ? "15px 20px" : "8px 16px", // Mais espaço no mobile
            borderRadius: isMobileItem ? "0" : "12px",
            transition: 'all 0.2s ease',
            backgroundColor: isActive ? `${color}15` : 'transparent', 
            color: isActive ? color : colors.textMuted,
            border: (!isMobileItem && isActive) ? `1px solid ${color}30` : '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobileItem ? 'flex-start' : 'center',
            width: isMobileItem ? '100%' : 'auto', // Ocupa largura total no mobile
            borderBottom: isMobileItem ? `1px solid ${colors.borderLight}` : 'none'
        };
    };

    const actionButtonStyle = (variant) => ({
        textDecoration: "none",
        padding: "8px 20px",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "0.9rem",
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: variant === 'login' ? colors.authAccent : colors.primary,
        color: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        display: 'block',
        textAlign: 'center',
        marginTop: isMobile ? '10px' : '0'
    });

    const handleRoleClick = (roleType) => {
        const mockRoleData = {}; 
        setActiveRole(roleType, mockRoleData);
        setMenuOpen(false); // Garante fechamento
    };

    // Função auxiliar para renderizar os links (evita repetição de código)
    const renderLinks = (mobileMode = false) => (
        <>
            {user && roles.includes("ADMIN") && (
                <NavLink to="/admin/dashboard" onClick={() => handleRoleClick("ADMIN")} style={({ isActive }) => getNavLinkStyle(isActive, "ADMIN", mobileMode)}>Admin</NavLink>
            )}
            {user && roles.includes("PACIENTE") && (
                <NavLink to="/paciente/dashboard" onClick={() => handleRoleClick("PACIENTE")} style={({ isActive }) => getNavLinkStyle(isActive, "PACIENTE", mobileMode)}>Paciente</NavLink>
            )}
            {user && roles.includes("MEDICO") && (
                <NavLink to="/medico/dashboard" onClick={() => handleRoleClick("MEDICO")} style={({ isActive }) => getNavLinkStyle(isActive, "MEDICO", mobileMode)}>Médico</NavLink>
            )}
            {user && roles.includes("FUNCIONARIO") && (
                <NavLink to="/funcionario/dashboard" onClick={() => handleRoleClick("FUNCIONARIO")} style={({ isActive }) => getNavLinkStyle(isActive, "FUNCIONARIO", mobileMode)}>Colaborador</NavLink>
            )}
            {user && roles.includes("RECEPCAO") && (
                <NavLink to="/recepcao/dashboard" onClick={() => handleRoleClick("RECEPCAO")} style={({ isActive }) => getNavLinkStyle(isActive, "RECEPCAO", mobileMode)}>Recepção</NavLink>
            )}
            {user && roles.includes("LABORATORIO") && (
                <NavLink to="/laboratorio/dashboard" onClick={() => handleRoleClick("LABORATORIO")} style={({ isActive }) => getNavLinkStyle(isActive, "LABORATORIO", mobileMode)}>Laboratório</NavLink>
            )}
            {user && roles.includes("FINANCEIRO") && (
                <NavLink to="/financeiro/dashboard" onClick={() => handleRoleClick("FINANCEIRO")} style={({ isActive }) => getNavLinkStyle(isActive, "FINANCEIRO", mobileMode)}>Financeiro</NavLink>
            )}
            {user && roles.includes("COLETA") && (
                <NavLink to="/coleta/dashboard" onClick={() => handleRoleClick("COLETA")} style={({ isActive }) => getNavLinkStyle(isActive, "COLETA", mobileMode)}>Coleta</NavLink>
            )}
            {user && roles.includes("PROFESSOR") && (
                <NavLink to="/professor/dashboard" onClick={() => handleRoleClick("PROFESSOR")} style={({ isActive }) => getNavLinkStyle(isActive, "PROFESSOR", mobileMode)}>Professor</NavLink>
            )}
        </>
    );

    return (
        <nav style={{
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.borderLight}`,
            padding: "0.8rem 1.5rem",
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            transition: 'background-color 0.3s ease'
        }}>
            <div style={{
                maxWidth: "1400px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem"
            }}>
                {/* 1. LOGO E BOTÃO HAMBURGUER */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: isMobile ? "100%" : "auto" }}>
                    <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                        <img
                            src="/MEDMAIS-PNG-1.png"
                            alt="Logo MedMais"
                            style={{ height: "50px", objectFit: "contain" }} 
                        />
                    </Link>

                    {/* Botão Mobile (Só aparece se isMobile for true) */}
                    {isMobile && (
                        <button 
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: colors.textDark,
                                fontSize: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {menuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    )}
                </div>

                {/* 2. LINKS DESKTOP (Escondido no Mobile) */}
                {!isMobile && (
                    <div style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap"
                    }}>
                        {renderLinks(false)}
                    </div>
                )}

                {/* 3. PERFIL / LOGIN DESKTOP (Escondido no Mobile se o menu estiver fechado, ou adaptado) */}
                {!isMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {!user ? (
                            <>
                                <Link to="/login" style={actionButtonStyle('login')}>Entrar</Link>
                                <Link to="/cadastro" style={actionButtonStyle('register')}>Criar Conta</Link>
                            </>
                        ) : (
                            <UserProfile />
                        )}
                    </div>
                )}
            </div>

            {/* 4. MENU MOBILE (DROPDOWN) */}
            {isMobile && menuOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: colors.white,
                    borderBottom: `1px solid ${colors.borderLight}`,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0',
                    zIndex: 999,
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    {/* Renderiza UserProfile no topo do menu mobile se estiver logado */}
                    {user && (
                        <div style={{ padding: '15px', borderBottom: `1px solid ${colors.borderLight}` }}>
                            <UserProfile />
                        </div>
                    )}

                    {/* Links de navegação */}
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {renderLinks(true)}
                    </div>

                    {/* Botões de Login/Cadastro se não estiver logado */}
                    {!user && (
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/login" style={actionButtonStyle('login')}>Entrar</Link>
                            <Link to="/cadastro" style={actionButtonStyle('register')}>Criar Conta</Link>
                        </div>
                    )}
                </div>
            )}
            
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;