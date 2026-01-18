import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// =================================================================
// 🎨 UI COMPONENTS (REBRANDED)
// =================================================================

// Toast Moderno (Igual ao da tela de Aulas)
const ModernToast = ({ message, type, onClose, styles }) => (
    <div style={{
        position: 'fixed', top: '24px', right: '24px', 
        padding: '16px 24px', borderRadius: '16px',
        backgroundColor: styles.colors.white,
        borderLeft: `6px solid ${type === 'success' ? styles.colors.success : styles.colors.danger}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 1100,
        display: 'flex', alignItems: 'center', gap: '16px',
        animation: 'slideIn 0.3s ease-out',
        border: `1px solid ${styles.colors.borderLight}`
    }}>
        <div style={{ 
            width: '24px', height: '24px', borderRadius: '50%', 
            backgroundColor: type === 'success' ? `${styles.colors.success}20` : `${styles.colors.danger}20`,
            color: type === 'success' ? styles.colors.success : styles.colors.danger,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'
        }}>
            {type === 'success' ? '✓' : '!'}
        </div>
        <span style={{ fontWeight: '600', fontSize: '14px', color: styles.colors.textDark }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted, fontSize: '18px' }}>×</button>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
);

// Input Moderno "Wellness"
const ModernInput = ({ label, name, value, onChange, disabled, type = "text", placeholder, styles, width = "100%" }) => (
    <div style={{ width, marginBottom: '16px' }}>
        <label style={{ 
            display: 'block', marginBottom: '8px', fontSize: '12px', 
            fontWeight: '700', color: styles.colors.textMuted, 
            textTransform: 'uppercase', letterSpacing: '0.5px' 
        }}>
            {label}
        </label>
        <input 
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            disabled={disabled}
            placeholder={placeholder}
            style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1px solid ${disabled ? 'transparent' : styles.colors.border}`,
                backgroundColor: disabled ? styles.colors.lightGray : styles.colors.white,
                color: disabled ? styles.colors.textMuted : styles.colors.textDark,
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                boxShadow: disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => !disabled && (e.target.style.borderColor = styles.colors.primary, e.target.style.boxShadow = `0 0 0 3px ${styles.colors.primary}20`)}
            onBlur={(e) => !disabled && (e.target.style.borderColor = styles.colors.border, e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)')}
        />
    </div>
);

// Select Moderno
const ModernSelect = ({ label, name, value, onChange, disabled, options, styles }) => (
    <div style={{ width: '100%', marginBottom: '16px' }}>
        <label style={{ 
            display: 'block', marginBottom: '8px', fontSize: '12px', 
            fontWeight: '700', color: styles.colors.textMuted, 
            textTransform: 'uppercase', letterSpacing: '0.5px' 
        }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <select 
                name={name} 
                value={value || ''} 
                onChange={onChange} 
                disabled={disabled}
                style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${disabled ? 'transparent' : styles.colors.border}`,
                    backgroundColor: disabled ? styles.colors.lightGray : styles.colors.white,
                    color: disabled ? styles.colors.textMuted : styles.colors.textDark,
                    fontSize: '14px',
                    fontWeight: '500',
                    outline: 'none',
                    appearance: 'none',
                    cursor: disabled ? 'default' : 'pointer'
                }}
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {!disabled && (
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: styles.colors.textMuted }}>
                    ▼
                </div>
            )}
        </div>
    </div>
);

// Botão de Ação Primário
const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary' }) => {
    const bgColor = variant === 'save' ? styles.colors.success : styles.colors.primary;
    return (
        <button 
            onClick={onClick} 
            disabled={disabled || loading}
            style={{
                padding: '12px 24px',
                borderRadius: '30px',
                border: 'none',
                backgroundColor: disabled ? styles.colors.disabled : bgColor,
                color: styles.colors.white,
                fontSize: '14px',
                fontWeight: '600',
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: disabled ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
            }}
        >
            {loading ? (
                <span style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            ) : null}
            {children}
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </button>
    );
};

// Card de Seção
const SectionCard = ({ title, onEdit, isEditing, children, styles, onSave, loading }) => (
    <div style={{
        backgroundColor: styles.colors.white,
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${styles.colors.borderLight}`
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${styles.colors.borderLight}` }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: styles.colors.textDark, display: 'flex', alignItems: 'center', gap: '8px' }}>
               {title}
            </h3>
            {onEdit && (
                <button 
                    onClick={onEdit}
                    style={{
                        background: 'transparent', border: 'none',
                        color: isEditing ? styles.colors.danger : styles.colors.primary,
                        fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                        padding: '8px 16px', borderRadius: '20px',
                        backgroundColor: isEditing ? `${styles.colors.danger}15` : `${styles.colors.primary}15`,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isEditing ? 'Cancelar Edição' : 'Editar'}
                </button>
            )}
        </div>
        
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {children}
        </div>

        {isEditing && onSave && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: `1px dashed ${styles.colors.border}` }}>
                <ActionButton onClick={onSave} loading={loading} styles={styles} variant="save">
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </ActionButton>
            </div>
        )}
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
);

// =================================================================
// COMPONENTE PRINCIPAL (LÓGICA + UI)
// =================================================================

const AtualizarDados = () => {
    // Hooks
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const [matches, setMatches] = useState(window.matchMedia('(max-width: 768px)').matches);

    // Estado
    const [dados, setDados] = useState(null);
    const [formData, setFormData] = useState({});
    const [editando, setEditando] = useState({ 
        pessoais: false, endereco: false, saude: false, senha: false, foto: false 
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // Listener de Responsividade
    useEffect(() => {
        const media = window.matchMedia('(max-width: 768px)');
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    // Popula o formulário
    const popularFormData = (dadosApi) => {
        const dataPessoa = dadosApi.dataDetalhesPessoa || {};
        const dataEndereco = dataPessoa.dataDetalhesEndereco || {};
        setFormData({
            nome: dataPessoa.nome,
            telefone: dataPessoa.telefone,
            dataNascimento: dataPessoa.dataNascimento?.split('T')[0],
            endereco: dataEndereco.endereco,
            cidade: dataEndereco.cidade,
            estado: dataEndereco.estado,
            cep: dataEndereco.cep,
            pais: dataEndereco.pais,
            referencia: dataEndereco.referencia,
            tipoSanguineo: dadosApi.tipoSanguineo,
            contatoEmergencia: dadosApi.contatoEmergencia,
            peso: dadosApi.peso,
            altura: dadosApi.altura,
            senha: '',
            confirmarSenha: '',
            fotoPerfilUrl: dataPessoa.fotoPerfilUrl
        });
        if (dataPessoa.fotoPerfilUrl) setPreviewUrl(dataPessoa.fotoPerfilUrl);
    };

    // Fetch Inicial
    useEffect(() => {
        const fetchDados = async () => {
            setLoading(true);
            try {
                const response = await api.get("/pessoa/dados");
                setDados(response.data);
                popularFormData(response.data);
            } catch (error) {
                setMessage({ text: "Erro ao carregar dados.", type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchDados();
    }, []);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleEdicao = (section) => {
        setEditando(prev => ({ ...prev, [section]: !prev[section] }));
        if (editando[section]) {
            // Cancelar edição: reseta dados
            popularFormData(dados);
            if (section === 'foto') {
                setSelectedFile(null);
                setPreviewUrl(dados.dataDetalhesPessoa?.fotoPerfilUrl || '');
            }
        }
    };

    const handleSubmit = async (section) => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        const formPayload = new FormData();
        const payload = {};

        if (section === 'pessoais') {
            payload.dataAtualizarPessoa = { 
                nome: formData.nome, telefone: formData.telefone, dataNascimento: formData.dataNascimento 
            };
        } else if (section === 'endereco') {
            payload.dataAtualizarPessoa = { 
                dataRegistroEndereco: { 
                    endereco: formData.endereco, cidade: formData.cidade, estado: formData.estado, 
                    cep: formData.cep, pais: formData.pais, referencia: formData.referencia 
                }
            };
        } else if (section === 'saude') {
            payload.dataAtualizarPaciente = { 
                tipoSanguineo: formData.tipoSanguineo, contatoEmergencia: formData.contatoEmergencia, 
                peso: formData.peso, altura: formData.altura 
            };
        } else if (section === 'senha') {
            if (!formData.senha || formData.senha !== formData.confirmarSenha) {
                setMessage({ text: 'As senhas não coincidem ou estão vazias.', type: 'error' }); 
                setLoading(false); return;
            }
            payload.dataAtualizarPessoa = { senha: formData.senha };
        }

        const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        formPayload.append('data', jsonBlob);
        
        if (section === 'foto' && selectedFile) {
            formPayload.append('fotoPerfil', selectedFile);
        }

        try {
            await api.put("/paciente/atualizar", formPayload, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage({ text: 'Dados atualizados com sucesso!', type: 'success' });
            
            // Refetch para garantir integridade
            const response = await api.get("/pessoa/dados");
            setDados(response.data);
            popularFormData(response.data);
            setEditando(prev => ({ ...prev, [section]: false }));
            if(section === 'foto') setSelectedFile(null);

        } catch (error) {
            setMessage({ text: error.response?.data?.message || "Erro ao atualizar os dados.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getIMC = () => {
        const peso = parseFloat(formData.peso);
        const alturaCm = parseFloat(formData.altura);
        if (peso > 0 && alturaCm > 0) {
            const alturaM = alturaCm / 100;
            return (peso / (alturaM * alturaM)).toFixed(2);
        }
        return 'N/A';
    };

    // Layout Grids
    const gridStyle = { 
        display: 'grid', 
        gridTemplateColumns: matches ? '1fr' : '1fr 1fr', 
        gap: '20px' 
    };

    if (loading && !dados) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: styles.colors.textMuted }}>
                 <div style={{ width: '40px', height: '40px', border: `3px solid ${styles.colors.border}`, borderTopColor: styles.colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                 <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }
    
    if (!dados) return <div style={{ padding: '40px', textAlign: 'center', color: styles.colors.danger }}>Erro ao carregar perfil.</div>;

    return (
        <div style={{ padding: matches ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            {message.text && <ModernToast message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: '' })} styles={styles} />}

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                        Meu <span style={{ color: styles.colors.primary }}>Perfil</span>
                    </h1>
                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Gerencie suas informações pessoais e de saúde.</p>
                </div>

                {/* --- FOTO & INFO BÁSICA --- */}
                <SectionCard 
                    title="Foto de Perfil" 
                    onEdit={() => toggleEdicao('foto')} 
                    isEditing={editando.foto} 
                    onSave={() => handleSubmit('foto')}
                    loading={loading}
                    styles={styles}
                >
                    <div style={{ display: 'flex', flexDirection: matches ? 'column' : 'row', alignItems: 'center', gap: '30px' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                border: `4px solid ${styles.colors.white}`,
                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: styles.colors.lightGray
                            }}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '40px', color: styles.colors.textMuted }}>
                                        {formData.nome?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            {editando.foto && (
                                <div style={{ 
                                    position: 'absolute', bottom: '0', right: '0', 
                                    backgroundColor: styles.colors.primary, color: 'white', 
                                    width: '36px', height: '36px', borderRadius: '50%', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `3px solid ${styles.colors.white}` 
                                }}>
                                    📷
                                </div>
                            )}
                        </div>
                        
                        <div style={{ flex: 1, textAlign: matches ? 'center' : 'left' }}>
                            {editando.foto ? (
                                <div>
                                    <p style={{ marginBottom: '10px', fontSize: '14px', color: styles.colors.textDark }}>Selecione uma nova imagem:</p>
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '14px' }} />
                                    <p style={{ marginTop: '8px', fontSize: '12px', color: styles.colors.textMuted }}>JPG ou PNG. Max 5MB.</p>
                                </div>
                            ) : (
                                <div>
                                    <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '700', color: styles.colors.textDark }}>{formData.nome}</h2>
                                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Paciente • {dados.dataDetalhesPessoa?.cpf}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* --- GRID DE DADOS --- */}
                <div style={gridStyle}>
                    
                    {/* COLUNA ESQUERDA */}
                    <div>
                        {/* SAÚDE */}
                        <SectionCard 
                            title="🧬 Dados de Saúde" 
                            onEdit={() => toggleEdicao('saude')} 
                            isEditing={editando.saude} 
                            onSave={() => handleSubmit('saude')}
                            loading={loading}
                            styles={styles}
                        >
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <ModernSelect 
                                    label="Tipo Sanguíneo" name="tipoSanguineo" value={formData.tipoSanguineo} 
                                    onChange={handleChange} disabled={!editando.saude} styles={styles}
                                    options={[
                                        { value: 'A_POSITIVO', label: 'A+' }, { value: 'A_NEGATIVO', label: 'A-' },
                                        { value: 'B_POSITIVO', label: 'B+' }, { value: 'B_NEGATIVO', label: 'B-' },
                                        { value: 'AB_POSITIVO', label: 'AB+' }, { value: 'AB_NEGATIVO', label: 'AB-' },
                                        { value: 'O_POSITIVO', label: 'O+' }, { value: 'O_NEGATIVO', label: 'O-' }
                                    ]}
                                />
                                <div style={{ 
                                    backgroundColor: `${styles.colors.success}15`, 
                                    borderRadius: '12px', padding: '10px', 
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' 
                                }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: styles.colors.success, textTransform: 'uppercase' }}>Seu IMC</span>
                                    <span style={{ fontSize: '20px', fontWeight: '800', color: styles.colors.success }}>{getIMC()}</span>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <ModernInput label="Altura (cm)" name="altura" type="number" value={formData.altura} onChange={handleChange} disabled={!editando.saude} styles={styles} />
                                <ModernInput label="Peso (kg)" name="peso" type="number" value={formData.peso} onChange={handleChange} disabled={!editando.saude} styles={styles} />
                            </div>
                            <ModernInput label="Contato de Emergência" name="contatoEmergencia" value={formData.contatoEmergencia} onChange={handleChange} disabled={!editando.saude} styles={styles} />
                        </SectionCard>

                        {/* SEGURANÇA */}
                        <SectionCard 
                            title="🔒 Segurança" 
                            onEdit={() => toggleEdicao('senha')} 
                            isEditing={editando.senha} 
                            onSave={() => handleSubmit('senha')}
                            loading={loading}
                            styles={styles}
                        >
                            {editando.senha ? (
                                <>
                                    <ModernInput label="Nova Senha" name="senha" type="password" value={formData.senha} onChange={handleChange} disabled={false} placeholder="Min. 8 caracteres" styles={styles} />
                                    <ModernInput label="Confirmar Senha" name="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={handleChange} disabled={false} placeholder="Repita a senha" styles={styles} />
                                </>
                            ) : (
                                <div style={{ color: styles.colors.textMuted, fontSize: '14px', fontStyle: 'italic' }}>
                                    Sua senha está protegida. Clique em editar para alterar.
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* COLUNA DIREITA */}
                    <div>
                        {/* PESSOAL */}
                        <SectionCard 
                            title="👤 Dados Pessoais" 
                            onEdit={() => toggleEdicao('pessoais')} 
                            isEditing={editando.pessoais} 
                            onSave={() => handleSubmit('pessoais')}
                            loading={loading}
                            styles={styles}
                        >
                            <ModernInput label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} disabled={!editando.pessoais} styles={styles} />
                            <ModernInput label="CPF" name="cpf" value={dados.dataDetalhesPessoa?.cpf} disabled={true} styles={styles} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <ModernInput label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} disabled={!editando.pessoais} styles={styles} />
                                <ModernInput label="Nascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} disabled={!editando.pessoais} styles={styles} />
                            </div>
                        </SectionCard>

                        {/* ENDEREÇO */}
                        <SectionCard 
                            title="📍 Endereço" 
                            onEdit={() => toggleEdicao('endereco')} 
                            isEditing={editando.endereco} 
                            onSave={() => handleSubmit('endereco')}
                            loading={loading}
                            styles={styles}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                                <ModernInput label="Rua/Av" name="endereco" value={formData.endereco} onChange={handleChange} disabled={!editando.endereco} styles={styles} />
                                <ModernInput label="CEP" name="cep" value={formData.cep} onChange={handleChange} disabled={!editando.endereco} styles={styles} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <ModernInput label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} disabled={!editando.endereco} styles={styles} />
                                <ModernInput label="UF" name="estado" value={formData.estado} onChange={handleChange} disabled={!editando.endereco} styles={styles} />
                                <ModernInput label="País" name="pais" value={formData.pais} onChange={handleChange} disabled={!editando.endereco} styles={styles} />
                            </div>
                            <ModernInput label="Referência" name="referencia" value={formData.referencia} onChange={handleChange} disabled={!editando.endereco} styles={styles} />
                        </SectionCard>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AtualizarDados;