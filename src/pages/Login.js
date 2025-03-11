import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    console.log("Enviando login:", { login, senha });

    try {
      // Faz a requisicao de login
      const response = await api.post('/pessoa/login', { login, senha });

      console.log(response.data);
      
      if (response.data.Token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("roles", JSON.stringify(response.data.roles)); // Guardando roles corretamente
      
        // Recuperando corretamente o primeiro valor da role
        const roles = JSON.parse(localStorage.getItem("roles"));
        const role = roles ? roles[0] : null;
      
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
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
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
            onChange={(e) => setLogin(e.target.value)}
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