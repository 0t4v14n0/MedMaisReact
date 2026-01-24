import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// =================================================================
// 🎨 UI COMPONENTS (MANTIDOS)
// =================================================================

const ModernToast = ({ message, type, onClose, styles }) => (
    <div style={{
        position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '16px',
        backgroundColor: styles.colors.white, borderLeft: `6px solid ${type === 'success' ? styles.colors.success : styles.colors.danger}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 1100, display: 'flex', alignItems: 'center', gap: '16px',
        animation: 'slideIn 0.3s ease-out', border: `1px solid ${styles.colors.borderLight}`
    }}>
        <span style={{ fontWeight: '600', fontSize: '14px', color: styles.colors.textDark }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted }}>×</button>
    </div>
);

const ModernInput = ({ label, name, value, onChange, disabled, type = "text", placeholder, styles, width = "100%" }) => (
    <div style={{ width, marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, textTransform: 'uppercase' }}>{label}</label>
        <input 
            type={type} name={name} value={value || ''} onChange={onChange} disabled={disabled} placeholder={placeholder}
            style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${disabled ? 'transparent' : styles.colors.border}`,
                backgroundColor: disabled ? styles.colors.lightGray : styles.colors.white, color: disabled ? styles.colors.textMuted : styles.colors.textDark,
                fontSize: '14px', fontWeight: '500', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box'
            }}
        />
    </div>
);

const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary' }) => {
    const bgColor = variant === 'save' ? styles.colors.success : styles.colors.primary;
    return (
        <button onClick={onClick} disabled={disabled || loading} style={{
            padding: '12px 24px', borderRadius: '30px', border: 'none', backgroundColor: disabled ? styles.colors.disabled : bgColor,
            color: styles.colors.white, fontSize: '14px', fontWeight: '600', cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: disabled ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            {loading ? '...' : children}
        </button>
    );
};

// SectionCard agora aceita null no onEdit para esconder o botão
const SectionCard = ({ title, onEdit, isEditing, children, styles, onSave, loading }) => (
    <div style={{ backgroundColor: styles.colors.white, borderRadius: '24px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${styles.colors.borderLight}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${styles.colors.borderLight}` }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: styles.colors.textDark }}>{title}</h3>
            {onEdit && (
                <button onClick={onEdit} style={{ background: 'transparent', border: 'none', color: isEditing ? styles.colors.danger : styles.colors.primary, fontWeight: '600', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', backgroundColor: isEditing ? `${styles.colors.danger}15` : `${styles.colors.primary}15` }}>
                    {isEditing ? 'Cancelar' : 'Editar'}
                </button>
            )}
        </div>
        <div>{children}</div>
        {isEditing && onSave && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: `1px dashed ${styles.colors.border}` }}>
                <ActionButton onClick={onSave} loading={loading} styles={styles} variant="save">{loading ? 'Salvando...' : 'Salvar Alterações'}</ActionButton>
            </div>
        )}
    </div>
);

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================

const AtualizarDados = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const [matches, setMatches] = useState(window.matchMedia('(max-width: 768px)').matches);

    const [dados, setDados] = useState(null);
    const [formData, setFormData] = useState({});
    
    // Configuração de edição (Profissional removido daqui pois não será editável)
    const [editando, setEditando] = useState({ pessoais: false, endereco: false, senha: false, foto: false });
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const handler = () => setMatches(window.matchMedia('(max-width: 768px)').matches);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const popularFormData = (dadosApi) => {
        const funcionario = dadosApi.dataDetalhesFuncionario || {};
        const pessoa = funcionario.dataDetalhesPessoa || {};
        const endereco = pessoa.dataDetalhesEndereco || {};
        
        setFormData({
            // Editáveis
            nome: pessoa.nome,
            telefone: pessoa.telefone,
            email: pessoa.email,
            dataNascimento: pessoa.dataNascimento,
            
            endereco: endereco.endereco,
            cidade: endereco.cidade,
            estado: endereco.estado,
            cep: endereco.cep,
            pais: endereco.pais,
            referencia: endereco.referencia,

            // Apenas Leitura (mas precisamos popular para mostrar)
            cpf: pessoa.cpf,
            crm: dadosApi.crm,
            valorConsultaPresencial: dadosApi.valorConsultaPresencial,
            valorConsultaOnline: dadosApi.valorConsultaOnline,
            especialidades: dadosApi.especialidadesMedica || [],

            // Senha e Foto
            senha: '',
            confirmarSenha: '',
            fotoPerfilUrl: dadosApi.fotoPerfilUrl || pessoa.fotoPerfilUrl
        });

        if (dadosApi.fotoPerfilUrl || pessoa.fotoPerfilUrl) {
            setPreviewUrl(dadosApi.fotoPerfilUrl || pessoa.fotoPerfilUrl);
        }
    };

    useEffect(() => {
        const fetchDados = async () => {
            setLoading(true);
            try {
                const response = await api.get("/medico/dados");
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
            popularFormData(dados); // Cancelar reverte as mudanças
            if (section === 'foto') {
                setSelectedFile(null);
                const pessoa = dados.dataDetalhesFuncionario?.dataDetalhesPessoa || {};
                setPreviewUrl(dados.fotoPerfilUrl || pessoa.fotoPerfilUrl || '');
            }
        }
    };

    const handleSubmit = async (section) => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        const formPayload = new FormData();
        
        // Mantemos os dados originais que não são editáveis na tela
        const especialidadesOriginais = dados.especialidadesMedica ? dados.especialidadesMedica.map(e => e.id) : [];

        const payloadJson = {
            pessoa: {
                nome: formData.nome,
                telefone: formData.telefone,
                email: formData.email,
                dataNascimento: formData.dataNascimento,
                dataRegistroEndereco: {
                    endereco: formData.endereco,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    cep: formData.cep,
                    pais: formData.pais,
                    referencia: formData.referencia
                }
            },
            // Dados Profissionais vão inalterados
            crm: dados.crm, 
            valorConsultaPresencial: dados.valorConsultaPresencial, 
            valorConsultaOnline: dados.valorConsultaOnline,
            especialidadeIds: especialidadesOriginais 
        };

        if (section === 'senha') {
             if (!formData.senha || formData.senha !== formData.confirmarSenha) {
                setMessage({ text: 'Senhas não conferem.', type: 'error' }); 
                setLoading(false); return;
            }
            payloadJson.pessoa.senha = formData.senha;
        }

        const jsonBlob = new Blob([JSON.stringify(payloadJson)], { type: 'application/json' });
        formPayload.append('data', jsonBlob);
        
        if (section === 'foto' && selectedFile) {
            formPayload.append('fotoPerfil', selectedFile);
        }

        try {
            await api.put("/medico/atualizar", formPayload, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage({ text: 'Dados atualizados com sucesso!', type: 'success' });
            
            const response = await api.get("/medico/dados");
            setDados(response.data);
            popularFormData(response.data);
            
            setEditando(prev => ({ ...prev, [section]: false }));
            if(section === 'foto') setSelectedFile(null);

        } catch (error) {
            console.error(error);
            setMessage({ text: error.response?.data?.message || "Falha ao atualizar.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const gridStyle = { display: 'grid', gridTemplateColumns: matches ? '1fr' : '1fr 1fr', gap: '20px' };

    if (loading && !dados) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>;

    return (
        <div style={{ padding: matches ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            {message.text && <ModernToast message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: '' })} styles={styles} />}

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark }}>
                        Minha <span style={{ color: styles.colors.primary }}>Conta</span>
                    </h1>
                </div>

                {/* FOTO */}
                <SectionCard title="Foto de Perfil" onEdit={() => toggleEdicao('foto')} isEditing={editando.foto} onSave={() => handleSubmit('foto')} loading={loading} styles={styles}>
                     <div style={{ display: 'flex', flexDirection: matches ? 'column' : 'row', alignItems: 'center', gap: '30px' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `4px solid ${styles.colors.white}`, boxShadow: '0 8px 20px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: styles.colors.lightGray }}>
                                {previewUrl ? <img src={previewUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '40px', color: styles.colors.textMuted }}>Dr.</span>}
                            </div>
                            {editando.foto && <div style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: styles.colors.primary, color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${styles.colors.white}` }}>📷</div>}
                        </div>
                        {editando.foto && <input type="file" accept="image/*" onChange={handleFileChange} />}
                    </div>
                </SectionCard>

                <div style={gridStyle}>
                    <div>
                        {/* PESSOAL - Editável */}
                        <SectionCard title="👤 Dados Pessoais" onEdit={() => toggleEdicao('pessoais')} isEditing={editando.pessoais} onSave={() => handleSubmit('pessoais')} loading={loading} styles={styles}>
                            <ModernInput label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} disabled={!editando.pessoais} styles={styles} />
                            <ModernInput label="Email" name="email" value={formData.email} onChange={handleChange} disabled={!editando.pessoais} styles={styles} />
                            <ModernInput label="CPF" name="cpf" value={formData.cpf} disabled={true} styles={styles} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <ModernInput label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} disabled={!editando.pessoais} styles={styles} />
                                <ModernInput label="Nascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} disabled={!editando.pessoais} styles={styles} />
                            </div>
                        </SectionCard>

                         {/* SEGURANÇA - Editável */}
                         <SectionCard title="🔒 Segurança" onEdit={() => toggleEdicao('senha')} isEditing={editando.senha} onSave={() => handleSubmit('senha')} loading={loading} styles={styles}>
                            {editando.senha ? (
                                <>
                                    <ModernInput label="Nova Senha" name="senha" type="password" value={formData.senha} onChange={handleChange} disabled={false} placeholder="Min. 8 caracteres" styles={styles} />
                                    <ModernInput label="Confirmar Senha" name="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={handleChange} disabled={false} placeholder="Repita a senha" styles={styles} />
                                </>
                            ) : (
                                <div style={{ color: styles.colors.textMuted, fontSize: '14px', fontStyle: 'italic' }}>Senha protegida.</div>
                            )}
                        </SectionCard>
                    </div>

                    <div>
                        {/* ENDEREÇO - Editável */}
                        <SectionCard title="📍 Endereço" onEdit={() => toggleEdicao('endereco')} isEditing={editando.endereco} onSave={() => handleSubmit('endereco')} loading={loading} styles={styles}>
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

                        {/* DADOS PROFISSIONAIS - APENAS LEITURA */}
                        {/* Note que não passamos onEdit aqui, o botão de editar some */}
                        <SectionCard title="🩺 Dados Profissionais" styles={styles}>
                            <ModernInput label="CRM" value={formData.crm} disabled={true} styles={styles} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <ModernInput label="Valor Presencial" value={`R$ ${formData.valorConsultaPresencial || 0}`} disabled={true} styles={styles} />
                                <ModernInput label="Valor Online" value={`R$ ${formData.valorConsultaOnline || 0}`} disabled={true} styles={styles} />
                            </div>
                            
                            <div style={{ marginTop: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, textTransform: 'uppercase' }}>Especialidades</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {formData.especialidades && formData.especialidades.length > 0 ? (
                                        formData.especialidades.map(esp => (
                                            <span key={esp.id} style={{
                                                backgroundColor: styles.colors.lightGray, color: styles.colors.textDark,
                                                padding: '6px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: '600',
                                                border: `1px solid ${styles.colors.border}`
                                            }}>
                                                {esp.nome}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '13px', color: styles.colors.textMuted }}>Nenhuma registrada.</span>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: `${styles.colors.info}10`, borderRadius: '12px', border: `1px solid ${styles.colors.info}20` }}>
                                <p style={{ fontSize: '12px', margin: 0, color: styles.colors.textMuted, fontStyle: 'italic' }}>
                                    🔒 Para alterar dados contratuais, contate o administrador.
                                </p>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtualizarDados;