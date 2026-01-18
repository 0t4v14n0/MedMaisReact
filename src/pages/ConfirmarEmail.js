import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../contexts/ThemeContext'; // Importando o hook do tema
import { generateStyles } from '../styles/globalStyles'; // Importando o gerador de estilos

// A animação do spinner é definida globalmente, se já não tiver sido.
const keyframes = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
if (!document.getElementById('spin-animation')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'spin-animation';
    styleSheet.type = "text/css";
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);
}

const ConfirmarEmail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- LÓGICA DO TEMA ---
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode); // Gera os estilos para o tema atual

    // --- ESTADOS DA UI ---
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verificando seu e-mail, por favor aguarde...');

    // --- COMPONENTES DE ÍCONES (definidos aqui para ter acesso aos 'styles' dinâmicos) ---
    const Spinner = () => (
        <div style={{
            display: 'inline-block',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: `5px solid ${styles.colors.borderLight}`,
            borderTopColor: styles.colors.primary,
            animation: 'spin 1s ease-in-out infinite',
        }}></div>
    );

    const SuccessIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={styles.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );

    const ErrorIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={styles.colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    );

    // --- LÓGICA DE VERIFICAÇÃO (sem alteração) ---
    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Link de verificação inválido. Nenhum token encontrado.');
            return;
        }

        const verificarToken = async () => {
            try {
                await api.post('/auth/verificar', { token });
                setStatus('success');
                setMessage('E-mail verificado com sucesso! Sua conta foi ativada.');
            } catch (error) {
                setStatus('error');
                if (error.response && error.response.status === 400) {
                    setMessage('Este link de verificação é inválido ou já expirou. Por favor, tente fazer o login ou solicite um novo e-mail.');
                } else {
                    setMessage('Ocorreu um erro de comunicação. Por favor, tente novamente mais tarde.');
                }
            }
        };

        const timer = setTimeout(() => {
            verificarToken();
        }, 1500);

        return () => clearTimeout(timer);
    }, [searchParams]);

    const handleNavigateToLogin = () => {
        navigate('/login');
    };

    // Função para renderizar o conteúdo com base no status
    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <>
                        <Spinner />
                        <h2 style={styles.auth.title}>Verificando...</h2>
                        <p style={{ color: styles.colors.textMuted }}>{message}</p>
                    </>
                );
            case 'success':
                return (
                    <>
                        <SuccessIcon />
                        <h2 style={{ ...styles.auth.title, color: styles.colors.success }}>Sucesso!</h2>
                        <p style={{ color: styles.colors.textMuted, textAlign: 'center' }}>{message}</p>
                        <button style={styles.auth.button} onClick={handleNavigateToLogin}>
                            Ir para o Login
                        </button>
                    </>
                );
            case 'error':
                return (
                    <>
                        <ErrorIcon />
                        <h2 style={{ ...styles.auth.title, color: styles.colors.danger }}>Ocorreu um Erro</h2>
                        <p style={{ color: styles.colors.textMuted, textAlign: 'center' }}>{message}</p>
                        <button style={styles.auth.button} onClick={handleNavigateToLogin}>
                            Tentar Novamente
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div style={styles.auth.container}>
            <div style={{ ...styles.auth.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default ConfirmarEmail;