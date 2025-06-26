import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/cadastro.css';

export default function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipoSanguineo: '',
    contatoEmergencia: '',
    peso: '',
    altura: '',
    dataRegistroPessoa: {
      login: '',
      senha: '',
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      sexo: '',
      dataNascimento: '',
      dataRegistroEndereco: {
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        pais: '',
        referencia: ''
      }
    }
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (['login', 'senha', 'nome', 'cpf', 'email', 'telefone', 'sexo', 'dataNascimento'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        dataRegistroPessoa: {
          ...prev.dataRegistroPessoa,
          [name]: value,
        },
      }));
    } else if (['endereco', 'cidade', 'estado', 'cep', 'pais', 'referencia'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        dataRegistroPessoa: {
          ...prev.dataRegistroPessoa,
          dataRegistroEndereco: {
            ...prev.dataRegistroPessoa.dataRegistroEndereco,
            [name]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/paciente/register', formData);
      setMessage('Registro realizado com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        setMessage(status === 500 ? data : data.message || 'Erro no registro');
      } else if (error.request) {
        setMessage('Sem resposta do servidor');
      } else {
        setMessage('Erro ao configurar a requisição');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h2 className="registro-title">Cadastro</h2>
        {message && <p className={`registro-message ${message.includes('sucesso') ? 'success' : 'error'}`}>{message}</p>}
        
        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-section">
            <h3 className="section-title">Dados Pessoais</h3>
            <div className="form-group">
              <input name="nome" placeholder="Nome completo" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="cpf" placeholder="CPF" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="telefone" placeholder="Telefone" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <select name="sexo" onChange={handleChange} required>
                <option value="">Selecione o seu sexo</option>
                <option value="MASCULINO">MASCULINO</option>
                <option value="FEMININO">FEMININO</option>
                <option value="OUTRO">OUTRO</option>
              </select>
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input name="dataNascimento" type="date" onChange={handleChange} required />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Credenciais</h3>
            <div className="form-group">
              <input name="login" placeholder="Login" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="senha" type="password" placeholder="Senha" onChange={handleChange} required />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Endereço</h3>
            <div className="form-group">
              <input name="endereco" placeholder="Endereço" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="cidade" placeholder="Cidade" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="estado" placeholder="Estado" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="cep" placeholder="CEP" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="pais" placeholder="País" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="referencia" placeholder="Referência" onChange={handleChange} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Informações de Saúde</h3>
            <div className="form-group">
              <select name="tipoSanguineo" onChange={handleChange} required>
                <option value="">Selecione o tipo sanguíneo</option>
                <option value="A_POSITIVO">A+</option>
                <option value="A_NEGATIVO">A-</option>
                <option value="B_POSITIVO">B+</option>
                <option value="B_NEGATIVO">B-</option>
                <option value="AB_POSITIVO">AB+</option>
                <option value="AB_NEGATIVO">AB-</option>
                <option value="O_POSITIVO">O+</option>
                <option value="O_NEGATIVO">O-</option>
              </select>
            </div>
            <div className="form-group">
              <input name="contatoEmergencia" placeholder="Contato de emergência" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="peso" type="number" placeholder="Peso (kg)" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="altura" type="number" placeholder="Altura (cm)" onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Carregando...
              </>
            ) : (
              'Registrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}