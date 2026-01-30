import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api/api';
import { getAuthStyles } from '../styles/authStyles';

export default function Registro() {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const styles = getAuthStyles(isDarkMode);

    const [currentStep, setCurrentStep] = useState(1);

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
                pais: 'Brasil',
                referencia: ''
            }
        }
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // --- NOVA FUNÇÃO: BUSCA CEP ---
    const buscarCep = async (e) => {
        // Remove tudo que não é número para validar
        const cep = e.target.value.replace(/\D/g, '');

        if (cep.length === 8) {
            try {
                // Consulta a API do ViaCEP
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    // Se achou, atualiza o formulário
                    setFormData(prev => ({
                        ...prev,
                        dataRegistroPessoa: {
                            ...prev.dataRegistroPessoa,
                            dataRegistroEndereco: {
                                ...prev.dataRegistroPessoa.dataRegistroEndereco,
                                endereco: data.logradouro,
                                cidade: data.localidade,
                                estado: data.uf,
                                cep: cep // Mantém o CEP formatado ou limpo
                            }
                        }
                    }));
                    // Limpa erro de CEP se existir
                    setErrors(prev => ({ ...prev, cep: null }));
                } else {
                    setErrors(prev => ({ ...prev, cep: 'CEP não encontrado.' }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP.' }));
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        if (errors.confirmPassword) {
             setErrors(prev => ({ ...prev, confirmPassword: null }));
        }

        if (['login', 'senha', 'nome', 'cpf', 'email', 'telefone', 'sexo', 'dataNascimento'].includes(name)) {
            setFormData(prev => ({ ...prev, dataRegistroPessoa: { ...prev.dataRegistroPessoa, [name]: value } }));
        } else if (['endereco', 'cidade', 'estado', 'cep', 'pais', 'referencia'].includes(name)) {
            setFormData(prev => ({ ...prev, dataRegistroPessoa: { ...prev.dataRegistroPessoa, dataRegistroEndereco: { ...prev.dataRegistroPessoa.dataRegistroEndereco, [name]: value } } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFotoPerfil(e.target.files[0]);
        }
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setErrors({});
        setCurrentStep(prev => prev - 1);
    };

    const validateStep = () => {
        const newErrors = {};
        const { dataRegistroPessoa } = formData;
        const { dataRegistroEndereco } = dataRegistroPessoa;

        if (currentStep === 1) {
            if (!dataRegistroPessoa.nome) newErrors.nome = 'O nome completo é obrigatório.';
            if (!dataRegistroPessoa.cpf) newErrors.cpf = 'O CPF é obrigatório.';
            if (!dataRegistroPessoa.dataNascimento) newErrors.dataNascimento = 'A data de nascimento é obrigatória.';
            if (!dataRegistroPessoa.email) newErrors.email = 'O email é obrigatório.';
            if (!dataRegistroPessoa.telefone) newErrors.telefone = 'O telefone é obrigatório.';
            if (!dataRegistroPessoa.sexo) newErrors.sexo = 'O sexo é obrigatório.';
        }
        
        if (currentStep === 2) {
            if (!dataRegistroPessoa.login) newErrors.login = 'O login é obrigatório.';
            if (!dataRegistroPessoa.senha) newErrors.senha = 'A senha é obrigatória.';
            if (dataRegistroPessoa.senha !== confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem.';
            }
        }

        if (currentStep === 3) {
            if (!dataRegistroEndereco.endereco) newErrors.endereco = 'O endereço é obrigatório.';
            if (!dataRegistroEndereco.cidade) newErrors.cidade = 'A cidade é obrigatória.';
            if (!dataRegistroEndereco.estado) newErrors.estado = 'O estado é obrigatório.';
            if (!dataRegistroEndereco.cep) newErrors.cep = 'O CEP é obrigatório.';
        }

        if (currentStep === 4) {
            if (!formData.tipoSanguineo) newErrors.tipoSanguineo = 'O tipo sanguíneo é obrigatório.';
            if (!formData.contatoEmergencia) newErrors.contatoEmergencia = 'O contato de emergência é obrigatório.';
            if (!formData.peso) newErrors.peso = 'O peso é obrigatório.';
            if (!formData.altura) newErrors.altura = 'A altura é obrigatória.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        setLoading(true);
        setMessage('');

        const formDataRequest = new FormData();
        formDataRequest.append('dados', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
        if (fotoPerfil) {
            formDataRequest.append('fotoPerfil', fotoPerfil);
        }

        try {
            await api.post('/paciente/register', formDataRequest);
            setMessage('Registro realizado com sucesso! Redirecionando para o login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Erro desconhecido no registro.';
            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const ErrorMessage = ({ name }) => errors[name] ? <p style={{color: 'red', fontSize: '12px', margin: '5px 0 0'}}>{errors[name]}</p> : null;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <img src="/logo192.png" alt="Logo MedMais" style={styles.logo} />
                    <h1 style={styles.title}>Crie a sua Conta</h1>
                    <p style={{color: styles.colors.textMuted}}>Passo {currentStep} de 4</p>
                </div>
                
                {message && (
                    <div style={{ ...styles.alert, ...(message.includes('sucesso') ? styles.successAlert : styles.errorAlert) }}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* ETAPA 1: DADOS PESSOAIS */}
                    {currentStep === 1 && (
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>Dados Pessoais</h3>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nome Completo</label>
                                <input name="nome" value={formData.dataRegistroPessoa.nome} style={styles.input} placeholder="Seu nome completo" onChange={handleChange} />
                                <ErrorMessage name="nome" />
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>CPF</label>
                                    <input name="cpf" value={formData.dataRegistroPessoa.cpf} style={styles.input} placeholder="000.000.000-00" onChange={handleChange} />
                                    <ErrorMessage name="cpf" />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Data de Nascimento</label>
                                    <input name="dataNascimento" value={formData.dataRegistroPessoa.dataNascimento} type="date" style={styles.input} onChange={handleChange} />
                                    <ErrorMessage name="dataNascimento" />
                                </div>
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input name="email" value={formData.dataRegistroPessoa.email} type="email" style={styles.input} placeholder="seu@email.com" onChange={handleChange} />
                                    <ErrorMessage name="email" />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Telefone</label>
                                    <input name="telefone" value={formData.dataRegistroPessoa.telefone} style={styles.input} placeholder="(00) 00000-0000" onChange={handleChange} />
                                    <ErrorMessage name="telefone" />
                                </div>
                            </div>
                             <div style={styles.inputGroup}>
                                <label style={styles.label}>Sexo</label>
                                <select name="sexo" value={formData.dataRegistroPessoa.sexo} style={styles.select} onChange={handleChange}>
                                    <option value="">Selecione...</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMININO">Feminino</option>
                                    <option value="OUTRO">Outro</option>
                                </select>
                                <ErrorMessage name="sexo" />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Foto de Perfil (Opcional)</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={styles.input} />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 2: CREDENCIAIS */}
                    {currentStep === 2 && (
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>Credenciais de Acesso</h3>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Login</label>
                                <input name="login" value={formData.dataRegistroPessoa.login} style={styles.input} placeholder="Crie um nome de utilizador" onChange={handleChange} />
                                <ErrorMessage name="login" />
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Senha</label>
                                    <input name="senha" value={formData.dataRegistroPessoa.senha} type="password" style={styles.input} placeholder="Crie uma senha forte" onChange={handleChange} />
                                    <ErrorMessage name="senha" />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Confirmar Senha</label>
                                    <input name="confirmPassword" value={confirmPassword} type="password" style={styles.input} placeholder="Repita a senha" onChange={(e) => setConfirmPassword(e.target.value)} />
                                    <ErrorMessage name="confirmPassword" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* ETAPA 3: ENDEREÇO (COM BUSCA DE CEP) */}
                    {currentStep === 3 && (
                         <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>Endereço</h3>
                            
                            {/* CEP AGORA VEM PRIMEIRO E COM BUSCA AUTOMÁTICA */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>CEP</label>
                                <input 
                                    name="cep" 
                                    value={formData.dataRegistroPessoa.dataRegistroEndereco.cep} 
                                    style={styles.input} 
                                    placeholder="00000-000" 
                                    onChange={handleChange}
                                    onBlur={buscarCep} // AQUI A MÁGICA ACONTECE
                                    maxLength={9}
                                />
                                <ErrorMessage name="cep" />
                                <small style={{color: styles.colors.textMuted, fontSize: '11px'}}>
                                    Digite o CEP para buscar o endereço automaticamente.
                                </small>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Endereço</label>
                                <input name="endereco" value={formData.dataRegistroPessoa.dataRegistroEndereco.endereco} style={styles.input} placeholder="Rua, Av, etc." onChange={handleChange} />
                                <ErrorMessage name="endereco" />
                            </div>
                            
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Cidade</label>
                                    <input name="cidade" value={formData.dataRegistroPessoa.dataRegistroEndereco.cidade} style={styles.input} onChange={handleChange} />
                                    <ErrorMessage name="cidade" />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Estado (UF)</label>
                                    <input name="estado" value={formData.dataRegistroPessoa.dataRegistroEndereco.estado} style={styles.input} maxLength="2" placeholder="PE" onChange={handleChange} />
                                    <ErrorMessage name="estado" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ETAPA 4: INFORMAÇÕES DE SAÚDE */}
                    {currentStep === 4 && (
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>Informações de Saúde</h3>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Tipo Sanguíneo</label>
                                    <select name="tipoSanguineo" value={formData.tipoSanguineo} style={styles.select} onChange={handleChange}>
                                        <option value="">Selecione...</option>
                                        <option value="A_POSITIVO">A+</option>
                                        <option value="A_NEGATIVO">A-</option>
                                        <option value="B_POSITIVO">B+</option>
                                        <option value="B_NEGATIVO">B-</option>
                                        <option value="AB_POSITIVO">AB+</option>
                                        <option value="AB_NEGATIVO">AB-</option>
                                        <option value="O_POSITIVO">O+</option>
                                        <option value="O_NEGATIVO">O-</option>
                                    </select>
                                    <ErrorMessage name="tipoSanguineo" />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Contato de Emergência</label>
                                    {/* ALTERADO AQUI: type="number" e placeholder */}
                                    <input 
                                        name="contatoEmergencia" 
                                        type="number" 
                                        value={formData.contatoEmergencia} 
                                        style={styles.input} 
                                        placeholder="Telefone de emergência (apenas números)" 
                                        onChange={handleChange} 
                                    />
                                    <ErrorMessage name="contatoEmergencia" />
                                </div>
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Peso (kg)</label>
                                    <input name="peso" value={formData.peso} type="number" step="0.1" style={styles.input} placeholder="Ex: 75.5" onChange={handleChange} />
                                    <ErrorMessage name="peso" />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Altura (cm)</label>
                                    <input name="altura" value={formData.altura} type="number" style={styles.input} placeholder="Ex: 175" onChange={handleChange} />
                                    <ErrorMessage name="altura" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BOTÕES DE NAVEGAÇÃO */}
                    <div style={{...styles.formGrid, marginTop: '20px'}}>
                        {currentStep > 1 && (
                            <button type="button" onClick={prevStep} style={{...styles.button, backgroundColor: styles.colors.textMuted}}>
                                Voltar
                            </button>
                        )}
                        {currentStep < 4 && (
                            <button type="button" onClick={nextStep} style={{...styles.button, gridColumn: currentStep === 1 ? '1 / -1' : ''}}>
                                Próximo
                            </button>
                        )}
                        {currentStep === 4 && (
                            <button type="submit" style={loading ? styles.buttonDisabled : styles.button} disabled={loading}>
                                {loading ? 'Processando...' : 'Finalizar Cadastro'}
                            </button>
                        )}
                    </div>
                </form>
                
                <div style={styles.footerLinks}>
                    <a href="/login" style={styles.link}>Já tem uma conta? Faça o login</a>
                </div>
            </div>
        </div>
    );
}