import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// =================================================================
// HOOK DE RESPONSIVIDADE E COMPONENTES DE UI
// =================================================================
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);
    return matches;
};

const InputField = ({ label, error, styles, colors, ...props }) => (
    <div style={{...styles.app.formGroup, marginBottom: '1.2rem'}}>
        {label && <label style={{ ...styles.app.label, display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: colors.text_primary }}>{label}</label>}
        <input style={{ ...styles.app.input, boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '6px', border: `1px solid ${error ? colors.danger : colors.border}`, backgroundColor: colors.background, color: colors.text_primary, fontSize: '14px', transition: 'all 0.3s ease', ...(error && { boxShadow: `0 0 0 2px ${colors.danger}20` }) }} {...props} />
        {error && <span style={{ color: colors.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

const SelectField = ({ label, options, error, styles, colors, ...props }) => (
    <div style={{...styles.app.formGroup, marginBottom: '1.2rem'}}>
        <label style={{ ...styles.app.label, display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: colors.text_primary }}>{label}</label>
        <select style={{ ...styles.app.select, width: '100%', padding: '10px 12px', borderRadius: '6px', border: `1px solid ${error ? colors.danger : colors.border}`, backgroundColor: colors.background, color: colors.text_primary, fontSize: '14px', transition: 'all 0.3s ease', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='${encodeURIComponent(colors.text_primary)}' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', ...(error && { boxShadow: `0 0 0 2px ${colors.danger}20` }) }} {...props}>
            <option value="">Selecione...</option>
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
        </select>
        {error && <span style={{ color: colors.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

// =================================================================
// COMPONENTE DE SELEÇÃO DE UNIDADES
// =================================================================
const SelecaoUnidades = ({ unidades, unidadesSelecionadas, onUnidadesChange, styles, colors, error, disabled = false }) => {
    const toggleUnidade = (idUnidade) => {
        if (disabled) return;
        
        const novasUnidades = unidadesSelecionadas.includes(idUnidade)
            ? unidadesSelecionadas.filter(id => id !== idUnidade)
            : [...unidadesSelecionadas, idUnidade];
        
        onUnidadesChange(novasUnidades);
    };

    const selecionarTodas = () => {
        if (disabled) return;
        const todosIds = unidades.map(unidade => unidade.id);
        onUnidadesChange(todosIds);
    };

    const limparSelecao = () => {
        if (disabled) return;
        onUnidadesChange([]);
    };

    return (
        <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ ...styles.app.label, fontWeight: '500', fontSize: '14px', color: colors.text_primary }}>
                    Unidades de Trabalho *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        type="button" 
                        onClick={selecionarTodas}
                        style={{ ...styles.app.button, padding: '4px 8px', fontSize: '11px', margin: 0 }}
                        disabled={disabled}
                    >
                        Todas
                    </button>
                    <button 
                        type="button" 
                        onClick={limparSelecao}
                        style={{ ...styles.app.button, padding: '4px 8px', fontSize: '11px', margin: 0, backgroundColor: colors.secondary }}
                        disabled={disabled}
                    >
                        Limpar
                    </button>
                </div>
            </div>

            <div style={{ 
                border: `1px solid ${error ? colors.danger : colors.border}`,
                borderRadius: '6px',
                padding: '15px',
                maxHeight: '150px',
                overflowY: 'auto',
                backgroundColor: colors.background,
                ...(error && { boxShadow: `0 0 0 2px ${colors.danger}20` })
            }}>
                {unidades.length === 0 ? (
                    <p style={{...styles.app.text, fontSize: '14px', textAlign: 'center', margin: 0}}>Carregando unidades...</p>
                ) : (
                    unidades.map(unidade => (
                        <div key={unidade.id} style={{ marginBottom: '10px' }}>
                            <label style={{ ...styles.app.text, display: 'flex', alignItems: 'flex-start', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={unidadesSelecionadas.includes(unidade.id)}
                                    onChange={() => toggleUnidade(unidade.id)}
                                    style={{ marginRight: '10px', marginTop: '2px', accentColor: colors.primary }}
                                    disabled={disabled}
                                />
                                <div>
                                    <div style={{ fontWeight: '500' }}>{unidade.nome}</div>
                                    {unidade.codigoCnes && (
                                        <div style={{ fontSize: '12px', color: colors.text_secondary, marginTop: '2px' }}>
                                            CNES: {unidade.codigoCnes}
                                        </div>
                                    )}
                                    {unidade.endereco && (
                                        <div style={{ fontSize: '12px', color: colors.text_secondary }}>
                                            {unidade.endereco.cidade} - {unidade.endereco.estado}
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    ))
                )}
            </div>
            
            {unidadesSelecionadas.length > 0 && (
                <p style={{ fontSize: '12px', marginTop: '5px', color: colors.text_secondary }}>
                    {unidadesSelecionadas.length} unidade(s) selecionada(s)
                </p>
            )}
            
            {error && (
                <span style={{ color: colors.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {error}
                </span>
            )}
        </div>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================
const FormularioMedico = ({ medicoParaEditar, onSave, onCancel }) => {
    const { isDarkMode } = useTheme();
    const theme = generateStyles(isDarkMode) || {};
    const styles = theme.styles || { app: {} };
    const colors = theme.colors || {};
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    const [currentStep, setCurrentStep] = useState(1);

    const initialState = {
        dataFuncionario: {
            dataPessoa: { 
                login: '', senha: '', nome: '', cpf: '', email: '', telefone: '', sexo: '', dataNascimento: '', 
                dataRegistroEndereco: { endereco: '', cidade: '', estado: '', cep: '', pais: 'Brasil', referencia: '' } 
            },
            idCargo: '', 
            dataAdmissao: '', 
            salario: '', 
            tipoVinculo: 'AUTONOMO',
            idsUnidade: [] // NOVO CAMPO ADICIONADO
        },
        crm: '', 
        valorConsultaPresencial: '',
        valorConsultaOnline: '',
        especialidadeIds: [],
        intervaloConsultaPresencialMinutos: 60,
        intervaloConsultaOnlineMinutos: 30,
        horariosDeTrabalho: []
    };

    const [formData, setFormData] = useState(initialState);
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [especialidadesDisponiveis, setEspecialidadesDisponiveis] = useState([]);
    const [cargosDisponiveis, setCargosDisponiveis] = useState([]); 
    const [unidadesDisponiveis, setUnidadesDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');

    const tiposDeVinculo = [ { id: 'CLT', nome: 'CLT' }, { id: 'PJ', nome: 'PJ' }, { id: 'AUTONOMO', nome: 'Autônomo' }];
    const diasDaSemana = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const tiposDeConsulta = ['PRESENCIAL', 'ONLINE', 'AMBAS'];

    useEffect(() => {
        Promise.all([
            api.get('/admin/medico/especialidade'),
            api.get('/admin/cargo/all'),
            api.get('/unidade/todas')
        ]).then(([especialidadesRes, cargosRes, unidadesRes]) => {
            setEspecialidadesDisponiveis(especialidadesRes.data || []);
            setCargosDisponiveis(cargosRes.data || []);
            setUnidadesDisponiveis(unidadesRes.data.content || unidadesRes.data || []);
        }).catch(err => console.error("Erro ao buscar dados iniciais:", err));
        
        if (medicoParaEditar) {
            const { dataDetalhesFuncionario, crm, valorConsultaPresencial, valorConsultaOnline, especialidadesMedica, ...restoMedico } = medicoParaEditar;
            const dataDetalhesPessoa = dataDetalhesFuncionario?.dataDetalhesPessoa;
            const dataDetalhesEndereco = dataDetalhesPessoa?.dataDetalhesEndereco;
            
            // Extrair IDs das unidades do médico
            const idsUnidade = dataDetalhesFuncionario?.unidades?.map(u => u.id) || [];

            const horariosNormalizados = (restoMedico.horariosDeTrabalho || []).map(h => ({
                diaDaSemana: h.diaDaSemana,
                horaInicio: h.horaInicio,
                horaFim: h.horaFim,
                idUnidade: h.unidade?.id,
                tipoConsulta: h.tipoConsulta
            }));

            setFormData({
                dataFuncionario: {
                    dataPessoa: { ...(dataDetalhesPessoa || {}), dataRegistroEndereco: (dataDetalhesEndereco || {}), senha: '' },
                    idCargo: dataDetalhesFuncionario?.cargo?.id || '',
                    dataAdmissao: dataDetalhesFuncionario?.dataAdmissao || '',
                    salario: dataDetalhesFuncionario?.salario || '',
                    tipoVinculo: dataDetalhesFuncionario?.tipoVinculo || 'AUTONOMO',
                    idsUnidade: idsUnidade // CARREGAR UNIDADES EXISTENTES
                },
                crm: crm || '',
                valorConsultaPresencial: valorConsultaPresencial || '',
                valorConsultaOnline: valorConsultaOnline || '',
                especialidadeIds: especialidadesMedica ? especialidadesMedica.map(e => e.id.toString()) : [],
                intervaloConsultaPresencialMinutos: restoMedico.intervaloConsultaPresencialMinutos || 60,
                intervaloConsultaOnlineMinutos: restoMedico.intervaloConsultaOnlineMinutos || 30,
                horariosDeTrabalho: horariosNormalizados
            });
        } else {
            setFormData(initialState);
        }
    }, [medicoParaEditar]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const path = name.split('.');
        setFormData(prev => {
            let newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]] = current[path[i]] || {};
            }
            current[path[path.length - 1]] = value;
            return newState;
        });
    };

    // NOVA FUNÇÃO PARA MANIPULAR SELEÇÃO DE UNIDADES
    const handleUnidadesChange = (idsUnidade) => {
        setFormData(prev => ({
            ...prev,
            dataFuncionario: {
                ...prev.dataFuncionario,
                idsUnidade
            }
        }));
        
        // Limpar erro se existir
        if (errors.idsUnidade) {
            setErrors(prev => ({
                ...prev,
                idsUnidade: ''
            }));
        }
    };

    const handleFileChange = (e) => e.target.files && setFotoPerfil(e.target.files[0]);

    const handleHorarioChange = (index, field, value) => {
        setFormData(prev => {
            const novosHorarios = [...prev.horariosDeTrabalho];
            novosHorarios[index] = { ...novosHorarios[index], [field]: value };
            return { ...prev, horariosDeTrabalho: novosHorarios };
        });
    };

    const addHorario = (diaDaSemana, unidadeId) => {
        setFormData(prev => ({
            ...prev,
            horariosDeTrabalho: [...prev.horariosDeTrabalho, { 
                diaDaSemana, 
                idUnidade: unidadeId,
                horaInicio: '08:00', 
                horaFim: '12:00',
                tipoConsulta: 'AMBAS'
            }]
        }));
    };

    const removeHorario = (index) => setFormData(prev => ({ ...prev, horariosDeTrabalho: prev.horariosDeTrabalho.filter((_, i) => i !== index) }));
    
    const handleEspecialidadeChange = (especialidadeId) => {
        setFormData(prev => ({
            ...prev,
            especialidadeIds: prev.especialidadeIds.includes(especialidadeId)
                ? prev.especialidadeIds.filter(id => id !== especialidadeId)
                : [...prev.especialidadeIds, especialidadeId]
        }));
    };
    
    const validateStep = () => {
        const newErrors = {};
        
        if (currentStep === 1) {
            if (!formData.dataFuncionario.dataPessoa.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
            if (!formData.dataFuncionario.dataPessoa.cpf?.trim()) newErrors.cpf = 'CPF é obrigatório';
            if (!formData.dataFuncionario.dataPessoa.email?.trim()) newErrors.email = 'Email é obrigatório';
        }
        
        if (currentStep === 2) {
            if (!medicoParaEditar && !formData.dataFuncionario.dataPessoa.login?.trim()) newErrors.login = 'Login é obrigatório';
            if (!medicoParaEditar && !formData.dataFuncionario.dataPessoa.senha?.trim()) newErrors.senha = 'Senha é obrigatória';
            if (!medicoParaEditar && formData.dataFuncionario.dataPessoa.senha !== confirmPassword) newErrors.confirmPassword = 'Senhas não conferem';
        }
        
        if (currentStep === 3) {
            if (!formData.dataFuncionario.idCargo) newErrors.idCargo = 'Cargo é obrigatório';
            if (!formData.crm?.trim()) newErrors.crm = 'CRM é obrigatório';
            if (!formData.dataFuncionario.idsUnidade?.length) newErrors.idsUnidade = 'Selecione pelo menos uma unidade';
            if (!formData.especialidadeIds.length) newErrors.especialidades = 'Selecione pelo menos uma especialidade';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => validateStep() && setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep !== 4 || !validateStep()) return;
        setLoading(true);
        
        const payload = {
            ...formData,
            dataFuncionario: {
                ...formData.dataFuncionario,
                idCargo: Number(formData.dataFuncionario.idCargo),
                idsUnidade: formData.dataFuncionario.idsUnidade.map(id => Number(id)) // CONVERTER IDs PARA NUMBER
            },
            especialidadeIds: formData.especialidadeIds.map(id => parseInt(id, 10)),
            horariosDeTrabalho: formData.horariosDeTrabalho.map(h => ({
                ...h,
                idUnidade: Number(h.idUnidade)
            }))
        };
        
        if (medicoParaEditar && !payload.dataFuncionario.dataPessoa.senha) {
            delete payload.dataFuncionario.dataPessoa.senha;
        }

        const formDataRequest = new FormData();
        formDataRequest.append('dados', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (fotoPerfil) formDataRequest.append('fotoPerfil', fotoPerfil);

        await onSave(formDataRequest);
        setLoading(false);
    };
    
    const ProgressBar = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative', padding: '0 20px' }}>
            <div style={{ position: 'absolute', top: '15px', left: '50px', right: '50px', height: '2px', backgroundColor: colors.border, zIndex: 0 }}></div>
            {['Dados Pessoais', 'Credenciais', 'Dados Profissionais', 'Horários'].map((step, index) => (
                <div key={step} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ backgroundColor: index + 1 <= currentStep ? colors.primary : colors.border, color: colors.white, borderRadius: '50%', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: `2px solid ${index + 1 <= currentStep ? colors.primary : colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {index + 1}
                    </div>
                    <p style={{ fontSize: '14px', marginTop: '8px', fontWeight: index + 1 === currentStep ? 'bold' : 'normal', color: index + 1 <= currentStep ? colors.text_primary : colors.text_secondary }}>
                        {step}
                    </p>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ ...styles.app.card, backgroundColor: colors.background, padding: '2rem', borderRadius: '12px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ ...styles.app.title, color: colors.text_primary, fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '600', textAlign: 'center' }}>
                {medicoParaEditar ? `Editar Médico: ${medicoParaEditar?.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome}` : "Cadastrar Novo Médico"}
            </h2>
            
            <ProgressBar />
            
            <form onSubmit={handleSubmit} style={styles.app.form}>
                 {currentStep === 1 && (
                     <section>
                         <h3 style={{ ...styles.app.subtitle, color: colors.text_primary, fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '500', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.5rem' }}>
                             Dados Pessoais e Endereço
                         </h3>
                         <div style={{ ...styles.app.formGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                             <InputField styles={styles} colors={colors} label="Nome Completo*" name="dataFuncionario.dataPessoa.nome" value={formData.dataFuncionario?.dataPessoa?.nome || ''} onChange={handleChange} error={errors.nome} />
                             <InputField styles={styles} colors={colors} label="CPF*" name="dataFuncionario.dataPessoa.cpf" value={formData.dataFuncionario?.dataPessoa?.cpf || ''} onChange={handleChange} disabled={!!medicoParaEditar} error={errors.cpf} />
                             <InputField styles={styles} colors={colors} label="Email*" name="dataFuncionario.dataPessoa.email" type="email" value={formData.dataFuncionario?.dataPessoa?.email || ''} onChange={handleChange} error={errors.email} />
                             <InputField styles={styles} colors={colors} label="Telefone" name="dataFuncionario.dataPessoa.telefone" value={formData.dataFuncionario?.dataPessoa?.telefone || ''} onChange={handleChange} />
                             <InputField styles={styles} colors={colors} label="Data de Nascimento" name="dataFuncionario.dataPessoa.dataNascimento" type="date" value={formData.dataFuncionario?.dataPessoa?.dataNascimento || ''} onChange={handleChange} />
                             <SelectField styles={styles} colors={colors} label="Sexo" name="dataFuncionario.dataPessoa.sexo" value={formData.dataFuncionario?.dataPessoa?.sexo || ''} onChange={handleChange} options={[{id: 'MASCULINO', nome: 'Masculino'}, {id: 'FEMININO', nome: 'Feminino'}]} />
                         </div>
                         <div style={{marginTop: '1.5rem'}}>
                             <InputField styles={styles} colors={colors} label="Foto de Perfil (Opcional)" type="file" accept="image/*" onChange={handleFileChange} />
                         </div>
                         <h4 style={{ color: colors.text_primary, fontSize: '1rem', margin: '1.5rem 0 1rem', fontWeight: '500' }}>Endereço</h4>
                         <div style={{ ...styles.app.formGrid, gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', marginTop: '15px', gap: '15px' }}>
                             <InputField styles={styles} colors={colors} label="Endereço (Rua, Av.)" name="dataFuncionario.dataPessoa.dataRegistroEndereco.endereco" value={formData.dataFuncionario?.dataPessoa?.dataRegistroEndereco?.endereco || ''} onChange={handleChange} />
                             <InputField styles={styles} colors={colors} label="CEP" name="dataFuncionario.dataPessoa.dataRegistroEndereco.cep" value={formData.dataFuncionario?.dataPessoa?.dataRegistroEndereco?.cep || ''} onChange={handleChange} />
                         </div>
                         <div style={{ ...styles.app.formGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', marginTop: '15px', gap: '15px' }}>
                             <InputField styles={styles} colors={colors} label="Cidade" name="dataFuncionario.dataPessoa.dataRegistroEndereco.cidade" value={formData.dataFuncionario?.dataPessoa?.dataRegistroEndereco?.cidade || ''} onChange={handleChange} />
                             <InputField styles={styles} colors={colors} label="Estado (UF)" name="dataFuncionario.dataPessoa.dataRegistroEndereco.estado" value={formData.dataFuncionario?.dataPessoa?.dataRegistroEndereco?.estado || ''} onChange={handleChange} />
                             <InputField styles={styles} colors={colors} label="País" name="dataFuncionario.dataPessoa.dataRegistroEndereco.pais" value={formData.dataFuncionario?.dataPessoa?.dataRegistroEndereco?.pais || ''} onChange={handleChange} />
                         </div>
                     </section>
                 )}
                 {currentStep === 2 && (
                     <section>
                         <h3 style={{ ...styles.app.subtitle, color: colors.text_primary, fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '500', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.5rem' }}>Credenciais</h3>
                         <div style={{...styles.app.formGrid, gridTemplateColumns: '1fr', gap: '15px' }}>
                             <InputField styles={styles} colors={colors} label="Login*" name="dataFuncionario.dataPessoa.login" value={formData.dataFuncionario?.dataPessoa?.login || ''} onChange={handleChange} disabled={!!medicoParaEditar} error={errors.login} />
                         </div>
                         <div style={{...styles.app.formGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                             <InputField styles={styles} colors={colors} label="Senha" name="dataFuncionario.dataPessoa.senha" type="password" placeholder={medicoParaEditar ? "Deixe em branco para não alterar" : ""} onChange={handleChange} error={errors.senha} />
                             {!medicoParaEditar && <InputField styles={styles} colors={colors} label="Confirmar Senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />}
                         </div>
                     </section>
                 )}

                 {currentStep === 3 && (
                     <section>
                         <h3 style={{ ...styles.app.subtitle, color: colors.text_primary, fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '500', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.5rem' }}>Dados Funcionais e Profissionais</h3>
                         <div style={{ ...styles.app.formGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                             <SelectField styles={styles} colors={colors} label="Cargo*" name="dataFuncionario.idCargo" value={formData.dataFuncionario.idCargo} onChange={handleChange} options={cargosDisponiveis} error={errors.idCargo} />
                             <InputField styles={styles} colors={colors} label="Data de Admissão" name="dataFuncionario.dataAdmissao" type="date" value={formData.dataFuncionario.dataAdmissao} onChange={handleChange} />
                             <InputField styles={styles} colors={colors} label="Salário (se CLT)" name="dataFuncionario.salario" type="number" value={formData.dataFuncionario.salario} onChange={handleChange} />
                             <SelectField styles={styles} colors={colors} label="Vínculo Contratual" name="dataFuncionario.tipoVinculo" value={formData.dataFuncionario.tipoVinculo} onChange={handleChange} options={tiposDeVinculo} />
                             <InputField styles={styles} colors={colors} label="CRM*" name="crm" value={formData.crm} onChange={handleChange} disabled={!!medicoParaEditar} error={errors.crm} />
                             
                             <InputField styles={styles} colors={colors} label="Valor Consulta Presencial" name="valorConsultaPresencial" type="number" value={formData.valorConsultaPresencial} onChange={handleChange} />
                             <InputField styles={styles} colors={colors} label="Valor Consulta Online" name="valorConsultaOnline" type="number" value={formData.valorConsultaOnline} onChange={handleChange} />

                             <InputField styles={styles} colors={colors} label="Intervalo Consulta Presencial (min)" name="intervaloConsultaPresencialMinutos" type="number" value={formData.intervaloConsultaPresencialMinutos} onChange={handleChange} />
                             <InputField styles={styles} colors={colors} label="Intervalo Consulta Online (min)" name="intervaloConsultaOnlineMinutos" type="number" value={formData.intervaloConsultaOnlineMinutos} onChange={handleChange} />
                         </div>
                         
                         {/* NOVO CAMPO DE SELEÇÃO DE UNIDADES */}
                         <SelecaoUnidades
                             unidades={unidadesDisponiveis}
                             unidadesSelecionadas={formData.dataFuncionario.idsUnidade}
                             onUnidadesChange={handleUnidadesChange}
                             styles={styles}
                             colors={colors}
                             error={errors.idsUnidade}
                         />
                         
                         <div style={{...styles.app.formGroup, marginTop: '1.5rem'}}>
                             <label style={{ ...styles.app.label, display: 'block', marginBottom: '10px', fontWeight: '500', fontSize: '14px', color: colors.text_primary }}>Especialidades*</label>
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', padding: '15px', border: `1px solid ${errors.especialidades ? colors.danger : colors.border}`, borderRadius: '8px', ...(errors.especialidades && { boxShadow: `0 0 0 2px ${colors.danger}20` }) }}>
                                 {especialidadesDisponiveis.map(esp => (
                                     <div key={esp.id} style={{ display: 'flex', alignItems: 'center' }}>
                                         <input type="checkbox" id={`esp-${esp.id}`} value={esp.id} checked={formData.especialidadeIds.includes(esp.id.toString())} onChange={() => handleEspecialidadeChange(esp.id.toString())} style={{ marginRight: '8px', accentColor: colors.primary }} />
                                         <label htmlFor={`esp-${esp.id}`} style={{color: colors.text_primary, fontSize: '14px'}}>{esp.nome}</label>
                                     </div>
                                 ))}
                             </div>
                             {errors.especialidades && (
                                 <span style={{ color: colors.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                     {errors.especialidades}
                                 </span>
                             )}
                         </div>
                     </section>
                 )}
                
                 {currentStep === 4 && (
                     <section>
                         <h3 style={{ ...styles.app.subtitle, color: colors.text_primary, fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '500', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.5rem' }}>Horários de Trabalho</h3>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                             {unidadesDisponiveis.length > 0 ? (
                                unidadesDisponiveis.map(unidade => (
                                    <div key={unidade.id} style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '20px' }}>
                                        <h4 style={{ color: colors.primary, marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>
                                             Unidade: {unidade.nome}
                                        </h4>
                                         
                                        {diasDaSemana.map(dia => (
                                            <div key={`${unidade.id}-${dia}`} style={{ marginBottom: '15px' }}>
                                                <strong style={{ textTransform: 'capitalize', display: 'block', marginBottom: '10px', color: colors.text_primary, fontSize: '14px', fontWeight: 500 }}>
                                                    {dia.toLowerCase().replace(/_/g, ' ')}
                                                </strong>
                                                 
                                                {formData.horariosDeTrabalho.filter(h => h.diaDaSemana === dia && h.idUnidade == unidade.id).map((horario) => {
                                                    const originalIndex = formData.horariosDeTrabalho.indexOf(horario);
                                                    return (
                                                        <div key={originalIndex} style={{ borderLeft: `3px solid ${colors.primary_light}`, paddingLeft: '15px', marginBottom: '15px' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr auto', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                                                <select value={horario.tipoConsulta} onChange={(e) => handleHorarioChange(originalIndex, 'tipoConsulta', e.target.value)} style={{...styles.app.select, padding: '8px 10px'}}>
                                                                    {tiposDeConsulta.map(tipo => <option key={tipo} value={tipo}>{tipo.charAt(0) + tipo.slice(1).toLowerCase()}</option>)}
                                                                </select>
                                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                                    <input type="time" value={horario.horaInicio} onChange={(e) => handleHorarioChange(originalIndex, 'horaInicio', e.target.value)} style={{ ...styles.app.input, padding: '8px 10px' }} />
                                                                    <span style={{color: colors.text_primary}}>às</span>
                                                                    <input type="time" value={horario.horaFim} onChange={(e) => handleHorarioChange(originalIndex, 'horaFim', e.target.value)} style={{ ...styles.app.input, padding: '8px 10px' }} />
                                                                </div>

                                                                <button type="button" onClick={() => removeHorario(originalIndex)} style={{ ...styles.app.button, backgroundColor: colors.danger, padding: '8px 12px', color: colors.white }}>
                                                                     Remover
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                 
                                                <button type="button" onClick={() => addHorario(dia, unidade.id)} style={{ ...styles.app.button, backgroundColor: 'transparent', border: `1px dashed ${colors.primary}`, color: colors.primary, padding: '6px 12px', marginTop: '10px', fontSize: '13px' }}>
                                                     + Adicionar Turno
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ))
                             ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', border: `1px dashed ${colors.border}`, borderRadius: '8px' }}>
                                    <p style={{ color: colors.text_secondary, margin: 0 }}>
                                        Nenhuma unidade de atendimento encontrada.
                                    </p>
                                    <p style={{ color: colors.text_secondary, margin: '0.5rem 0 0' }}>
                                        Por favor, cadastre uma unidade antes de definir os horários do médico.
                                    </p>
                                </div>
                             )}
                         </div>
                     </section>
                 )}

                
                 <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
                     <div>
                         {currentStep > 1 && (<button type="button" onClick={prevStep} style={{ ...styles.app.button, backgroundColor: colors.secondary, color: colors.white }}>Voltar</button>)}
                     </div>
                     <div style={{ display: 'flex', gap: '15px' }}>
                         <button type="button" onClick={onCancel} style={{ ...styles.app.button, backgroundColor: 'transparent', color: colors.text_secondary, border: `1px solid ${colors.border}` }}>Cancelar</button>
                         {currentStep < 4 && (<button type="button" onClick={nextStep} style={{ ...styles.app.button, backgroundColor: colors.primary, color: colors.white }}>Próximo</button>)}
                         {currentStep === 4 && (<button type="submit" disabled={loading} style={{ ...styles.app.button, backgroundColor: loading ? colors.secondary : colors.success, color: colors.white }}>{loading ? 'Salvando...' : (medicoParaEditar ? 'Atualizar Médico' : 'Cadastrar Médico')}</button>)}
                     </div>
                 </div>
            </form>
        </div>
    );
};

export default FormularioMedico;