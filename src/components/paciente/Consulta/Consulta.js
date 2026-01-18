import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiList, FiClock, FiMapPin, FiUser, FiVideo, FiCheckCircle, FiAlertCircle, FiExternalLink, FiDollarSign } from 'react-icons/fi';

import api from '../../../api/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';

// =================================================================
// 🎨 UI COMPONENTS (DESIGN SYSTEM WELLNESS)
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

// Botão de Ação
const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary', fullWidth, icon }) => {
    let bgColor = styles.colors.primary;
    let color = styles.colors.white;
    let border = 'none';

    if (variant === 'secondary') { bgColor = 'transparent'; color = styles.colors.primary; border = `1px solid ${styles.colors.primary}`; }
    if (variant === 'danger') { bgColor = `${styles.colors.danger}15`; color = styles.colors.danger; }
    if (variant === 'success') { bgColor = styles.colors.success; color = styles.colors.white; }
    // Estilo especial para o botão de Telemedicina
    if (variant === 'video') { bgColor = '#7c3aed'; color = '#fff'; } 
    
    if (disabled) { bgColor = styles.colors.lightGray; color = styles.colors.textMuted; border = 'none'; }

    return (
        <button 
            onClick={onClick} disabled={disabled || loading}
            style={{
                width: fullWidth ? '100%' : 'auto',
                padding: '12px 24px', borderRadius: '14px', border: border,
                backgroundColor: bgColor, color: color,
                fontSize: '14px', fontWeight: '600', cursor: disabled || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: (variant === 'primary' || variant === 'success' || variant === 'video') && !disabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            {loading && <span className="spinner"></span>}
            {!loading && icon}
            {children}
        </button>
    );
};

// Card de Seleção
const SelectionCard = ({ selected, onClick, title, subtitle, icon, styles, image }) => (
    <div 
        onClick={onClick}
        style={{
            border: `2px solid ${selected ? styles.colors.primary : 'transparent'}`,
            backgroundColor: selected ? `${styles.colors.primary}08` : styles.colors.white,
            borderRadius: '16px', padding: '20px', cursor: 'pointer',
            transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}
    >
        {image ? (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', marginBottom: '8px', border: `2px solid ${styles.colors.borderLight}` }}>
                <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        ) : (
            <div style={{ fontSize: '28px', color: selected ? styles.colors.primary : styles.colors.textMuted }}>{icon}</div>
        )}
        
        <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: styles.colors.textDark }}>{title}</h4>
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: '12px', color: styles.colors.textMuted }}>{subtitle}</p>}
        </div>
        
        {selected && <div style={{ position: 'absolute', top: '10px', right: '10px', color: styles.colors.primary }}>✔</div>}
    </div>
);

// Input Select Moderno
const ModernSelect = ({ label, value, onChange, options, styles, disabled, placeholder }) => (
    <div style={{ width: '100%', marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, textTransform: 'uppercase' }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <select 
                value={value} onChange={onChange} disabled={disabled}
                style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white,
                    color: styles.colors.textDark, fontSize: '14px', fontWeight: '500', outline: 'none', appearance: 'none'
                }}
            >
                <option value="">{placeholder || "Selecione..."}</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: styles.colors.textMuted }}>▼</div>
        </div>
    </div>
);

// Badge de Status
const StatusBadge = ({ status, styles }) => {
    let bg = styles.colors.lightGray; let color = styles.colors.textMuted;
    if (['CONFIRMADA', 'REALIZADA'].includes(status)) { bg = `${styles.colors.success}20`; color = styles.colors.success; }
    if (['AGENDADA'].includes(status)) { bg = `${styles.colors.accent}20`; color = styles.colors.accent; }
    if (['CANCELADA'].includes(status)) { bg = `${styles.colors.danger}20`; color = styles.colors.danger; }

    return (
        <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
            {status}
        </span>
    );
};

// Badge de Tipo de Consulta
const TipoConsultaBadge = ({ tipo, styles }) => {
    const isOnline = tipo === 'ONLINE';
    return (
        <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            fontSize: '12px', fontWeight: '600', 
            color: isOnline ? '#7c3aed' : styles.colors.textDark,
            backgroundColor: isOnline ? '#f3e8ff' : styles.colors.lightGray,
            padding: '4px 10px', borderRadius: '8px'
        }}>
            {isOnline ? <FiVideo /> : <FiMapPin />}
            {tipo}
        </div>
    );
};

// =================================================================
// 📅 SUB-COMPONENTE: AGENDAMENTO (WIZARD)
// =================================================================
const AgendamentoWizard = ({ styles, isMobile, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState({ initial: false, specialities: false, doctors: false, agenda: false, submit: false });
    
    // Data
    const [unidades, setUnidades] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [agenda, setAgenda] = useState([]);

    // Selection State
    const [form, setForm] = useState({
        unidadeId: '',
        especialidadeId: '',
        tipoConsulta: '', // PRESENCIAL | ONLINE
        medico: null,
        data: null,
        horario: null
    });

    const [error, setError] = useState(null);

    // 1. Load Unidades
    useEffect(() => {
        const loadUnidades = async () => {
            setLoading(p => ({ ...p, initial: true }));
            try {
                const res = await api.get("/unidade/todas");
                setUnidades(res.data.content || res.data || []);
            } catch (e) { setError("Erro ao carregar unidades."); }
            finally { setLoading(p => ({ ...p, initial: false })); }
        };
        loadUnidades();
    }, []);

    // 2. Load Especialidades when Unidade changes
    useEffect(() => {
        if (!form.unidadeId) return;
        const loadSpec = async () => {
            setLoading(p => ({ ...p, specialities: true }));
            setEspecialidades([]);
            try {
                const res = await api.get(`/publico/especialidade/${form.unidadeId}`);
                setEspecialidades(res.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(p => ({ ...p, specialities: false })); }
        };
        loadSpec();
    }, [form.unidadeId]);

    // 3. Load Doctors when Step 3 activates
    useEffect(() => {
        if (step === 3 && form.especialidadeId) {
            const loadDocs = async () => {
                setLoading(p => ({ ...p, doctors: true }));
                try {
                    const res = await api.get(`/paciente/medico/all/especialidade/${form.especialidadeId}`);
                    setMedicos(res.data?.body?.content || res.data?.content || []);
                } catch (e) { setError("Erro ao buscar médicos."); }
                finally { setLoading(p => ({ ...p, doctors: false })); }
            };
            loadDocs();
        }
    }, [step, form.especialidadeId]);

    // 4. Load Agenda when Doctor is selected
    useEffect(() => {
        if (step === 4 && form.medico) {
            const loadAgenda = async () => {
                setLoading(p => ({ ...p, agenda: true }));
                try {
                    const params = new URLSearchParams({
                        idUnidade: form.unidadeId,
                        idMedico: form.medico.id,
                        tipo: form.tipoConsulta,
                        periodoEmDias: 45
                    });
                    const res = await api.get(`/agenda/medico/datas-horarios-disponiveis?${params}`);
                    setAgenda(res.data || []);
                } catch (e) { setError("Erro ao carregar agenda."); }
                finally { setLoading(p => ({ ...p, agenda: false })); }
            };
            loadAgenda();
        }
    }, [step, form.medico, form.unidadeId, form.tipoConsulta]);

    const handleSubmit = async () => {
        setLoading(p => ({ ...p, submit: true }));
        try {
            const dataISO = form.data.toISOString().split('T')[0];
            await api.post("/consulta/agendar", {
                medicoId: form.medico.id,
                unidadeId: form.unidadeId,
                horario: `${dataISO}T${form.horario}`,
                tipo: form.tipoConsulta
            });
            onSuccess();
        } catch (e) {
            setError(e.response?.data?.message || "Erro ao agendar consulta.");
            setLoading(p => ({ ...p, submit: false }));
        }
    };

    // Helpers
    const getInitials = (n) => n ? n.split(' ').map(c => c[0]).join('').substring(0, 2).toUpperCase() : 'MD';
    const datesAvailable = agenda.map(item => {
        const [y, m, d] = item.data.split('-');
        return new Date(y, m - 1, d);
    });
    const hoursAvailable = form.data 
        ? (agenda.find(i => i.data === form.data.toISOString().split('T')[0])?.horarios || []) 
        : [];

    // --- RENDER STEPS ---
    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Stepper Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '2px', backgroundColor: styles.colors.borderLight, zIndex: 0 }} />
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ 
                            width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', borderRadius: '50%', 
                            backgroundColor: step >= s ? styles.colors.primary : styles.colors.lightGray,
                            color: step >= s ? styles.colors.white : styles.colors.textMuted,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}>
                            {step > s ? '✓' : s}
                        </div>
                        {!isMobile && <span style={{ fontSize: '10px', color: step >= s ? styles.colors.textDark : styles.colors.textMuted }}>
                            {['Local', 'Tipo', 'Médico', 'Data', 'Fim'][s-1]}
                        </span>}
                    </div>
                ))}
            </div>

            {error && <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: `${styles.colors.danger}15`, color: styles.colors.danger, borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}><FiAlertCircle /> {error}</div>}

            <div style={{ minHeight: '300px' }}>
                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: styles.colors.textDark }}>Onde e o que você precisa?</h3>
                        <ModernSelect 
                            label="Unidade" placeholder="Selecione a unidade"
                            value={form.unidadeId} 
                            onChange={e => setForm({ ...form, unidadeId: e.target.value, especialidadeId: '' })}
                            options={unidades.map(u => ({ value: u.id, label: u.nome }))}
                            styles={styles} 
                        />
                        <ModernSelect 
                            label="Especialidade" placeholder="Selecione a especialidade"
                            value={form.especialidadeId}
                            onChange={e => setForm({ ...form, especialidadeId: e.target.value })}
                            options={especialidades.map(e => ({ value: e.id, label: e.nome }))}
                            styles={styles}
                            disabled={!form.unidadeId || loading.specialities}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: styles.colors.textDark }}>Como será o atendimento?</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <SelectionCard 
                                title="Presencial" subtitle="Ir até a unidade" icon={<FiMapPin />}
                                selected={form.tipoConsulta === 'PRESENCIAL'}
                                onClick={() => setForm({ ...form, tipoConsulta: 'PRESENCIAL' })}
                                styles={styles}
                            />
                            <SelectionCard 
                                title="Online" subtitle="Videoconferência" icon={<FiVideo />}
                                selected={form.tipoConsulta === 'ONLINE'}
                                onClick={() => setForm({ ...form, tipoConsulta: 'ONLINE' })}
                                styles={styles}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: styles.colors.textDark }}>Escolha o especialista</h3>
                        {loading.doctors ? <p style={{color: styles.colors.textMuted, textAlign: 'center'}}>Buscando médicos...</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                {medicos.map(doc => {
                                    const nome = doc.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome;
                                    const foto = doc.fotoPerfilUrl || doc.dataDetalhesFuncionario?.dataDetalhesPessoa?.fotoPerfilUrl;
                                    const valor = form.tipoConsulta === 'PRESENCIAL' ? doc.valorConsultaPresencial : doc.valorConsultaOnline;
                                    return (
                                        <SelectionCard 
                                            key={doc.id}
                                            title={nome}
                                            subtitle={`CRM: ${doc.crm} • R$ ${valor?.toFixed(2)}`}
                                            image={foto || `https://ui-avatars.com/api/?name=${getInitials(nome)}&background=random&color=fff`}
                                            selected={form.medico?.id === doc.id}
                                            onClick={() => setForm({ ...form, medico: doc })}
                                            styles={styles}
                                        />
                                    );
                                })}
                                {medicos.length === 0 && <p style={{color: styles.colors.textMuted}}>Nenhum médico encontrado.</p>}
                            </div>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, marginBottom: '10px' }}>DATA</label>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <DatePicker 
                                    selected={form.data} onChange={d => setForm({ ...form, data: d, horario: null })}
                                    includeDates={datesAvailable} inline
                                    calendarClassName={isMobile ? "react-datepicker-mobile" : ""}
                                />
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, marginBottom: '10px' }}>HORÁRIOS</label>
                            {form.data ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                    {hoursAvailable.map(h => (
                                        <button key={h} onClick={() => setForm({ ...form, horario: h })}
                                            style={{
                                                padding: '8px', borderRadius: '8px', 
                                                border: `1px solid ${form.horario === h ? styles.colors.primary : styles.colors.borderLight}`,
                                                backgroundColor: form.horario === h ? styles.colors.primary : styles.colors.white,
                                                color: form.horario === h ? styles.colors.white : styles.colors.textDark,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {h.substring(0, 5)}
                                        </button>
                                    ))}
                                    {hoursAvailable.length === 0 && <p style={{ fontSize: '13px', color: styles.colors.textMuted }}>Sem horários livres.</p>}
                                </div>
                            ) : <p style={{ fontSize: '13px', color: styles.colors.textMuted }}>Selecione uma data primeiro.</p>}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div style={{ animation: 'fadeIn 0.3s ease', backgroundColor: styles.colors.white, borderRadius: '16px', padding: '24px', border: `1px solid ${styles.colors.borderLight}` }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: styles.colors.textDark }}>Confirmação do Agendamento</h3>
                        
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
                            <img 
                                src={form.medico?.fotoPerfilUrl || form.medico?.dataDetalhesFuncionario?.dataDetalhesPessoa?.fotoPerfilUrl || `https://ui-avatars.com/api/?name=${getInitials(form.medico?.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome)}`} 
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                                alt="Médico"
                            />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '18px', color: styles.colors.primary }}>{form.medico?.dataDetalhesFuncionario?.dataDetalhesPessoa?.nome}</h4>
                                <p style={{ margin: '4px 0', color: styles.colors.textMuted }}>CRM: {form.medico?.crm}</p>
                                <p style={{ margin: 0, fontWeight: 'bold', color: styles.colors.success }}>
                                    R$ {(form.tipoConsulta === 'PRESENCIAL' ? form.medico?.valorConsultaPresencial : form.medico?.valorConsultaOnline)?.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', backgroundColor: styles.colors.lightGray, padding: '15px', borderRadius: '12px' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: styles.colors.textMuted }}>DATA E HORA</span>
                                <div style={{ fontSize: '14px', color: styles.colors.textDark, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FiCalendar /> {form.data?.toLocaleDateString()} às {form.horario?.substring(0,5)}
                                </div>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: styles.colors.textMuted }}>MODALIDADE</span>
                                <div style={{ fontSize: '14px', color: styles.colors.textDark, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {form.tipoConsulta === 'PRESENCIAL' ? <FiMapPin /> : <FiVideo />} {form.tipoConsulta}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between' }}>
                <ActionButton variant="secondary" onClick={() => setStep(s => s - 1)} disabled={step === 1} styles={styles}>Voltar</ActionButton>
                
                {step < 5 ? (
                    <ActionButton 
                        onClick={() => setStep(s => s + 1)} styles={styles}
                        disabled={
                            (step === 1 && (!form.unidadeId || !form.especialidadeId)) ||
                            (step === 2 && !form.tipoConsulta) ||
                            (step === 3 && !form.medico) ||
                            (step === 4 && (!form.data || !form.horario))
                        }
                    >
                        Próximo
                    </ActionButton>
                ) : (
                    <ActionButton variant="success" onClick={handleSubmit} loading={loading.submit} styles={styles} icon={<FiCheckCircle />}>
                        Confirmar Agendamento
                    </ActionButton>
                )}
            </div>
        </div>
    );
};

// =================================================================
// 📋 SUB-COMPONENTE: LISTA DE CONSULTAS (ATUALIZADO)
// =================================================================
const ListaConsultas = ({ styles, isMobile }) => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('TODAS');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchConsultas = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/consulta/${statusFilter}`, { params: { page, size: 5 } });
            setConsultas(res.data.content || []);
            setTotalPages(res.data.totalPages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [statusFilter, page]);

    useEffect(() => { fetchConsultas(); }, [fetchConsultas]);

    const cancelarConsulta = async (id) => {
        if (!window.confirm("Deseja cancelar?")) return;
        try {
            await api.delete(`/consulta/cancelar/${id}`);
            fetchConsultas();
        } catch (e) { alert("Erro ao cancelar."); }
    };

    const handleAcessarTelemedicina = (link) => {
        if(link) window.open(link, '_blank');
        else alert("Link da sala ainda não disponível. Tente novamente próximo ao horário.");
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: styles.colors.textDark, margin: 0 }}>Histórico de Consultas</h2>
                <div style={{ width: isMobile ? '100%' : '200px' }}>
                    <ModernSelect 
                        label="" placeholder="Filtrar Status"
                        value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                        options={['TODAS', 'AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA'].map(s => ({ value: s, label: s }))}
                        styles={styles}
                    />
                </div>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '40px', color: styles.colors.textMuted }}>Carregando...</div> : (
                consultas.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {consultas.map(consulta => {
                            const medico = consulta.dataDetalhesMedico;
                            const pessoaMedico = medico.dataDetalhesPessoa;
                            const foto = medico.fotoPerfilUrl || pessoaMedico.fotoPerfilUrl;
                            const data = new Date(consulta.data);
                            
                            // 🔍 Lógica para exibir link da telemedicina
                            const isOnline = consulta.tipoConsulta === 'ONLINE';
                            const linkDisponivel = consulta.linkTelemedicina;
                            const statusPermiteEntrar = ['AGENDADA', 'CONFIRMADA', 'REALIZADA'].includes(consulta.statusConsula);
                            const mostrarBotaoEntrar = isOnline && linkDisponivel && statusPermiteEntrar;

                            // 💰 Lógica para formatar valor
                            const valorFormatado = consulta.valorConsulta 
                                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(consulta.valorConsulta)
                                : 'Valor n/d';

                            return (
                                <div key={consulta.id} style={{ 
                                    backgroundColor: styles.colors.white, borderRadius: '16px', padding: '20px',
                                    border: `1px solid ${styles.colors.borderLight}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                    display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', alignItems: 'center'
                                }}>
                                    {/* Data Box */}
                                    <div style={{ 
                                        display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', justifyContent: 'center',
                                        minWidth: '80px', padding: '10px', backgroundColor: `${styles.colors.primary}10`, borderRadius: '12px',
                                        color: styles.colors.primary, fontWeight: 'bold', gap: isMobile ? '10px' : '0'
                                    }}>
                                        <span style={{ fontSize: '24px' }}>{data.getDate()}</span>
                                        <span style={{ fontSize: '14px', textTransform: 'uppercase' }}>{data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                        {isMobile && <span>| {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
                                    </div>

                                    {/* Info Central */}
                                    <div style={{ flex: 1, width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <img src={foto || `https://ui-avatars.com/api/?name=${pessoaMedico?.nome?.charAt(0)}`} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Doc" />
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '16px', color: styles.colors.textDark }}>{pessoaMedico?.nome}</h4>
                                                    <p style={{ margin: 0, fontSize: '12px', color: styles.colors.textMuted }}>{medico.especialidadesMedica[0]?.nome}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={consulta.statusConsula} styles={styles} />
                                        </div>
                                        
                                        <div style={{ fontSize: '13px', color: styles.colors.textDark, display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: styles.colors.textMuted }}>
                                                <FiClock /> {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            
                                            {/* Badge Tipo Consulta */}
                                            <TipoConsultaBadge tipo={consulta.tipoConsulta} styles={styles} />

                                            {/* Valor da Consulta */}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: styles.colors.success, backgroundColor: `${styles.colors.success}10`, padding: '4px 8px', borderRadius: '8px' }}>
                                                <FiDollarSign size={14} /> {valorFormatado}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: isMobile ? '100%' : '160px' }}>
                                        {/* Botão Acessar Sala (Online) */}
                                        {mostrarBotaoEntrar && (
                                            <ActionButton variant="video" fullWidth={true} onClick={() => handleAcessarTelemedicina(consulta.linkTelemedicina)} styles={styles} icon={<FiExternalLink />}>
                                                Acessar Consultório
                                            </ActionButton>
                                        )}
                                        
                                        {/* Botão Cancelar */}
                                        {consulta.statusConsula === 'AGENDADA' && (
                                            <ActionButton variant="danger" fullWidth={true} onClick={() => cancelarConsulta(consulta.id)} styles={styles}>
                                                Cancelar Consulta
                                            </ActionButton>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: styles.colors.white, borderRadius: '20px', border: `2px dashed ${styles.colors.border}` }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                        <p style={{ color: styles.colors.textMuted }}>Nenhuma consulta encontrada.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                    <ActionButton variant="secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)} styles={styles}>Anterior</ActionButton>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: styles.colors.textMuted }}>{page + 1} / {totalPages}</span>
                    <ActionButton variant="secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} styles={styles}>Próxima</ActionButton>
                </div>
            )}
        </div>
    );
};

// =================================================================
// 🏠 COMPONENTE PRINCIPAL (CONTAINER)
// =================================================================
const Consultas = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [view, setView] = useState('agendar');
    const [successMsg, setSuccessMsg] = useState(false);

    const handleSuccess = () => {
        setSuccessMsg(true);
        setTimeout(() => {
            setSuccessMsg(false);
            setView('listar');
        }, 2500);
    };

    if (successMsg) {
        return (
            <div style={{ padding: '40px', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: styles.colors.background }}>
                <div style={{ textAlign: 'center', backgroundColor: styles.colors.white, padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
                    <h2 style={{ color: styles.colors.primary, marginBottom: '10px' }}>Sucesso!</h2>
                    <p style={{ color: styles.colors.textMuted }}>Sua consulta foi agendada.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Header & Tabs */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '30px', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                            Minhas <span style={{ color: styles.colors.primary }}>Consultas</span>
                        </h1>
                        <p style={{ margin: 0, color: styles.colors.textMuted }}>Agende com especialistas ou gerencie seus horários.</p>
                    </div>

                    <div style={{ backgroundColor: styles.colors.lightGray, padding: '4px', borderRadius: '14px', display: 'flex', border: `1px solid ${styles.colors.border}` }}>
                        <button 
                            onClick={() => setView('agendar')}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', border: 'none',
                                backgroundColor: view === 'agendar' ? styles.colors.white : 'transparent',
                                color: view === 'agendar' ? styles.colors.primary : styles.colors.textMuted,
                                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                boxShadow: view === 'agendar' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <FiCalendar /> Agendar
                        </button>
                        <button 
                            onClick={() => setView('listar')}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', border: 'none',
                                backgroundColor: view === 'listar' ? styles.colors.white : 'transparent',
                                color: view === 'listar' ? styles.colors.primary : styles.colors.textMuted,
                                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                boxShadow: view === 'listar' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <FiList /> Histórico
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ 
                    backgroundColor: view === 'listar' ? 'transparent' : styles.colors.white, 
                    borderRadius: '24px', 
                    padding: view === 'listar' ? '0' : (isMobile ? '20px' : '30px'),
                    boxShadow: view === 'listar' ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
                    border: view === 'listar' ? 'none' : `1px solid ${styles.colors.borderLight}`
                }}>
                    {view === 'agendar' ? (
                        <AgendamentoWizard styles={styles} isMobile={isMobile} onSuccess={handleSuccess} />
                    ) : (
                        <ListaConsultas styles={styles} isMobile={isMobile} />
                    )}
                </div>

                <style>{`
                    .react-datepicker-mobile { width: 100% !important; font-size: 14px !important; }
                    .react-datepicker-mobile .react-datepicker__month-container { width: 100% !important; }
                    .react-datepicker-mobile .react-datepicker__day-name, .react-datepicker-mobile .react-datepicker__day { width: 2rem !important; line-height: 2rem !important; margin: 0.166rem !important; }
                    .spinner { width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        </div>
    );
};

export default Consultas;