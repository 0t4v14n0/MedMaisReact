import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext'; // importa o hook

function Login() {
  const [login, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // pega a função login do contexto

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/pessoa/login', { login, senha });

      if (response.data.Token) {
        const token = response.data.Token;
        const roles = response.data.roles;

        authLogin(token, roles); // atualiza o contexto

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
          setError(message);
        } else {
          setError(message);
        }
      } else {
        setError("Erro de conexão com o servidor.");
      }
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Login:</label>
          <input
            type="login"
            value={login}
            onChange={(e) => setLoginInput(e.target.value)}
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
