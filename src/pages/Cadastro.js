import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Registro() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState(
  {
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

  const [message, setMessage] = useState(''); // Estado para mensagens
  const [loading, setLoading] = useState(false); // Estado para carregamento

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (['login', 'senha', 'nome', 'cpf', 'email', 'telefone', 'dataNascimento'].includes(name)) {
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
  
    console.log(JSON.stringify(formData, null, 2));
    setLoading(true);
    setMessage(''); // limpa mensagem
  
    try {
      await api.post('/paciente/register', formData);
      setMessage('Registro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 500) {
          setMessage(data);
        } else {
          setMessage(data);
        }
      } else if (error.request) {
        setMessage(error.message);
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-2xl">
      <h2 className="text-2xl font-semibold text-center mb-6">Cadastro</h2>
      {message && <p className="text-red-500 mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input name="nome" placeholder="Nome completo" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="cpf" placeholder="CPF" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="telefone" placeholder="Telefone" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="dataNascimento" type="date" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="login" placeholder="Login" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="senha" type="password" placeholder="Senha" onChange={handleChange} required className="p-2 border rounded-xl" />

        <input name="endereco" placeholder="Endereço" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="cidade" placeholder="Cidade" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="estado" placeholder="Estado" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="cep" placeholder="CEP" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="pais" placeholder="País" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="referencia" placeholder="Referência" onChange={handleChange} className="p-2 border rounded-xl" />

        <select name="tipoSanguineo" onChange={handleChange} required className="p-2 border rounded-xl">
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

        <input name="contatoEmergencia" placeholder="Contato de emergência" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="peso" type="number" placeholder="Peso (kg)" onChange={handleChange} required className="p-2 border rounded-xl" />
        <input name="altura" type="number" placeholder="Altura (cm)" onChange={handleChange} required className="p-2 border rounded-xl" />

        <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 transition-all">
          {loading ? 'Carregando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}