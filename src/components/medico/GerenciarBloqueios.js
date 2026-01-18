import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// =================================================================
// 🎨 UI COMPONENTS (WELLNESS DESIGN SYSTEM)
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

// Botão Moderno
const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary', icon }) => {
    let bg = styles.colors.primary;
    let color = '#fff';
    
    if (variant === 'secondary') { bg = 'transparent'; color = styles.colors.textMuted; } // Ajustado para secondary ser mais discreto
    if (variant === 'danger') { bg = `${styles.colors.danger}15`; color = styles.colors.danger; }
    if (variant === 'success') { bg = styles.colors.success; color = '#fff'; }
    if (variant === 'info') { bg = styles.colors.info || '#3b82f6'; color = '#fff'; }

    return (
        <button 
            onClick={onClick} disabled={disabled || loading}
            style={{
                padding: '10px 20px', borderRadius: '12px', border: variant === 'secondary' ? `1px solid ${styles.colors.border}` : 'none',
                backgroundColor: disabled ? styles.colors.lightGray : bg,
                color: disabled ? styles.colors.textMuted : color,
                fontSize: '14px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
                boxShadow: (variant === 'primary' || variant === 'success' || variant === 'info') && !disabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            {loading && <span className="spinner" />}
            {!loading && icon}
            {children}
            <style>{`.spinner { width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; borderRadius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
    );
};

// Input/Select Moderno
const ModernField = ({ label, children, styles }) => (
    <div style={{ marginBottom: '15px', width: '100%' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, textTransform: 'uppercase' }}>{label}</label>
        {children}
    </div>
);

const ModernInput = ({ type = "text", value, onChange, placeholder, styles, min }) => (
    <input 
        type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
        style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${styles.colors.border}`,
            backgroundColor: styles.colors.white, color: styles.colors.textDark, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
            boxSizing: 'border-box' // Importante para layout
        }}
        onFocus={(e) => e.target.style.borderColor = styles.colors.primary}
        onBlur={(e) => e.target.style.borderColor = styles.colors.border}
    />
);

const ModernSelect = ({ value, onChange, options, styles, disabled }) => (
    <div style={{ position: 'relative' }}>
        <select 
            value={value} onChange={onChange} disabled={disabled}
            style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                border: `1px solid ${styles.colors.border}`, backgroundColor: disabled ? styles.colors.lightGray : styles.colors.white,
                color: disabled ? styles.colors.textMuted : styles.colors.textDark, fontSize: '14px', fontWeight: '500', outline: 'none', appearance: 'none', cursor: 'pointer'
            }}
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: styles.colors.textMuted }}>▼</div>
    </div>
);

// Badge de Tipo
const TypeBadge = ({ type, styles }) => {
    let bg = styles.colors.lightGray; let color = styles.colors.textMuted; let icon = '📅';
    
    if (type === 'DIA_INTEIRO') { bg = '#dbeafe'; color = '#1d4ed8'; icon = '☀️'; }
    if (type === 'PERIODO') { bg = '#fef3c7'; color = '#b45309'; icon = '⏱️'; }
    if (type === 'RECORRENCIA_SEMANAL') { bg = '#fce7f3'; color = '#be185d'; icon = '🔄'; }

    return (
        <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: bg, color: color, fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>{icon}</span> {type.replace('_', ' ')}
        </span>
    );
};

// =================================================================
// 🛑 COMPONENTE PRINCIPAL: GERENCIAR BLOQUEIOS
// =================================================================

const GerenciarBloqueios = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // States
    const [bloqueios, setBloqueios] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [loadingHorarios, setLoadingHorarios] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [agendaModalOpen, setAgendaModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [salvando, setSalvando] = useState(false);

    // Form
    const [form, setForm] = useState({
        tipoBloqueio: 'DIA_INTEIRO',
        dataInicio: '', dataFim: '',
        horaInicio: '08:00', horaFim: '17:00',
        diasDaSemana: [], motivo: '', recorrente: false, unidadeId: ''
    });

    const [unidadeFiltro, setUnidadeFiltro] = useState('');

    const diasSemana = [
        { value: 'MONDAY', label: 'Seg' }, { value: 'TUESDAY', label: 'Ter' },
        { value: 'WEDNESDAY', label: 'Qua' }, { value: 'THURSDAY', label: 'Qui' },
        { value: 'FRIDAY', label: 'Sex' }, { value: 'SATURDAY', label: 'Sáb' }, { value: 'SUNDAY', label: 'Dom' }
    ];

    // --- DATA FETCHING ---
    const fetchUnidades = useCallback(async () => {
        try {
            const res = await api.get('/funcionario/unidade'); // Ajustado para endpoint genérico se necessário
            setUnidades(res.data || []);
        } catch (e) { console.error(e); }
    }, []);

    const fetchBloqueios = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/medico/bloqueios');
            setBloqueios(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const fetchAgenda = async (idUnidade) => {
        if (!idUnidade) return;
        setLoadingHorarios(true);
        try {
            const res = await api.get(`/medico/bloqueios/unidade/${idUnidade}`);
            setHorariosDisponiveis(res.data || []);
            setAgendaModalOpen(true);
        } catch (e) { alert("Erro ao carregar agenda."); }
        finally { setLoadingHorarios(false); }
    };

    useEffect(() => {
        fetchBloqueios();
        fetchUnidades();
    }, [fetchBloqueios, fetchUnidades]);

    useEffect(() => {
        const hoje = new Date().toISOString().split('T')[0];
        setForm(prev => ({ ...prev, dataInicio: hoje, dataFim: hoje }));
    }, []);

    // --- HANDLERS ---
    const handleFormChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    
    const toggleDia = (dia) => {
        setForm(prev => ({
            ...prev,
            diasDaSemana: prev.diasDaSemana.includes(dia) 
                ? prev.diasDaSemana.filter(d => d !== dia)
                : [...prev.diasDaSemana, dia]
        }));
    };

    const abrirModal = (bloqueio = null) => {
        if (bloqueio) {
            setEditando(bloqueio);
            setForm({
                tipoBloqueio: bloqueio.tipoBloqueio,
                dataInicio: bloqueio.dataHoraInicio?.split('T')[0] || '',
                dataFim: bloqueio.dataHoraFim?.split('T')[0] || '',
                horaInicio: bloqueio.horaInicio || '08:00',
                horaFim: bloqueio.horaFim || '17:00',
                diasDaSemana: bloqueio.diasDaSemana || [],
                motivo: bloqueio.motivo || '',
                recorrente: false,
                unidadeId: bloqueio.unidadeId || ''
            });
        } else {
            setEditando(null);
            const hoje = new Date().toISOString().split('T')[0];
            setForm({
                tipoBloqueio: 'DIA_INTEIRO', dataInicio: hoje, dataFim: hoje,
                horaInicio: '08:00', horaFim: '17:00', diasDaSemana: [],
                motivo: '', recorrente: false, unidadeId: ''
            });
        }
        setModalOpen(true);
    };

    const salvar = async () => {
        if (!form.motivo) return alert("Informe o motivo.");
        if (form.tipoBloqueio === 'RECORRENCIA_SEMANAL' && !form.diasDaSemana.length) return alert("Selecione os dias.");
        
        setSalvando(true);
        try {
            const payload = {
                ...form,
                horaInicio: form.tipoBloqueio === 'DIA_INTEIRO' ? '00:00' : form.horaInicio,
                horaFim: form.tipoBloqueio === 'DIA_INTEIRO' ? '23:59' : form.horaFim,
                unidadeId: form.unidadeId ? parseInt(form.unidadeId) : null
            };
            
            if (editando) await api.put(`/medico/bloqueios/${editando.id}`, payload);
            else await api.post('/medico/bloqueios', payload);
            
            await fetchBloqueios();
            setModalOpen(false);
        } catch (e) { alert("Erro ao salvar."); }
        finally { setSalvando(false); }
    };

    const excluir = async (id) => {
        if (!window.confirm("Excluir este bloqueio?")) return;
        try {
            await api.delete(`/medico/bloqueios/${id}`);
            fetchBloqueios();
        } catch (e) { alert("Erro ao excluir."); }
    };

    // Helpers de Formatação
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-';
    const getUnidadeName = (id) => unidades.find(u => u.id === id)?.nome || 'Todas as Unidades';

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: colors.textDark, letterSpacing: '-0.5px' }}>
                            Gerenciar <span style={{ color: colors.primary }}>Bloqueios</span>
                        </h1>
                        <p style={{ margin: 0, color: colors.textMuted }}>Controle sua disponibilidade e ausências.</p>
                    </div>
                    <ActionButton onClick={() => abrirModal()} icon="➕" styles={styles}>Novo Bloqueio</ActionButton>
                </div>

                {/* Filtro / Visualização de Agenda */}
                <div style={{ backgroundColor: colors.white, padding: '24px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: `1px solid ${colors.borderLight}` }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <ModernField label="Ver Agenda por Unidade" styles={styles}>
                                <ModernSelect 
                                    value={unidadeFiltro} onChange={e => setUnidadeFiltro(e.target.value)}
                                    options={[{value: '', label: 'Selecione uma unidade...'}, ...unidades.map(u => ({value: u.id, label: u.nome}))]}
                                    styles={styles}
                                />
                            </ModernField>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <ActionButton variant="info" onClick={() => fetchAgenda(unidadeFiltro)} disabled={!unidadeFiltro} loading={loadingHorarios} styles={styles} icon="👁️">
                                Visualizar Horários
                            </ActionButton>
                        </div>
                    </div>
                </div>

                {/* Lista de Bloqueios */}
                {loading ? <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Carregando...</div> : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {bloqueios.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: colors.white, borderRadius: '20px', border: `2px dashed ${colors.border}` }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                                <p style={{ color: colors.textMuted }}>Nenhum bloqueio ativo.</p>
                            </div>
                        ) : bloqueios.map(b => (
                            <div key={b.id} style={{ 
                                backgroundColor: colors.white, padding: '20px', borderRadius: '16px',
                                border: `1px solid ${colors.borderLight}`, borderLeft: `4px solid ${b.ativo ? colors.success : colors.danger}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                                gap: '20px', alignItems: 'center'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <TypeBadge type={b.tipoBloqueio} styles={styles} />
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textDark }}>{b.motivo}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: colors.textMuted, display: 'grid', gap: '4px' }}>
                                        <div>📍 {getUnidadeName(b.unidadeId)}</div>
                                        {b.tipoBloqueio === 'RECORRENCIA_SEMANAL' ? (
                                            <div>🗓️ Toda {b.diasDaSemana.join(', ')} • {b.horaInicio.slice(0,5)} - {b.horaFim.slice(0,5)}</div>
                                        ) : (
                                            <div>🗓️ {formatDate(b.dataHoraInicio)} {b.tipoBloqueio === 'PERIODO' ? `até ${formatDate(b.dataHoraFim)}` : ''} • {b.tipoBloqueio === 'DIA_INTEIRO' ? 'Dia Todo' : `${b.horaInicio.slice(0,5)} - ${b.horaFim.slice(0,5)}`}</div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                                    <ActionButton variant="secondary" onClick={() => abrirModal(b)} styles={styles} icon="✏️">Editar</ActionButton>
                                    <ActionButton variant="danger" onClick={() => excluir(b.id)} styles={styles} icon="🗑️">Excluir</ActionButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL EDITAR/CRIAR */}
            {modalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ backgroundColor: colors.white, width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '800', color: colors.textDark }}>{editando ? 'Editar Bloqueio' : 'Novo Bloqueio'}</h3>
                        
                        <ModernField label="Motivo" styles={styles}>
                            <ModernInput value={form.motivo} onChange={e => handleFormChange('motivo', e.target.value)} placeholder="Ex: Férias, Congresso..." styles={styles} />
                        </ModernField>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <ModernField label="Tipo" styles={styles}>
                                <ModernSelect value={form.tipoBloqueio} onChange={e => handleFormChange('tipoBloqueio', e.target.value)} options={[{value: 'DIA_INTEIRO', label: 'Dia Inteiro'}, {value: 'PERIODO', label: 'Período (Horas)'}, {value: 'RECORRENCIA_SEMANAL', label: 'Semanal'}]} styles={styles} />
                            </ModernField>
                            <ModernField label="Unidade" styles={styles}>
                                <ModernSelect value={form.unidadeId} onChange={e => handleFormChange('unidadeId', e.target.value)} options={[{value: '', label: 'Todas'}, ...unidades.map(u => ({value: u.id, label: u.nome}))]} styles={styles} />
                            </ModernField>
                        </div>

                        {form.tipoBloqueio !== 'RECORRENCIA_SEMANAL' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <ModernField label="Data Início" styles={styles}>
                                    <ModernInput type="date" value={form.dataInicio} onChange={e => handleFormChange('dataInicio', e.target.value)} styles={styles} />
                                </ModernField>
                                {form.tipoBloqueio === 'PERIODO' && ( // Se for período de dias, precisa data fim
                                     <ModernField label="Data Fim" styles={styles}>
                                        <ModernInput type="date" value={form.dataFim} onChange={e => handleFormChange('dataFim', e.target.value)} min={form.dataInicio} styles={styles} />
                                    </ModernField>
                                )}
                            </div>
                        )}

                        {form.tipoBloqueio !== 'DIA_INTEIRO' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <ModernField label="Hora Início" styles={styles}>
                                    <ModernInput type="time" value={form.horaInicio} onChange={e => handleFormChange('horaInicio', e.target.value)} styles={styles} />
                                </ModernField>
                                <ModernField label="Hora Fim" styles={styles}>
                                    <ModernInput type="time" value={form.horaFim} onChange={e => handleFormChange('horaFim', e.target.value)} min={form.horaInicio} styles={styles} />
                                </ModernField>
                            </div>
                        )}

                        {form.tipoBloqueio === 'RECORRENCIA_SEMANAL' && (
                            <ModernField label="Dias da Semana" styles={styles}>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {diasSemana.map(dia => (
                                        <button key={dia.value} onClick={() => toggleDia(dia.value)}
                                            style={{
                                                padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                                                backgroundColor: form.diasDaSemana.includes(dia.value) ? colors.primary : colors.lightGray,
                                                color: form.diasDaSemana.includes(dia.value) ? '#fff' : colors.textDark
                                            }}
                                        >
                                            {dia.label}
                                        </button>
                                    ))}
                                </div>
                            </ModernField>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <ActionButton variant="secondary" onClick={() => setModalOpen(false)} styles={styles}>Cancelar</ActionButton>
                            <ActionButton onClick={salvar} loading={salvando} styles={styles}>Salvar Bloqueio</ActionButton>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL AGENDA */}
            {agendaModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ backgroundColor: colors.white, width: '100%', maxWidth: '800px', borderRadius: '24px', padding: '30px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.textDark }}>Agenda Disponível</h3>
                            <button onClick={() => setAgendaModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '15px' }}>
                            {horariosDisponiveis.length > 0 ? horariosDisponiveis.map((dia, idx) => (
                                <div key={idx} style={{ padding: '15px', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.background }}>
                                    <div style={{ fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>{new Date(dia.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {dia.horarios.map((h, i) => (
                                            <span key={i} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: colors.white, border: `1px solid ${colors.borderLight}` }}>
                                                {h.slice(0, 5)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )) : <p style={{ color: colors.textMuted }}>Nenhum horário disponível.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciarBloqueios;