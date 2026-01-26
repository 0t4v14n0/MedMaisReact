import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
    FiArrowLeft, FiSave, FiCalendar, FiFileText, FiUser, FiHeart, 
    FiAlertCircle, FiActivity, FiClipboard, FiCreditCard, FiPlus, 
    FiPhone, FiX, FiSearch, FiCheck, FiClock, FiTrash2, FiEdit2 
} from 'react-icons/fi';

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

// Card de Métricas Vitais
const VitalCard = ({ icon, label, value, color, styles }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', borderRadius: '16px',
        backgroundColor: `${color}10`, border: `1px solid ${color}20`,
        minWidth: '140px'
    }}>
        <div style={{ 
            width: '32px', height: '32px', borderRadius: '50%', 
            backgroundColor: color, color: '#fff', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '16px' 
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: styles.colors.textMuted }}>{label}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: styles.colors.textDark }}>{value || '-'}</div>
        </div>
    </div>
);

// Botão Moderno
const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary', icon }) => {
    let bg = styles.colors.primary;
    let color = '#fff';
    
    if (variant === 'secondary') { bg = 'transparent'; color = styles.colors.textDark; }
    if (variant === 'danger') { bg = `${styles.colors.danger}15`; color = styles.colors.danger; }
    if (variant === 'success') { bg = styles.colors.success; color = '#fff'; }
    if (variant === 'outline') { bg = 'transparent'; color = styles.colors.primary; }

    return (
        <button 
            onClick={onClick} disabled={disabled || loading}
            style={{
                padding: '10px 20px', borderRadius: '12px', border: variant === 'outline' ? `1px solid ${styles.colors.primary}` : 'none',
                backgroundColor: disabled ? styles.colors.lightGray : bg,
                color: disabled ? styles.colors.textMuted : color,
                fontSize: '14px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                boxShadow: (variant === 'primary' || variant === 'success') && !disabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            {loading && <span className="spinner" />}
            {!loading && icon}
            {children}
            <style>{`.spinner { width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; borderRadius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
    );
};

// Input/Textarea Moderno
const ModernInput = ({ label, name, value, onChange, type = "text", rows, placeholder, styles }) => (
    <div style={{ width: '100%', marginBottom: '15px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, textTransform: 'uppercase' }}>{label}</label>}
        {rows ? (
            <textarea 
                name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
                style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${styles.colors.border}`,
                    backgroundColor: styles.colors.white, color: styles.colors.textDark, fontSize: '14px', fontFamily: 'inherit', resize: 'vertical',
                    outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = styles.colors.primary}
                onBlur={(e) => e.target.style.borderColor = styles.colors.border}
            />
        ) : (
            <input 
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${styles.colors.border}`,
                    backgroundColor: styles.colors.white, color: styles.colors.textDark, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = styles.colors.primary}
                onBlur={(e) => e.target.style.borderColor = styles.colors.border}
            />
        )}
    </div>
);

// Card SOAP
const SoapCard = ({ letter, title, color, children, styles }) => (
    <div style={{
        backgroundColor: styles.colors.white, borderRadius: '16px', padding: '20px', marginBottom: '20px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', borderLeft: `4px solid ${color}`, border: `1px solid ${styles.colors.borderLight}`
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                {letter}
            </div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: styles.colors.textDark }}>{title}</h4>
        </div>
        {children}
    </div>
);

// =================================================================
// 🩺 MODAIS REBRANDED
// =================================================================

const ModalBase = ({ title, onClose, children, styles, width = '600px' }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
    }}>
        <div style={{
            backgroundColor: styles.colors.white, borderRadius: '24px', width: '100%', maxWidth: width,
            maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: styles.colors.textDark }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted }}><FiX size={24} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
            <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    </div>
);

// 1. Modal Solicitar Exames
const ModalSolicitarExame = ({ consulta, onCancel, styles, mostrarToast }) => {
    const [exames, setExames] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [justificativa, setJustificativa] = useState('');
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/exame/all/ativo').then(res => {
            setExames(res.data || []);
            setLoading(false);
        }).catch(() => { mostrarToast("Erro ao carregar exames.", "error"); setLoading(false); });
    }, []);

    const handleSolicitar = async () => {
        if (!selecionados.length) return mostrarToast("Selecione um exame.", "error");
        try {
            await api.post('medico/solicitar/exame', {
                idPaciente: consulta.dataDetalhesPaciente.dataDetalhesPessoa.id,
                justificativa,
                examesIds: selecionados
            });
            mostrarToast("Exames solicitados com sucesso!");
            onCancel();
        } catch (e) { mostrarToast("Erro na solicitação.", "error"); }
    };

    const filtered = exames.filter(e => e.nome.toLowerCase().includes(busca.toLowerCase()));

    return (
        <ModalBase title="Solicitar Exames" onClose={onCancel} styles={styles}>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '14px', top: '14px', color: styles.colors.textMuted }} />
                <input 
                    type="text" placeholder="Buscar exame..." value={busca} onChange={e => setBusca(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: `1px solid ${styles.colors.border}`, outline: 'none' }}
                />
            </div>
            <div style={{ height: '250px', overflowY: 'auto', border: `1px solid ${styles.colors.borderLight}`, borderRadius: '12px', marginBottom: '20px' }}>
                {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p> : filtered.map(exame => (
                    <div key={exame.id} onClick={() => setSelecionados(prev => prev.includes(exame.id) ? prev.filter(i => i !== exame.id) : [...prev, exame.id])}
                        style={{
                            padding: '12px 16px', borderBottom: `1px solid ${styles.colors.borderLight}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                            backgroundColor: selecionados.includes(exame.id) ? `${styles.colors.primary}10` : 'transparent'
                        }}
                    >
                        <span style={{ fontSize: '14px', fontWeight: '500', color: styles.colors.textDark }}>{exame.nome}</span>
                        {selecionados.includes(exame.id) && <FiCheck color={styles.colors.primary} />}
                    </div>
                ))}
            </div>
            <ModernInput label="Justificativa Clínica" rows={3} value={justificativa} onChange={e => setJustificativa(e.target.value)} placeholder="Motivo da solicitação..." styles={styles} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <ActionButton variant="secondary" onClick={onCancel} styles={styles}>Cancelar</ActionButton>
                <ActionButton variant="success" onClick={handleSolicitar} styles={styles}>Solicitar ({selecionados.length})</ActionButton>
            </div>
        </ModalBase>
    );
};

// 2. Modal Histórico
const ModalHistoricoPaciente = ({ doenca, onSave, onCancel, styles }) => {
    const [form, setForm] = useState(doenca || { nomeDoenca: '', dataDiagnostico: '', estadoAtual: 'ATIVA', gravidade: 'LEVE', descricao: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <ModalBase title={doenca ? "Editar Histórico" : "Adicionar ao Histórico"} onClose={onCancel} styles={styles}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                    <ModernInput label="Doença / Condição" value={form.nomeDoenca} onChange={e => setForm({...form, nomeDoenca: e.target.value})} styles={styles} />
                    <ModernInput label="Data Diagnóstico" type="date" value={form.dataDiagnostico?.split('T')[0]} onChange={e => setForm({...form, dataDiagnostico: e.target.value})} styles={styles} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, marginBottom: '8px' }}>ESTADO ATUAL</label>
                        <select 
                            value={form.estadoAtual} onChange={e => setForm({...form, estadoAtual: e.target.value})}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white }}
                        >
                            {['ATIVA', 'CURADA', 'CRONICA', 'CONTROLADA'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, marginBottom: '8px' }}>GRAVIDADE</label>
                        <select 
                            value={form.gravidade} onChange={e => setForm({...form, gravidade: e.target.value})}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white }}
                        >
                            {['LEVE', 'MODERADA', 'GRAVE', 'INVESTIGACAO'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
                <ModernInput label="Observações / Tratamento" rows={4} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} styles={styles} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <ActionButton variant="secondary" onClick={onCancel} styles={styles}>Cancelar</ActionButton>
                    <ActionButton variant="success" onClick={handleSubmit} styles={styles}>Salvar Registro</ActionButton>
                </div>
            </form>
        </ModalBase>
    );
};

// 3. Modal Agendar Retorno (Blindado)
const ModalAgendarRetorno = ({ consulta, onCancel, styles, mostrarToast }) => {
    const [unidades, setUnidades] = useState([]);
    const [form, setForm] = useState({ unidadeId: '', data: null, horario: '' });
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Segurança: Pega o ID com Optional Chaining (?.) para não quebrar se consulta vier vazia
    const medicoId = consulta?.dataDetalhesMedico?.dataDetalhesPessoa?.id;    

    useEffect(() => {
        api.get('/unidade/todas')
           .then(res => setUnidades(res.data.content || res.data || []))
           .catch(() => mostrarToast("Erro ao carregar unidades", "error"));
    }, []);
        useEffect(() => {
                
                // Verificação explícita
                if (!form.unidadeId) console.warn(">>> BLOQUEADO: Unidade não selecionada");
                if (!medicoId) console.warn(">>> BLOQUEADO: ID do Médico é inválido/nulo");

                if(form.unidadeId && medicoId) {
                    console.log("3. DADOS OK. MONTANDO REQUISIÇÃO...");
                    
                    setLoading(true);
                    setAgenda([]); 
                    
                    const params = new URLSearchParams({ 
                        idUnidade: form.unidadeId, 
                        idMedico: medicoId.toString(), 
                        periodoEmDias: 45,
                        tipo: 'RETORNO' // OBRIGATÓRIO
                    });

                    const urlCompleta = `/agenda/medico/datas-horarios-disponiveis?${params}`;

                    api.get(urlCompleta)
                        .then(res => {
                            setAgenda(res.data || []);
                        })
                        .catch(err => {
                            // IMPORTANTE: Mostra se foi 404, 400, 500 ou Network Error
                            if (err.response) {
                                console.error("STATUS:", err.response.status);
                                console.error("DADOS:", err.response.data);
                            } else {
                                console.error("ERRO DE REDE/CORS (Nem chegou no server)");
                            }
                            mostrarToast("Erro ao buscar agenda.", "error");
                        })
                        .finally(() => setLoading(false));
                }
        }, [form.unidadeId, medicoId]);

    const handleAgendar = async () => {
        if(!form.data || !form.horario) return mostrarToast("Selecione data e horário.", "error");
        
        try {
            // 3. Tratamento de Fuso Horário (Fix para datas incorretas)
            // O toISOString() pode pegar o dia anterior dependendo do fuso. 
            // Usamos 'sv-SE' para forçar o formato YYYY-MM-DD localmente.
            const year = form.data.getFullYear();
            const month = String(form.data.getMonth() + 1).padStart(2, '0');
            const day = String(form.data.getDate()).padStart(2, '0');
            const dataISO = `${year}-${month}-${day}`;
            
            await api.post('medico/consulta/marcar/retorno', {
                pacienteId: consulta.dataDetalhesPaciente.dataDetalhesPessoa.id,
                medicoId: medicoId,
                unidadeId: form.unidadeId,
                horario: `${dataISO}T${form.horario}`
            });
            
            mostrarToast("Retorno agendado com sucesso!", "success");
            onCancel();
        } catch (e) {
            console.error(e);
            mostrarToast(e.response?.data?.message || "Erro ao agendar.", "error"); 
        }
    };

    // Ajuste seguro para renderização das datas
    const dates = agenda.map(i => { 
        // Força interpretação da data como local para evitar problemas de -3h (Brasil)
        const [y,m,d] = i.data.split('-'); 
        return new Date(y, m-1, d); 
    });
    
    // Busca horários comparando a string YYYY-MM-DD
    const hours = form.data ? (agenda.find(i => {
        const d = form.data;
        const dataString = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return i.data === dataString;
    })?.horarios || []) : [];

    return (
        <ModalBase title="Agendar Retorno" onClose={onCancel} styles={styles}>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, marginBottom: '8px' }}>UNIDADE</label>
                <select 
                    value={form.unidadeId} onChange={e => setForm({...form, unidadeId: e.target.value, data: null, horario: ''})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white }}
                >
                    <option value="">Selecione a unidade...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
            </div>
            
            {/* Loading visual */}
            {loading && <p style={{fontSize: '12px', color: styles.colors.primary, textAlign: 'center'}}>Buscando horários...</p>}

            {!loading && form.unidadeId && (
                <div style={{ display: 'flex', flexDirection: styles.isMobile ? 'column' : 'row', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, marginBottom: '8px' }}>DATA</label>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <DatePicker 
                                selected={form.data} 
                                onChange={d => setForm({...form, data: d, horario: ''})} 
                                includeDates={dates} 
                                inline 
                                calendarClassName="custom-calendar" // Se quiser estilizar via CSS
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: styles.colors.textMuted, marginBottom: '8px' }}>HORÁRIO</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                            {hours.map(h => (
                                <button key={h} onClick={() => setForm({...form, horario: h})}
                                    style={{
                                        padding: '8px', borderRadius: '8px', 
                                        border: `1px solid ${form.horario === h ? styles.colors.primary : styles.colors.border}`,
                                        backgroundColor: form.horario === h ? styles.colors.primary : 'transparent',
                                        color: form.horario === h ? '#fff' : styles.colors.textDark, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {h.substring(0, 5)}
                                </button>
                            ))}
                            {hours.length === 0 && <div style={{gridColumn: 'span 2', textAlign: 'center', padding: '20px', color: styles.colors.textMuted, fontSize: '13px'}}>Selecione uma data disponível.</div>}
                        </div>
                    </div>
                </div>
            )}
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <ActionButton variant="secondary" onClick={onCancel} styles={styles}>Cancelar</ActionButton>
                <ActionButton variant="success" onClick={handleAgendar} disabled={!form.horario} styles={styles}>Confirmar Retorno</ActionButton>
            </div>
        </ModalBase>
    );
};

// =================================================================
// 🏠 TELA DE ATENDIMENTO (PRINCIPAL)
// =================================================================

const TelaDeAtendimento = ({ consulta, onVoltar }) => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 992px)');

    // Estado Local
    const [historico, setHistorico] = useState([]);
    const [formData, setFormData] = useState({
        subjetivo: consulta.subjetivo || '',
        objetivo: consulta.objetivo || '',
        avaliacao: consulta.avaliacao || '',
        plano: consulta.plano || ''
    });
    
    // Modais
    const [modal, setModal] = useState({ type: null, data: null }); // type: 'EXAME' | 'RETORNO' | 'HISTORICO'
    const [toast, setToast] = useState({ show: false, msg: '', type: '' });

    // Dados Derivados
    const paciente = consulta?.dataDetalhesPaciente || {};
    const pessoa = paciente?.dataDetalhesPessoa || {};
    const medico = consulta?.dataDetalhesMedico || {};

    const mostrarToast = (msg, type = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
    };

    // Calcular Idade
    const getIdade = (nasc) => {
        if (!nasc) return '-';
        const ageDifMs = Date.now() - new Date(nasc).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970) + " anos";
    };

    // Carregar Histórico
    useEffect(() => {
        if (pessoa.id) {
            api.get(`/historicodoenca/all/${pessoa.id}`)
               .then(res => setHistorico(res.data.content || []))
               .catch(err => console.error("Erro histórico", err));
        }
    }, [pessoa.id]);

    const handleSalvarConsulta = async () => {
        try {
            await api.put(`/consulta/terminar/${consulta.id}`, formData);
            mostrarToast("Consulta finalizada e salva!", "success");
            setTimeout(onVoltar, 2000);
        } catch (err) { mostrarToast("Erro ao salvar consulta.", "error"); }
    };

    const handleHistoricoAction = async (data) => {
        try {
            if (data.id) {
                await api.put(`/historicodoenca/${data.id}`, data);
                setHistorico(prev => prev.map(h => h.id === data.id ? data : h));
            } else {
                const res = await api.post(`/historicodoenca/cadastro/${pessoa.id}`, data);
                setHistorico(prev => [...prev, res.data]);
            }
            mostrarToast("Histórico atualizado.");
            setModal({ type: null });
        } catch (e) { mostrarToast("Erro ao salvar histórico.", "error"); }
    };

    const deleteHistorico = async (id) => {
        if (!window.confirm("Excluir registro?")) return;
        try {
            await api.delete(`/historicodoenca/${id}`);
            setHistorico(prev => prev.filter(h => h.id !== id));
            mostrarToast("Registro removido.");
        } catch (e) { mostrarToast("Erro ao excluir.", "error"); }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '10px' : '30px' }}>
            
            {/* TOAST */}
            {toast.show && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px',
                    backgroundColor: colors.white, borderLeft: `6px solid ${toast.type === 'success' ? colors.success : colors.danger}`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 1200, display: 'flex', alignItems: 'center', gap: '10px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <strong>{toast.type === 'success' ? 'Sucesso' : 'Atenção'}</strong> {toast.msg}
                </div>
            )}

            {/* HEADER PACIENTE */}
            <div style={{ backgroundColor: colors.white, borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img 
                            src={pessoa.fotoPerfilUrl || `https://ui-avatars.com/api/?name=${pessoa.nome}&background=random`} 
                            style={{ width: '80px', height: '80px', borderRadius: '24px', objectFit: 'cover' }} 
                            alt="Paciente" 
                        />
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.textDark }}>{pessoa.nome}</h1>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <VitalCard icon={<FiUser />} label="Idade" value={getIdade(pessoa.dataNascimento)} color={colors.primary} styles={styles} />
                                <VitalCard icon={<FiActivity />} label="IMC" value={paciente.imc?.toFixed(2)} color={colors.success} styles={styles} />
                                <VitalCard icon={<FiHeart />} label="Sanguíneo" value={paciente.tipoSanguineo} color={colors.danger} styles={styles} />
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <ActionButton variant="secondary" onClick={() => setModal({type: 'EXAME'})} styles={styles} icon={<FiFileText />}>Solicitar Exames</ActionButton>
                        <ActionButton variant="secondary" onClick={() => setModal({type: 'RETORNO'})} styles={styles} icon={<FiCalendar />}>Agendar Retorno</ActionButton>
                        <ActionButton variant="danger" onClick={onVoltar} styles={styles} icon={<FiArrowLeft />}>Sair</ActionButton>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', gap: '24px' }}>
                
                {/* SIDEBAR: HISTÓRICO */}
                <div>
                    <div style={{ backgroundColor: colors.white, borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: colors.textDark }}>Histórico Clínico</h3>
                            <button onClick={() => setModal({type: 'HISTORICO'})} style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus /></button>
                        </div>
                        
                        {historico.length === 0 ? (
                            <p style={{ textAlign: 'center', color: colors.textMuted, fontSize: '14px', fontStyle: 'italic' }}>Nenhum registro anterior.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {historico.map(h => (
                                    <div key={h.id} style={{ padding: '16px', borderRadius: '16px', backgroundColor: colors.background, border: `1px solid ${colors.borderLight}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <strong style={{ color: colors.textDark, fontSize: '14px' }}>{h.nomeDoenca}</strong>
                                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: h.estadoAtual === 'ATIVA' ? `${colors.warning}20` : `${colors.success}20`, color: h.estadoAtual === 'ATIVA' ? colors.warning : colors.success, fontWeight: 'bold' }}>{h.estadoAtual}</span>
                                        </div>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: colors.textMuted }}>{new Date(h.dataDiagnostico).toLocaleDateString('pt-BR')}</p>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => setModal({type: 'HISTORICO', data: h})} style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer' }}><FiEdit2 size={14}/></button>
                                            <button onClick={() => deleteHistorico(h.id)} style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer' }}><FiTrash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN: SOAP */}
                <div>
                    <div style={{ backgroundColor: colors.white, borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: colors.textDark }}>Registro de Consulta</h2>
                                <p style={{ margin: 0, color: colors.textMuted }}>Preencha o prontuário eletrônico (SOAP)</p>
                            </div>
                            <ActionButton onClick={handleSalvarConsulta} variant="success" icon={<FiSave />} styles={styles}>Finalizar Atendimento</ActionButton>
                        </div>

                        <SoapCard letter="S" title="Subjetivo" color="#3b82f6" styles={styles}>
                            <ModernInput 
                                rows={4} 
                                value={formData.subjetivo} 
                                onChange={e => setFormData({...formData, subjetivo: e.target.value})}
                                placeholder="Queixa principal, história da moléstia atual, histórico..."
                                styles={styles}
                            />
                        </SoapCard>

                        <SoapCard letter="O" title="Objetivo" color="#10b981" styles={styles}>
                            <ModernInput 
                                rows={4} 
                                value={formData.objetivo} 
                                onChange={e => setFormData({...formData, objetivo: e.target.value})}
                                placeholder="Exame físico, sinais vitais, resultados de exames..."
                                styles={styles}
                            />
                        </SoapCard>

                        <SoapCard letter="A" title="Avaliação" color="#f59e0b" styles={styles}>
                            <ModernInput 
                                rows={3} 
                                value={formData.avaliacao} 
                                onChange={e => setFormData({...formData, avaliacao: e.target.value})}
                                placeholder="Hipótese diagnóstica, raciocínio clínico..."
                                styles={styles}
                            />
                        </SoapCard>

                        <SoapCard letter="P" title="Plano" color="#ef4444" styles={styles}>
                            <ModernInput 
                                rows={4} 
                                value={formData.plano} 
                                onChange={e => setFormData({...formData, plano: e.target.value})}
                                placeholder="Prescrições, solicitações, orientações, retorno..."
                                styles={styles}
                            />
                        </SoapCard>
                    </div>
                </div>
            </div>

            {/* RENDERING MODALS */}
            {modal.type === 'EXAME' && <ModalSolicitarExame consulta={consulta} onCancel={() => setModal({type: null})} styles={styles} mostrarToast={mostrarToast} />}
            {modal.type === 'RETORNO' && <ModalAgendarRetorno consulta={consulta} onCancel={() => setModal({type: null})} styles={styles} mostrarToast={mostrarToast} />}
            {modal.type === 'HISTORICO' && <ModalHistoricoPaciente doenca={modal.data} onSave={handleHistoricoAction} onCancel={() => setModal({type: null})} styles={styles} />}
        </div>
    );
};

export default TelaDeAtendimento;