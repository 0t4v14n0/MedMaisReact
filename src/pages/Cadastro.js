import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cadastro() {

      const [nome, setNome] = useState('');
      const [email, setEmail] = useState('');
      const [senha, setSenha] = useState('');


    return <h1>Cadastro</h1>;
  }