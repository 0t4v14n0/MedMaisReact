// styles/authStyles.js
import { lightColors, darkColors } from './globalStyles';

export const getAuthStyles = (isDarkMode) => {
  const colors = isDarkMode ? darkColors : lightColors;
  
  return {
    colors,
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: '20px',
      transition: 'background-color 0.3s ease'
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      padding: '30px 40px',
      width: '100%',
      maxWidth: '480px',
      textAlign: 'center',
      transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
    },
    logoContainer: {
      marginBottom: '25px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    },
    logo: {
      height: '60px',
      width: '60px',
      objectFit: 'contain'
    },
    title: {
      fontSize: '26px',
      fontWeight: '600',
      color: colors.textDark,
      margin: '0',
      transition: 'color 0.3s ease'
    },
    subtitle: {
      fontSize: '14px',
      color: colors.textMuted,
      marginTop: '5px',
      transition: 'color 0.3s ease'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '18px',
      '@media (max-width: 600px)': {
        gridTemplateColumns: '1fr'
      }
    },
    formSection: {
      borderTop: `1px solid ${colors.borderLight}`,
      paddingTop: '20px',
      marginTop: '10px',
      transition: 'border-color 0.3s ease'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '500',
      color: colors.primary,
      marginBottom: '20px',
      textAlign: 'left',
      transition: 'color 0.3s ease'
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
      color: colors.textMuted,
      transition: 'color 0.3s ease'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      fontSize: '15px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backgroundColor: colors.white,
      color: colors.textDark,
      '&:focus': {
        borderColor: colors.primary,
        outline: 'none',
        boxShadow: `0 0 0 2px ${colors.primary}20`
      }
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      fontSize: '15px',
      boxSizing: 'border-box',
      backgroundColor: colors.white,
      color: colors.textDark,
      transition: 'all 0.3s ease',
      '&:focus': {
        borderColor: colors.primary,
        outline: 'none',
        boxShadow: `0 0 0 2px ${colors.primary}20`
      }
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      margin: '10px 0'
    },
    checkbox: {
      marginRight: '10px',
      accentColor: colors.primary
    },
    checkboxLabel: {
      color: colors.textMuted,
      fontSize: '14px',
      transition: 'color 0.3s ease'
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
      transition: 'all 0.3s ease',
      marginTop: '10px',
      '&:hover': {
        backgroundColor: colors.primaryDark,
        transform: 'translateY(-1px)'
      },
      '&:active': {
        transform: 'translateY(0)'
      }
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
      marginTop: '10px',
      opacity: 0.7
    },
    buttonSecondary: {
      width: '100%',
      padding: '14px',
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px',
      '&:hover': {
        backgroundColor: `${colors.primary}10`
      }
    },
    spinner: {
      display: 'inline-block',
      width: '16px',
      height: '16px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTopColor: colors.white,
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '8px'
    },
    alert: {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    successAlert: {
      backgroundColor: `${colors.success}20`,
      color: colors.success,
      border: `1px solid ${colors.success}`
    },
    errorAlert: {
      backgroundColor: `${colors.danger}20`,
      color: colors.danger,
      border: `1px solid ${colors.danger}`
    },
    infoAlert: {
      backgroundColor: `${colors.accent}20`,
      color: colors.accent,
      border: `1px solid ${colors.accent}`
    },
    footerLinks: {
      marginTop: '25px',
      fontSize: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    link: {
      color: colors.primary,
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.3s ease',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '20px 0',
      color: colors.textMuted,
      '&::before, &::after': {
        content: '""',
        flex: 1,
        borderBottom: `1px solid ${colors.border}`
      },
      '&::before': {
        marginRight: '10px'
      },
      '&::after': {
        marginLeft: '10px'
      }
    },
    socialButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      marginTop: '20px'
    },
    socialButton: {
      padding: '10px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.white,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': {
        backgroundColor: colors.lightGray
      }
    },
    passwordStrength: {
      marginTop: '5px',
      height: '4px',
      borderRadius: '2px',
      backgroundColor: colors.border,
      overflow: 'hidden'
    },
    strengthBar: {
      height: '100%',
      transition: 'all 0.3s ease',
      '&.weak': {
        backgroundColor: colors.danger,
        width: '33%'
      },
      '&.medium': {
        backgroundColor: '#FFA500',
        width: '66%'
      },
      '&.strong': {
        backgroundColor: colors.success,
        width: '100%'
      }
    },
    tooltip: {
      position: 'relative',
      display: 'inline-block',
      marginLeft: '5px',
      '&:hover .tooltipText': {
        visibility: 'visible',
        opacity: 1
      }
    },
    tooltipText: {
      visibility: 'hidden',
      width: '200px',
      backgroundColor: colors.textDark,
      color: colors.textLight,
      textAlign: 'center',
      borderRadius: '6px',
      padding: '5px',
      position: 'absolute',
      zIndex: 1,
      bottom: '125%',
      left: '50%',
      marginLeft: '-100px',
      opacity: 0,
      transition: 'opacity 0.3s',
      fontSize: '12px',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '100%',
        left: '50%',
        marginLeft: '-5px',
        borderWidth: '5px',
        borderStyle: 'solid',
        borderColor: `${colors.textDark} transparent transparent transparent`
      }
    }
  };
};