import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';

function Login() {
  const [login, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  

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
        if (role === 'PACIENTE') {
          navigate('/paciente/dashboard');
        } else if (role === 'MEDICO') {
          navigate('/medico/dashboard');
        } else if (role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
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
          <div style={styles.errorAlert}>
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
          <span style={styles.linkSeparator}>•</span>
          <a href="/cadastro" style={styles.link}>Criar uma conta</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center'
  },
  logoContainer: {
    marginBottom: '30px'
  },
  logo: {
    height: '80px',
    width: '80px',
    objectFit: 'contain',
    marginBottom: '15px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    textAlign: 'left'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    ':focus': {
      outline: 'none',
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.2)'
    }
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#3182ce'
    }
  },
  buttonDisabled: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#a0aec0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed'
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
    marginRight: '8px'
  },
  errorAlert: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  footerLinks: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#718096',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  },
  link: {
    color: '#4299e1',
    textDecoration: 'none',
    fontWeight: '500',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  linkSeparator: {
    color: '#cbd5e0'
  }
};

export default Login;