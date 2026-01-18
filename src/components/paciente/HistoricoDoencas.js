import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// =================================================================
// 🎨 UI COMPONENTS (REUTILIZÁVEIS DO TEMA WELLNESS)
// =================================================================

// Hook de Responsividade
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

// Badge de Status Moderno
const StatusBadge = ({ status, styles }) => {
    let bg = styles.colors.lightGray;
    let color = styles.colors.textMuted;
    let icon = '•';

    switch (status) {
        case 'ATIVA': 
            bg = `${styles.colors.warning}20` || '#fff7ed'; 
            color = styles.colors.warning || '#ea580c'; 
            icon = '🔥';
            break;
        case 'CURADA': 
            bg = `${styles.colors.success}20`; 
            color = styles.colors.success; 
            icon = '✨';
            break;
        case 'CONTROLADA': 
            bg = `${styles.colors.primary}20`; 
            color = styles.colors.primary; 
            icon = '🛡️';
            break;
        case 'CRONICA': 
            bg = `${styles.colors.danger}20`; 
            color = styles.colors.danger; 
            icon = '⚠️';
            break;
        default: break;
    }

    return (
        <span style={{ 
            padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, 
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
        }}>
            <span>{icon}</span> {status}
        </span>
    );
};

const ModernInput = ({ label, name, value, onChange, type = "text", placeholder, styles, required, rows }) => (
    <div style={{ width: '100%', marginBottom: '16px' }}>
        <label style={{ 
            display: 'block', marginBottom: '8px', fontSize: '12px', 
            fontWeight: '700', color: styles.colors.textMuted, 
            textTransform: 'uppercase', letterSpacing: '0.5px' 
        }}>
            {label} {required && <span style={{ color: styles.colors.danger }}>*</span>}
        </label>
        {rows ? (
            <textarea
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: `1px solid ${styles.colors.border}`,
                    backgroundColor: styles.colors.white, color: styles.colors.textDark,
                    fontSize: '14px', fontWeight: '500', outline: 'none',
                    transition: 'all 0.2s ease', boxSizing: 'border-box',
                    fontFamily: 'inherit', resize: 'vertical'
                }}
                onFocus={(e) => { e.target.style.borderColor = styles.colors.primary; e.target.style.boxShadow = `0 0 0 3px ${styles.colors.primary}20`; }}
                onBlur={(e) => { e.target.style.borderColor = styles.colors.border; e.target.style.boxShadow = 'none'; }}
            />
        ) : (
            <input 
                type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder}
                style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: `1px solid ${styles.colors.border}`,
                    backgroundColor: styles.colors.white, color: styles.colors.textDark,
                    fontSize: '14px', fontWeight: '500', outline: 'none',
                    transition: 'all 0.2s ease', boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = styles.colors.primary; e.target.style.boxShadow = `0 0 0 3px ${styles.colors.primary}20`; }}
                onBlur={(e) => { e.target.style.borderColor = styles.colors.border; e.target.style.boxShadow = 'none'; }}
            />
        )}
    </div>
);

const ModernSelect = ({ label, name, value, onChange, options, styles, required }) => (
    <div style={{ width: '100%', marginBottom: '16px' }}>
        <label style={{ 
            display: 'block', marginBottom: '8px', fontSize: '12px', 
            fontWeight: '700', color: styles.colors.textMuted, 
            textTransform: 'uppercase', letterSpacing: '0.5px' 
        }}>
            {label} {required && <span style={{ color: styles.colors.danger }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            <select 
                name={name} value={value || ''} onChange={onChange}
                style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: `1px solid ${styles.colors.border}`,
                    backgroundColor: styles.colors.white, color: styles.colors.textDark,
                    fontSize: '14px', fontWeight: '500', outline: 'none', appearance: 'none', cursor: 'pointer'
                }}
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: styles.colors.textMuted }}>▼</div>
        </div>
    </div>
);

const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary' }) => {
    let bgColor = styles.colors.primary;
    let color = styles.colors.white;

    if (variant === 'danger') { bgColor = `${styles.colors.danger}20`; color = styles.colors.danger; }
    if (variant === 'ghost') { bgColor = 'transparent'; color = styles.colors.textMuted; }
    if (disabled) { bgColor = styles.colors.lightGray; color = styles.colors.textMuted; }

    return (
        <button 
            onClick={onClick} disabled={disabled || loading}
            style={{
                padding: '12px 24px', borderRadius: '30px', border: 'none',
                backgroundColor: bgColor, color: color,
                fontSize: '14px', fontWeight: '600', cursor: disabled || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: variant === 'primary' && !disabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            {loading && <span style={{ width: '12px', height: '12px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>}
            {children}
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </button>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================

const HistoricoDoencas = () => {
    // --- HOOKS ---
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');

    // --- STATE ---
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('lista'); // 'lista' | 'formulario'
    const [itemEmEdicao, setItemEmEdicao] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);

    // --- API ---
    const fetchHistorico = async (page = 0) => {
        setLoading(true);
        try {
            const response = await api.get('/historicodoenca/all', { params: { page, size: 10 } });
            setHistorico(response.data.body.content || []);
            setPaginaAtual(response.data.body.number || 0);
            setTotalPaginas(response.data.body.totalPages || 0);
        } catch (err) {
            console.error("Erro:", err);
            // Aqui você poderia usar o componente ModernToast se quisesse
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorico(paginaAtual);
    }, [paginaAtual]);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            try {
                await api.delete(`/historicodoenca/${id}`);
                fetchHistorico(paginaAtual);
            } catch (error) {
                console.error('Erro ao excluir:', error);
            }
        }
    };

    // --- FORM SUBMIT ---
    const handleFormSubmit = async (formData) => {
        try {
            const payload = { ...formData };
            if (!payload.dataRecuperacao) delete payload.dataRecuperacao;

            if (payload.id) {
                await api.put(`/historicodoenca/${payload.id}`, payload);
            } else {
                await api.post('/historicodoenca/cadastro', payload);
            }
            setViewMode('lista');
            setItemEmEdicao(null);
            fetchHistorico(0);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert("Erro ao salvar dados.");
        }
    };

    // --- HELPER DE DATA ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
    };

    // =================================================================
    // RENDER: VIEW LISTA
    // =================================================================
    const RenderLista = () => (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                        Histórico <span style={{ color: styles.colors.primary }}>Médico</span>
                    </h1>
                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Registro de doenças, alergias e condições.</p>
                </div>
                <ActionButton onClick={() => { setItemEmEdicao(null); setViewMode('formulario'); }} styles={styles}>
                    + Novo Registro
                </ActionButton>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: styles.colors.textMuted }}>
                    <div style={{ width: '40px', height: '40px', border: `3px solid ${styles.colors.border}`, borderTopColor: styles.colors.primary, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                    Carregando histórico...
                </div>
            ) : historico.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {historico.map((doenca) => (
                        <div key={doenca.id} style={{ 
                            backgroundColor: styles.colors.white, borderRadius: '20px', padding: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${styles.colors.borderLight}`,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: styles.colors.textDark }}>{doenca.nomeDoenca}</h3>
                                    <StatusBadge status={doenca.estadoAtual} styles={styles} />
                                </div>
                                
                                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: styles.colors.textMuted }}>
                                        <span style={{ fontWeight: '600' }}>📅 Diagnóstico:</span>
                                        {formatDate(doenca.dataDiagnostico)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: styles.colors.textMuted }}>
                                        <span style={{ fontWeight: '600' }}>🚑 Gravidade:</span>
                                        {doenca.gravidade}
                                    </div>
                                    {doenca.tratamento && (
                                        <div style={{ backgroundColor: styles.colors.lightGray, padding: '10px', borderRadius: '8px', marginTop: '10px', fontSize: '13px', color: styles.colors.textDark }}>
                                            <strong>💊 Tratamento:</strong> {doenca.tratamento}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ borderTop: `1px solid ${styles.colors.borderLight}`, paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => { setItemEmEdicao(doenca); setViewMode('formulario'); }} 
                                    style={{ background: 'none', border: 'none', color: styles.colors.primary, fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(doenca.id)} 
                                    style={{ background: 'none', border: 'none', color: styles.colors.danger, fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: styles.colors.white, borderRadius: '20px', border: `2px dashed ${styles.colors.border}` }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
                    <h3 style={{ margin: '0 0 8px 0', color: styles.colors.textDark }}>Nenhum registro</h3>
                    <p style={{ color: styles.colors.textMuted }}>Seu histórico médico está vazio.</p>
                </div>
            )}

            {/* Paginação */}
            {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '10px' }}>
                    <ActionButton variant="ghost" disabled={paginaAtual === 0} onClick={() => setPaginaAtual(p => p - 1)} styles={styles}>← Anterior</ActionButton>
                    <span style={{ display: 'flex', alignItems: 'center', color: styles.colors.textMuted, fontSize: '14px' }}>Página {paginaAtual + 1} de {totalPaginas}</span>
                    <ActionButton variant="ghost" disabled={paginaAtual + 1 >= totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} styles={styles}>Próxima →</ActionButton>
                </div>
            )}
        </div>
    );

    // =================================================================
    // RENDER: VIEW FORMULÁRIO
    // =================================================================
    const RenderFormulario = () => {
        const [formData, setFormData] = useState({
            nomeDoenca: '', descricao: '', dataDiagnostico: '', dataRecuperacao: '',
            estadoAtual: 'ATIVA', tratamento: '', medicamentos: '', observacoesMedicas: '', gravidade: 'LEVE'
        });

        useEffect(() => {
            if (itemEmEdicao) {
                setFormData({
                    ...itemEmEdicao,
                    dataDiagnostico: itemEmEdicao.dataDiagnostico?.split('T')[0] || '',
                    dataRecuperacao: itemEmEdicao.dataRecuperacao?.split('T')[0] || ''
                });
            }
        }, []);

        const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ marginBottom: '25px', borderBottom: `1px solid ${styles.colors.border}`, paddingBottom: '15px' }}>
                    <button onClick={() => setViewMode('lista')} style={{ background: 'none', border: 'none', color: styles.colors.textMuted, cursor: 'pointer', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ← Voltar para lista
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: styles.colors.textDark, margin: 0 }}>
                        {itemEmEdicao ? `Editar: ${itemEmEdicao.nomeDoenca}` : 'Novo Registro Médico'}
                    </h2>
                </div>

                <div style={{ backgroundColor: styles.colors.white, borderRadius: '24px', padding: isMobile ? '20px' : '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${styles.colors.borderLight}` }}>
                    
                    {/* Seção 1: O que houve? */}
                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: styles.colors.primary, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🏥 Informações da Condição
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '20px' }}>
                            <ModernInput label="Nome da Doença/Condição" name="nomeDoenca" value={formData.nomeDoenca} onChange={handleChange} required styles={styles} />
                            <ModernSelect label="Gravidade" name="gravidade" value={formData.gravidade} onChange={handleChange} styles={styles}
                                options={[{value:'LEVE', label:'Leve'}, {value:'MODERADA', label:'Moderada'}, {value:'GRAVE', label:'Grave'}, {value:'INVESTIGACAO', label:'Em Investigação'}]} />
                        </div>
                        <ModernInput label="Descrição Detalhada" name="descricao" value={formData.descricao} onChange={handleChange} rows={3} styles={styles} />
                    </div>

                    {/* Seção 2: Status e Datas */}
                    <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: styles.colors.lightGray, borderRadius: '16px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: styles.colors.textDark, marginBottom: '15px' }}>
                            📅 Cronologia e Status
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '20px' }}>
                            <ModernSelect label="Estado Atual" name="estadoAtual" value={formData.estadoAtual} onChange={handleChange} styles={styles}
                                options={[{value:'ATIVA', label:'Ativa'}, {value:'CURADA', label:'Curada'}, {value:'CRONICA', label:'Crônica'}, {value:'CONTROLADA', label:'Controlada'}]} />
                            <ModernInput label="Data Diagnóstico" name="dataDiagnostico" type="date" value={formData.dataDiagnostico} onChange={handleChange} required styles={styles} />
                            <ModernInput label="Data Recuperação" name="dataRecuperacao" type="date" value={formData.dataRecuperacao} onChange={handleChange} styles={styles} />
                        </div>
                    </div>

                    {/* Seção 3: Tratamento */}
                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: styles.colors.primary, marginBottom: '15px' }}>
                            💊 Protocolo de Tratamento
                        </h4>
                        <ModernInput label="Tratamento Prescrito" name="tratamento" value={formData.tratamento} onChange={handleChange} rows={2} placeholder="Ex: Fisioterapia, Repouso..." styles={styles} />
                        <ModernInput label="Medicamentos" name="medicamentos" value={formData.medicamentos} onChange={handleChange} rows={2} placeholder="Ex: Dipirona 500mg..." styles={styles} />
                        <ModernInput label="Observações Médicas" name="observacoesMedicas" value={formData.observacoesMedicas} onChange={handleChange} rows={2} styles={styles} />
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', paddingTop: '20px', borderTop: `1px solid ${styles.colors.borderLight}` }}>
                        <ActionButton variant="ghost" onClick={() => setViewMode('lista')} styles={styles}>Cancelar</ActionButton>
                        <ActionButton onClick={() => handleFormSubmit(formData)} loading={loading} styles={styles}>
                            {itemEmEdicao ? 'Salvar Alterações' : 'Criar Registro'}
                        </ActionButton>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {viewMode === 'lista' ? <RenderLista /> : <RenderFormulario />}
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default HistoricoDoencas;