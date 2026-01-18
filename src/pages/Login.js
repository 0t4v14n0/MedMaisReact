import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // Importe o hook do tema
import { getAuthStyles } from '../styles/authStyles'; // Importe a função de estilos


function Login() {
  const [login, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { isDarkMode } = useTheme(); // Obtenha o estado do tema
  const styles = getAuthStyles(isDarkMode); // Obtenha os estilos dinâmicos

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/pessoa/login', { login, senha });

      if (response.data.Token) {
        const token = response.data.Token;
        const roles = response.data.roles;

        authLogin(token, roles);

        const role = roles[0];
        console.log(role);
        if (roles.includes("ADMIN")) {
          navigate("/admin/dashboard");
        } else if (roles.includes("MEDICO")) {
          navigate("/medico/dashboard");
        } else if (roles.includes("RECEPCAO")) {
          navigate("/recepcao/dashboard");
        } else if (roles.includes("LABORATORIO")) {
          navigate("/laboratorio/dashboard");
        } else if (roles.includes("FUNCIONARIO")) { // Role genérica como fallback
          navigate("/funcionario/dashboard");
        } else if (roles.includes("PACIENTE")) {
          navigate("/paciente/dashboard");
        } else {
          // Se, por alguma razão, o utilizador não tiver uma role reconhecida,
          // envia-o para a página inicial para evitar ficar preso.
          navigate("/");
        }


      } else {
        setError('Credenciais inválidas.');
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data;

        if (status === 403 && message.includes("confirmar seu e-mail")) {
          setError(message);
        } else if (status === 401) {
          setError(message || 'Credenciais inválidas.');
        } else {
          setError(message || 'Ocorreu um erro inesperado.');
        }
        setTimeout(() => setError(''), 3000);
      } else {
        setError("Erro de conexão com o servidor.");
      }
    } finally {
      setLoading(false);
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
          <h1 style={styles.title}>Bem-vindo ao MedMais</h1>
        </div>
        
        {error && (
          <div style={{
            ...styles.alert,
            ...styles.errorAlert
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLoginInput(e.target.value)}
              style={styles.input}
              placeholder="Digite seu login"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button 
            type="submit" 
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Carregando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div style={styles.footerLinks}>
          <a href="/recuperar-senha" style={styles.link}>Esqueceu sua senha?</a>
          <span style={{ color: styles.colors.textMuted, margin: '0 8px' }}>•</span>
          <a href="/cadastro" style={styles.link}>Criar uma conta</a>
        </div>
      </div>
    </div>
  );
}

export default Login;