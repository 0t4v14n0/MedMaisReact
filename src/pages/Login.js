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
      const response = await api.post('/pessoa/login', { login, senha });

      console.log(response.data);

      if (response.data.Token) {
        localStorage.setItem("token", response.data.Token);
        localStorage.setItem("roles", JSON.stringify(response.data.roles));

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
        setError('Credenciais .');
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