import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../contexts/ThemeContext'; // Importe o hook do tema
import { getAuthStyles } from '../styles/authStyles'; // Importe a função de estilos dinâmicos

const Recuperarsenha = () => {
    const [emailOuLogin, setEmailOuLogin] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [etapa, setEtapa] = useState('solicitar');
    const { token } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme(); // Obtenha o estado do tema
    const styles = getAuthStyles(isDarkMode); // Obtenha os estilos dinâmicos

    useEffect(() => {
        if (token) {
            setEtapa('redefinir');
        }
    }, [token]);

    const handleEnviarEmail = async (e) => {
        e.preventDefault();
        setErro('');
        setMensagem('');
        
        if (!emailOuLogin) {
            setErro('Por favor, informe seu e-mail ou login');
            return;
        }
    
        try {
            await api.post(`/auth/senha/recuperar/enviar?emailOuLogin=${encodeURIComponent(emailOuLogin)}`);
            setMensagem('Se o e-mail ou login informado estiver cadastrado, você receberá um link para redefinir sua senha.');
            setEmailOuLogin('');
        } catch (error) {
            setMensagem('Se o e-mail ou login informado estiver cadastrado, você receberá um link para redefinir sua senha.');
        }
    };

    const handleRedefinirSenha = async (e) => {
        e.preventDefault();
        setErro('');
        setMensagem('');

        if (!novaSenha || !confirmarSenha) {
            setErro('Por favor, preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        try {
            await api.post(`/auth/senha/recuperar/${token}`, { senha: novaSenha });
            setMensagem('Senha redefinida com sucesso! Redirecionando para login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setErro(error.response?.data?.message || 'Token inválido ou expirado. Por favor, solicite um novo link.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <img 
                        src="/logo192.png"
                        alt="Logo MedMais" 
                        style={styles.logo}
                    />
                    <h1 style={styles.title}>Recuperação de Senha</h1>
                </div>
                
                {mensagem && (
                    <div style={{
                        ...styles.alert,
                        ...styles.successAlert
                    }}>
                        {mensagem}
                    </div>
                )}

                {erro && (
                    <div style={{
                        ...styles.alert,
                        ...styles.errorAlert
                    }}>
                        {erro}
                    </div>
                )}

                {etapa === 'solicitar' ? (
                    <form onSubmit={handleEnviarEmail} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>E-mail ou login</label>
                            <input
                                type="text"
                                value={emailOuLogin}
                                onChange={(e) => setEmailOuLogin(e.target.value)}
                                style={styles.input}
                                placeholder="Digite seu e-mail ou login"
                            />
                        </div>
                        <button type="submit" style={styles.button}>
                            Enviar Link de Recuperação
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRedefinirSenha} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nova Senha</label>
                            <input
                                type="password"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                style={styles.input}
                                placeholder="Digite sua nova senha"
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirmar Nova Senha</label>
                            <input
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                style={styles.input}
                                placeholder="Confirme sua nova senha"
                            />
                        </div>
                        <button type="submit" style={styles.button}>
                            Redefinir Senha
                        </button>
                    </form>
                )}

                <div style={styles.footerLinks}>
                    <a href="/login" style={styles.link}>
                        Lembrou a senha? Voltar para o login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Recuperarsenha;