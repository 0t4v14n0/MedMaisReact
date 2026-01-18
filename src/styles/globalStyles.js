// styles/globalStyles.js

// =================================================================
// PALETAS DE CORES PARA OS TEMAS
// =================================================================
const lightColors = {
  // Cores da Marca
  primary: '#00C7B4',
  primaryDark: '#00a896',
  accent: '#3498db',
  authAccent: '#233975',
  
  // Cores de Fundo
  background: '#E5FFFD',
  white: '#ffffff',
  lightGray: '#f9f9f9',

  // Cores de Texto
  textDark: '#2c3e50',
  textMuted: '#34495e',
  textLight: '#ecf0f1',

  // Cores de Status
  border: '#ddd',
  borderLight: '#eee',
  disabled: '#bdc3c7',
  danger: '#e74c3c',
  success: '#2ecc71',
  info: '#2738d1ff'
};

const darkColors = {
  // Cores da Marca
  primary: '#008e7a',
  primaryDark: '#008e7a',
  accent: '#2980b9',
  authAccent: '#1a2c5d',
  
  // Cores de Fundo
  background: '#121212',
  white: '#1e1e1e',
  lightGray: '#2d2d2d',

  // Cores de Texto
  textDark: '#f5f5f5',
  textMuted: '#bdc3c7',
  textLight: '#ffffff',

  // Cores de Status
  border: '#444',
  borderLight: '#555',
  disabled: '#666',
  danger: '#c0392b',
  success: '#27ae60',
  info: '#2738d1ff'
};

// =================================================================
// FUNÇÃO PARA GERAR ESTILOS DINÂMICOS
// =================================================================
const generateStyles = (isDarkMode = false) => {
  const colors = isDarkMode ? darkColors : lightColors;

  return{
    colors,
    app: {
      container: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: colors.background,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: colors.textDark
      },
      sidebar: {
        width: "250px",
        backgroundColor: colors.primary,
        color: colors.textLight,
        padding: "20px 0",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
      },
      sidebarList: {
        listStyle: "none",
        padding: 0,
        margin: 0
      },
      sidebarItem: {
        padding: "12px 20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        borderLeft: "4px solid transparent"
      },
      sidebarItemHover: {
        backgroundColor: colors.authAccent,
        borderLeft: `4px solid ${colors.accent}`
      },
      sidebarIcon: {
        marginRight: "10px",
        fontSize: "18px"
      },
      content: {
        flex: 1,
        padding: "30px",
        backgroundColor: colors.background
      },
      card: {
        backgroundColor: colors.white,
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        padding: "25px",
        marginBottom: "30px"
      },
      title: {
        color: colors.textDark,
        marginBottom: "20px",
        fontSize: "24px",
        fontWeight: "600",
        borderBottom: `1px solid ${colors.borderLight}`,
        paddingBottom: "10px"
      },
      button: {
        backgroundColor: colors.accent,
        color: colors.white,
        border: "none",
        padding: "10px 20px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        marginRight: "10px",
        marginBottom: "10px",
      },
      label: {
        display: "block",
        marginBottom: "8px",
        fontWeight: "500",
        color: colors.textMuted
      },
      input: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: `1px solid ${colors.border}`,
        fontSize: '14px',
        boxSizing: 'border-box'
      },
      select: {
        width: "100%",
        padding: "10px",
        borderRadius: "4px",
        border: `1px solid ${colors.border}`,
        fontSize: "14px",
      },
    },

    // Estilos para as páginas de autenticação
    auth: {
      container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background,
        padding: '20px'
      },
      card: {
        backgroundColor: colors.white,
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        padding: '30px 40px',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center'
      },
      logoContainer: {
        marginBottom: '25px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      },
      title: {
        fontSize: '26px',
        fontWeight: '600',
        color: colors.textDark,
        margin: '0'
      },
      form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      },
      formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '18px'
      },
      formSection: {
        borderTop: `1px solid ${colors.borderLight}`,
        paddingTop: '20px',
        marginTop: '10px'
      },
      sectionTitle: {
        fontSize: '18px',
        fontWeight: '500',
        color: colors.primary,
        marginBottom: '20px',
        textAlign: 'left'
      },
      inputGroup: {
        textAlign: 'left',
        width: '100%'
      },
      label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: colors.textMuted
      },
      input: {
        width: '100%',
        padding: '12px 16px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '15px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      },
      select: {
        width: '100%',
        padding: '12px 16px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '15px',
        boxSizing: 'border-box',
        backgroundColor: colors.white,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      },
      button: {
        width: '100%',
        padding: '14px',
        backgroundColor: colors.primary,
        color: colors.white,
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '10px'
      },
      buttonDisabled: {
        width: '100%',
        padding: '14px',
        backgroundColor: colors.disabled,
        color: colors.textLight,
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'not-allowed',
        marginTop: '10px'
      },
      alert: {
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        textAlign: 'center'
      },
      successAlert: {
        backgroundColor: '#d4edda',
        color: '#155724',
      },
      errorAlert: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
      },
      footerLinks: {
        marginTop: '25px',
        fontSize: '14px'
      },
      link: {
        color: colors.primary,
        textDecoration: 'none',
        fontWeight: '600',
      }
    },

    // Estilos adicionais
    historico: {
      container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px',
      },
      card: {
        backgroundColor: colors.white,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      },
      cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${colors.borderLight}`,
        paddingBottom: '10px',
        marginBottom: '10px',
      },
      statusTag: {
        padding: '5px 12px',
        borderRadius: '15px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
      },
      actionsContainer: {
        marginTop: '15px',
        borderTop: `1px solid ${colors.borderLight}`,
        paddingTop: '15px',
        textAlign: 'right',
      },
    },

    additional: {
      section: {
        backgroundColor: colors.lightGray,
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      },
      sectionTitle: {
        color: colors.textDark,
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: `1px solid ${colors.borderLight}`
      },
      doctorsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px',
        marginTop: '15px'
      },
      doctorCard: {
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: `1px solid ${colors.borderLight}`
      },
      doctorCardSelected: {
        border: `2px solid ${colors.primary}`,
        backgroundColor: '#f0fdfa'
      },
      doctorName: {
        fontSize: '16px',
        color: colors.textDark,
        display: 'block',
        marginBottom: '8px'
      },
      doctorDetail: {
        color: colors.textMuted,
        fontSize: '14px',
        marginBottom: '5px'
      },
      doctorPrice: {
        color: colors.success,
        fontWeight: '500',
        fontSize: '14px'
      },
      timeSlotsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '10px',
        marginTop: '15px'
      },
      timeSlot: {
        padding: '10px',
        borderRadius: '6px',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.white,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        fontSize: '14px'
      },
      timeSlotSelected: {
        backgroundColor: colors.primary,
        color: colors.white,
        borderColor: colors.primaryDark
      },
      noResults: {
        color: colors.textMuted,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '15px'
      }
    }

  };
};

// Exportações finais (MODIFICADAS)
export {
  lightColors,
  darkColors,
  generateStyles
};

export const lightStyles = {
  colors: lightColors,
  ...generateStyles(false) // Força tema claro
};

export const darkStyles = {
  colors: darkColors,
  ...generateStyles(true) // Força tema escuro
};

// Export padrão modificado
export default {
  colors: lightColors,
  ...generateStyles(false) // Tema claro como padrão
};