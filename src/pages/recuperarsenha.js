import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

const Recuperarsenha = () => {
  const [emailOuLogin, setEmailOuLogin] = useState(''); 
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [etapa, setEtapa] = useState('solicitar'); // 'solicitar' ou 'redefinir'
  const { token } = useParams();
  const navigate = useNavigate();

  // Verifica se há token na URL para determinar a etapa
  useState(() => {
    if (token) {
      setEtapa('redefinir');
    }
  }, [token]);

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    setErro('');
    
    if (!email) {
      setErro('Por favor, informe seu e-mail');
      return;
    }

    try {
      await api.post('/auth/senha/recuperar/enviar', { email });
      setMensagem('Um e-mail com instruções foi enviado para o endereço fornecido.');
      setEmail('');
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao solicitar recuperação de senha');
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setErro('');

    if (!novaSenha || !confirmarSenha) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      await api.post(`/auth/senha/recuperar/${token}`, { novaSenha });
      setMensagem('Senha redefinida com sucesso! Redirecionando para login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao redefinir senha');
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
          <div style={styles.mensagemSucesso}>
            {mensagem}
          </div>
        )}

        {erro && (
          <div style={styles.mensagemErro}>
            {erro}
          </div>
        )}

        {etapa === 'solicitar' ? (
          <form onSubmit={handleEnviarEmail} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>E-mail ou login cadastrado:</label>
              <input
                type="text"  // Alterado de 'email' para 'text' para aceitar login também
                value={emailOuLogin}  // Mude o estado para refletir que pode ser ambos
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
            <div style={styles.formGroup}>
              <label style={styles.label}>Nova Senha:</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                style={styles.input}
                placeholder="Digite sua nova senha"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmar Nova Senha:</label>
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

        <div style={styles.voltarLogin}>
          <a href="/login" style={styles.link}>
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '30px',
    width: '100%',
    maxWidth: '500px',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#34495e',
  },
  input: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '10px',
  },
  mensagemSucesso: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  mensagemErro: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  voltarLogin: {
    textAlign: 'center',
    marginTop: '20px',
  },
  logoContainer: {
    marginBottom: '30px'
  },
  logo: {
    height: '80px',
    width: '80px',
    objectFit: 'contain',
    margin: '0 auto 15px', // 0 top, auto left/right, 15px bottom
    display: 'block'
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
};

export default Recuperarsenha;