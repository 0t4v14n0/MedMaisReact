import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

// Esquema de validação
const schema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório').min(11, 'CPF inválido'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório'),
  dataNascimento: yup.date().required('Data de nascimento é obrigatória'),
  login: yup.string().required('Login é obrigatório'),
  senha: yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
  endereco: yup.string().required('Endereço é obrigatório'),
  cidade: yup.string().required('Cidade é obrigatória'),
  estado: yup.string().required('Estado é obrigatório'),
  cep: yup.string().required('CEP é obrigatório'),
  pais: yup.string().required('País é obrigatório'),
  tipoSanguineo: yup.string().required('Tipo sanguíneo é obrigatório'),
  contatoEmergencia: yup.string().required('Contato de emergência é obrigatório'),
  peso: yup.number().required('Peso é obrigatório').positive('Peso deve ser positivo'),
  altura: yup.number().required('Altura é obrigatória').positive('Altura deve ser positiva'),
});

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await schema.validate(formData, { abortEarly: false }); // Validação
      await axios.post(`${process.env.REACT_APP_API_URL}/pessoa/register`, formData);
      setMessage('Registro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      if (error.name === 'ValidationError') {
        setMessage(error.errors.join('\n')); // Exibe erros de validação
      } else {
        console.error(error);
        setMessage('Erro ao realizar o registro. Verifique os dados e tente novamente.');
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
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
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