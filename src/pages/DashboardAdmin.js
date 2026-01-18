import React, { useState, useEffect } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from '../contexts/ThemeContext';
import { generateStyles } from '../styles/globalStyles';
import GerenciarPlanos from '../components/admin/GerenciarPlanos';
import GerenciarMedicos from '../components/admin/GerenciarMedicos';
import GerenciarExame from '../components/admin/GerenciarExame';
import GerenciarConfig from '../components/admin/GerenciarConfig';
import Relatorios from '../components/admin/GerenciarRelatorios';
import { FiMenu, FiX, FiHome, FiUsers, FiUserPlus, FiCalendar, FiFileText, FiSettings } from 'react-icons/fi';

const DashboardAdmin = () => {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState();
  const [menuAberto, setMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Get styles based on theme
  const { colors, app } = generateStyles(isDarkMode) || {};
  
  // Fallback colors if not defined
  const safeColors = colors || {
    primary: '#00C7B4',
    primaryDark: '#009688',
    textMuted: '#6c757d',
    textLight: '#ffffff',
    white: '#ffffff'
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuAberto(true);
      } else {
        setMenuAberto(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderizarConteudo = () => {
    switch (opcaoSelecionada) {
      case "GerenciarPlanos":
        return <GerenciarPlanos />;
      case "GerenciarPacientes":
        return (
          <div style={app?.card || {}}>
            <h2 style={app?.title || {}}>Gerenciar Pacientes</h2>
            <p style={{ color: safeColors.textMuted }}>Funcionalidade em desenvolvimento</p>
          </div>
        );
      case "GerenciarMedicos":
        return <GerenciarMedicos />;
      case "GerenciarExame":
        return <GerenciarExame />;
      case "Consultas":
        return (
          <div style={app?.card || {}}>
            <h2 style={app?.title || {}}>Visualizar Consultas</h2>
            <p style={{ color: safeColors.textMuted }}>Funcionalidade em desenvolvimento</p>
          </div>
        );
      case "Relatorios":
        return <Relatorios/>;
      case "Configuracoes":
        return  <GerenciarConfig/>;
      default:
        return (
          <div style={app?.card || {}}>
            <h2 style={app?.title || {}}>Bem-vindo ao Painel do Administrador</h2>
            <p style={{ color: safeColors.textMuted }}>
              Selecione uma das opções no menu para gerenciar o sistema.
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "Consultas", label: "Consultas", icon: <FiCalendar /> },
    { key: "GerenciarPacientes", label: "Gerenciar Pacientes", icon: <FiUsers /> },
    { key: "GerenciarMedicos", label: "Gerenciar Médicos", icon: <FiUserPlus /> },
    { key: "GerenciarPlanos", label: "Gerenciar Planos", icon: <FiFileText /> },
    { key: "GerenciarExame", label: "Gerenciar Exame", icon: <FiFileText /> },
    { key: "Relatorios", label: "Relatórios", icon: <FiFileText /> },
    { key: "Configuracoes", label: "Configurações", icon: <FiSettings /> },
  ];

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <div style={app?.container || {}}>
      {/* Botão do menu hambúrguer */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={toggleMenu}
            style={{
              background: safeColors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          >
            {menuAberto ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      )}

      {/* Overlay para fechar o menu no mobile */}
      {isMobile && menuAberto && (
        <div
          onClick={toggleMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
        />
      )}

      {/* Barra lateral */}
      <nav style={{
        ...app?.sidebar,
        width: isMobile ? (menuAberto ? '250px' : '0') : '250px',
        transform: isMobile ? (menuAberto ? 'translateX(0)' : 'translateX(-250px)') : 'none',
        transition: 'all 0.3s ease',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 999,
        height: isMobile ? '100vh' : 'auto',
        top: isMobile ? '0' : 'auto',
        paddingTop: isMobile ? '70px' : '0'
      }}>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          borderBottom: `1px solid ${safeColors.primaryDark}`,
          display: menuAberto || !isMobile ? 'block' : 'none'
        }}>
          <h2 style={{ margin: 0, color: safeColors.white }}>MedMais</h2>
          <span style={{ fontSize: '14px', color: safeColors.textLight }}>Portal Administrativo</span>
        </div>
        <ul style={app?.sidebarList || {}}>
          {menuItems.map(item => (
            <li
              key={item.key}
              style={{
                ...app?.sidebarItem,
                ...(opcaoSelecionada === item.key ? app?.sidebarItemHover : {}),
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px'
              }}
              onClick={() => {
                setOpcaoSelecionada(item.key);
                if (isMobile) setMenuAberto(false);
              }}
            >
              <span style={{ 
                ...app?.sidebarIcon, 
                marginRight: '10px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Conteúdo principal */}
      <div style={{
        ...app?.content,
        marginLeft: isMobile ? '0' : '250px',
        paddingTop: isMobile ? '80px' : '20px',
        paddingLeft: isMobile ? '20px' : '30px',
        paddingRight: isMobile ? '20px' : '30px',
        transition: 'margin-left 0.3s ease'
      }}>
        {renderizarConteudo()}
      </div>
    </div>
  );
};

export default DashboardAdmin;