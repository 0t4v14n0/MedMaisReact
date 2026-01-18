import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
    FiSearch, FiUser, FiCalendar, FiPhone, FiMail, 
    FiMapPin, FiActivity, FiX, FiFilter, FiDollarSign, 
    FiPlusCircle, FiClock, FiCheckCircle, FiAlertCircle 
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

// Input de Busca
const SearchInput = ({ value, onChange, placeholder, styles }) => (
    <div style={{ position: 'relative', width: '100%' }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: styles.colors.textMuted, fontSize: '18px' }} />
        <input 
            type="text" value={value} onChange={onChange} placeholder={placeholder}
            style={{
                width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px',
                border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white,
                color: styles.colors.textDark, fontSize: '15px', outline: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s',
                boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = styles.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${styles.colors.primary}15`; }}
            onBlur={(e) => { e.target.style.borderColor = styles.colors.border; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
        />
    </div>
);

// Chip de Filtro
const FilterChip = ({ label, active, onClick, styles }) => (
    <button 
        onClick={onClick}
        style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none',
            backgroundColor: active ? styles.colors.primary : styles.colors.lightGray,
            color: active ? '#fff' : styles.colors.textMuted,
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
        }}
    >
        {label}
    </button>
);

// Botão de Ação
const ActionButton = ({ icon, label, onClick, variant = 'primary', styles, fullWidth }) => {
    let bg = styles.colors.primary;
    let color = '#fff';

    if (variant === 'secondary') { bg = `${styles.colors.primary}15`; color = styles.colors.primary; }
    if (variant === 'success') { bg = '#10b981'; color = '#fff'; }
    if (variant === 'warning') { bg = '#f59e0b'; color = '#fff'; }
    if (variant === 'outline') { bg = 'transparent'; color = styles.colors.textMuted; }

    return (
        <button 
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: '10px', border: variant === 'outline' ? `1px solid ${styles.colors.border}` : 'none',
                backgroundColor: bg, color: color, fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', transition: 'transform 0.2s', width: fullWidth ? '100%' : 'auto',
                boxShadow: variant !== 'outline' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {icon} {label}
        </button>
    );
};

// Card de Paciente
const PatientCard = ({ paciente, onDetails, onSchedule, onBalance, styles, isMobile }) => {
    const nome = paciente.nome || 'Nome não informado';
    const cpf = paciente.cpf || '-';
    const foto = paciente.fotoPerfilUrl;
    
    // Calcula idade aproximada se houver data (ajuste conforme formato)
    const idade = paciente.dataNascimento ? 
        Math.floor((new Date() - new Date(paciente.dataNascimento)) / 31557600000) : null;

    return (
        <div style={{
            backgroundColor: styles.colors.white, borderRadius: '20px', padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
            display: 'flex', flexDirection: 'column', gap: '15px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                    width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: styles.colors.primaryLight, color: styles.colors.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '20px', fontWeight: 'bold', overflow: 'hidden'
                }}>
                    {foto ? <img src={foto} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : nome.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: styles.colors.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nome}</h4>
                    <div style={{ fontSize: '13px', color: styles.colors.textMuted, display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <span>🆔 {cpf}</span>
                        {idade && <span>🎂 {idade} anos</span>}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderTop: `1px solid ${styles.colors.borderLight}`, paddingTop: '15px' }}>
                <ActionButton icon={<FiUser />} label="Detalhes" onClick={onDetails} variant="secondary" styles={styles} fullWidth />
                <ActionButton icon={<FiCalendar />} label="Agendar" onClick={onSchedule} variant="primary" styles={styles} fullWidth />
                <ActionButton icon={<FiDollarSign />} label="Saldo" onClick={onBalance} variant="warning" styles={styles} fullWidth />
            </div>
        </div>
    );
};

// Modal Base
const ModalBase = ({ isOpen, onClose, title, children, styles, width = '600px' }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px'
        }}>
            <div style={{
                backgroundColor: styles.colors.background, borderRadius: '24px', width: '100%', maxWidth: width,
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden', animation: 'scaleUp 0.3s ease-out'
            }}>
                <div style={{ padding: '20px 24px', backgroundColor: styles.colors.white, borderBottom: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: styles.colors.textDark }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted, fontSize: '20px' }}><FiX /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>{children}</div>
                <style>{`@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            </div>
        </div>
    );
};

// =================================================================
// 🩺 COMPONENTE PRINCIPAL
// =================================================================

const BuscarPacientesRecepcao = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // --- ESTADOS ---
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    
    // Modais
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
    const [modalSaldoAberto, setModalSaldoAberto] = useState(false);
    
    // Dados Detalhados
    const [detalhesPaciente, setDetalhesPaciente] = useState(null);
    const [historicoConsultas, setHistoricoConsultas] = useState([]);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState('dados');

    // Agendamento
    const [unidades, setUnidades] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [agendaDisponivel, setAgendaDisponivel] = useState([]);
    const [selectedUnidade, setSelectedUnidade] = useState("");
    const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
    const [selectedTipoConsulta, setSelectedTipoConsulta] = useState("PRESENCIAL");
    const [selectedMedico, setSelectedMedico] = useState(null);
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [loadingAgendamento, setLoadingAgendamento] = useState({ unidades: false, especialidades: false, medicos: false, agenda: false, agendamento: false });

    // Saldo
    const [valorSaldo, setValorSaldo] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
    const [observacoesSaldo, setObservacoesSaldo] = useState('');

    // --- FETCHING ---
    
    const buscarPacientes = useCallback(async (termo, tipo) => {
        if (!termo.trim()) { setPacientes([]); return; }
        setLoading(true);
        try {
            const params = { termo, tipo: tipo === 'TODOS' ? 'TODOS' : tipo };
            const res = await api.get('/recepcao/pacientes/buscar', { params });
            setPacientes(res.data || []);
        } catch (error) { console.error(error); setPacientes([]); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { if (busca.trim()) buscarPacientes(busca, filtroTipo); }, 500);
        return () => clearTimeout(timer);
    }, [busca, filtroTipo, buscarPacientes]);

    // Carregar dados de agendamento (Unidades)
    useEffect(() => {
        api.get("/unidade/todas").then(res => setUnidades(res.data.content || res.data || [])).catch(console.error);
    }, []);

    // --- ACTIONS ---

    const handleUnidadeChange = async (unidadeId) => {
        setSelectedUnidade(unidadeId);
        setSelectedEspecialidade(''); setEspecialidades([]); setMedicos([]); setSelectedMedico(null); setAgendaDisponivel([]);
        if (!unidadeId) return;
        
        setLoadingAgendamento(p => ({ ...p, especialidades: true }));
        try {
            const res = await api.get(`/publico/especialidade/${unidadeId}`);
            setEspecialidades(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoadingAgendamento(p => ({ ...p, especialidades: false })); }
    };

    useEffect(() => {
        if (!selectedEspecialidade || !selectedUnidade) return;
        setLoadingAgendamento(p => ({ ...p, medicos: true }));
        api.get(`/paciente/medico/all/especialidade/${selectedEspecialidade}`)
           .then(res => setMedicos(res.data?.body?.content || res.data?.content || res.data || []))
           .catch(console.error)
           .finally(() => setLoadingAgendamento(p => ({ ...p, medicos: false })));
    }, [selectedEspecialidade, selectedUnidade]);

    useEffect(() => {
        if (!selectedMedico || !selectedUnidade) return;
        setLoadingAgendamento(p => ({ ...p, agenda: true }));
        const params = new URLSearchParams({ idUnidade: selectedUnidade, idMedico: selectedMedico.id, tipo: selectedTipoConsulta, periodoEmDias: 45 }).toString();
        api.get(`/agenda/medico/datas-horarios-disponiveis?${params}`)
           .then(res => setAgendaDisponivel(res.data || []))
           .catch(console.error)
           .finally(() => setLoadingAgendamento(p => ({ ...p, agenda: false })));
    }, [selectedMedico, selectedUnidade, selectedTipoConsulta]);

    // Abrir Modais
    const abrirDetalhes = async (paciente) => {
        setPacienteSelecionado(paciente);
        setModalDetalhesAberto(true);
        setCarregandoDetalhes(true);
        setAbaAtiva('dados');
        try {
            const [detalhesRes, historicoRes] = await Promise.all([
                api.get(`/recepcao/pacientes/${paciente.id}/detalhes`),
                api.get(`/recepcao/pacientes/${paciente.id}/consultas`)
            ]);
            setDetalhesPaciente(detalhesRes.data);
            setHistoricoConsultas(historicoRes.data || []);
        } catch (e) { console.error(e); }
        finally { setCarregandoDetalhes(false); }
    };

    const abrirAgendamento = (paciente) => {
        setPacienteSelecionado(paciente);
        setModalAgendamentoAberto(true);
        // Reset form
        setSelectedUnidade(""); setSelectedEspecialidade(""); setSelectedMedico(null); setDataSelecionada(null); setSelectedHorario(null);
    };

    const abrirSaldo = (paciente) => {
        setPacienteSelecionado(paciente);
        setModalSaldoAberto(true);
        setValorSaldo(''); setObservacoesSaldo('');
    };

    // Submissões
    const marcarConsulta = async () => {
        if (!selectedMedico || !dataSelecionada || !selectedHorario) return alert('Preencha todos os campos');
        setLoadingAgendamento(p => ({ ...p, agendamento: true }));
        try {
            await api.post(`/recepcao/consulta/agendar/${pacienteSelecionado.id}`, {
                medicoId: selectedMedico.id,
                unidadeId: selectedUnidade,
                horario: `${dataSelecionada.toISOString().split('T')[0]}T${selectedHorario}`,
                tipo: selectedTipoConsulta
            });
            alert('Agendado com sucesso!');
            setModalAgendamentoAberto(false);
        } catch (e) { alert('Erro ao agendar.'); }
        finally { setLoadingAgendamento(p => ({ ...p, agendamento: false })); }
    };

    const adicionarSaldo = async () => {
        if (!valorSaldo) return alert('Informe o valor');
        try {
            await api.post('/recepcao/pacientes/saldo', {
                pessoaId: pacienteSelecionado.id,
                valor: parseFloat(valorSaldo),
                tipo: "SALDO_EM_CONTA",
                descricao: `Recarga - ${formaPagamento} ${observacoesSaldo ? `(${observacoesSaldo})` : ''}`
            });
            alert('Saldo adicionado!');
            setModalSaldoAberto(false);
        } catch (e) { alert('Erro ao adicionar saldo.'); }
    };

    // Helpers de Renderização
    const renderInfoRow = (label, value) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${styles.colors.borderLight}` }}>
            <span style={{ color: styles.colors.textMuted, fontSize: '13px', fontWeight: '600' }}>{label}</span>
            <span style={{ color: styles.colors.textDark, fontSize: '14px' }}>{value || '-'}</span>
        </div>
    );

    const datasDatepicker = agendaDisponivel.map(i => { const [y,m,d] = i.data.split('-'); return new Date(y, m-1, d); });
    const horariosDia = dataSelecionada ? (agendaDisponivel.find(i => i.data === dataSelecionada.toISOString().split('T')[0])?.horarios || []) : [];

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                        Atendimento <span style={{ color: styles.colors.primary }}>Pacientes</span>
                    </h1>
                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Busque pacientes para iniciar atendimentos ou gerenciar contas.</p>
                </div>

                {/* Busca */}
                <div style={{ backgroundColor: styles.colors.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <SearchInput value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome, CPF ou E-mail..." styles={styles} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: styles.colors.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}><FiFilter /> Filtro:</span>
                        {['TODOS', 'NOME', 'CPF', 'EMAIL'].map(t => (
                            <FilterChip key={t} label={t === 'TODOS' ? 'Todos' : t} active={filtroTipo === t} onClick={() => setFiltroTipo(t)} styles={styles} />
                        ))}
                    </div>
                </div>

                {/* Lista */}
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: styles.colors.textMuted }}>Carregando...</div>
                    ) : pacientes.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {pacientes.map(p => (
                                <PatientCard 
                                    key={p.id} paciente={p} styles={styles} isMobile={isMobile}
                                    onDetails={() => abrirDetalhes(p)}
                                    onSchedule={() => abrirAgendamento(p)}
                                    onBalance={() => abrirSaldo(p)}
                                />
                            ))}
                        </div>
                    ) : busca ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: styles.colors.textMuted }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
                            <p>Nenhum paciente encontrado.</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', color: styles.colors.textMuted }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                            <p>Digite para buscar...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DETALHES */}
            <ModalBase isOpen={modalDetalhesAberto} onClose={() => setModalDetalhesAberto(false)} title="Prontuário do Paciente" styles={styles} width="800px">
                {carregandoDetalhes ? <p>Carregando...</p> : detalhesPaciente ? (
                    <div>
                        {/* Abas */}
                        <div style={{ display: 'flex', borderBottom: `1px solid ${styles.colors.borderLight}`, marginBottom: '20px' }}>
                            {['dados', 'historico', 'financeiro'].map(aba => (
                                <button 
                                    key={aba} onClick={() => setAbaAtiva(aba)}
                                    style={{ 
                                        flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                                        borderBottom: abaAtiva === aba ? `3px solid ${styles.colors.primary}` : '3px solid transparent',
                                        color: abaAtiva === aba ? styles.colors.primary : styles.colors.textMuted,
                                        fontWeight: '600'
                                    }}
                                >
                                    {aba.charAt(0).toUpperCase() + aba.slice(1)}
                                </button>
                            ))}
                        </div>

                        {abaAtiva === 'dados' && (
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>
                                <div>
                                    <h4 style={{ color: styles.colors.primary, marginBottom: '15px' }}>Pessoal</h4>
                                    {renderInfoRow("Nome", detalhesPaciente.pessoa?.nome)}
                                    {renderInfoRow("CPF", detalhesPaciente.pessoa?.cpf)}
                                    {renderInfoRow("Data Nasc.", new Date(detalhesPaciente.pessoa?.dataNascimento).toLocaleDateString())}
                                    {renderInfoRow("Email", detalhesPaciente.pessoa?.email)}
                                    {renderInfoRow("Telefone", detalhesPaciente.pessoa?.telefone)}
                                </div>
                                <div>
                                    <h4 style={{ color: styles.colors.primary, marginBottom: '15px' }}>Saúde & Endereço</h4>
                                    {renderInfoRow("Tipo Sanguíneo", detalhesPaciente.tipoSanguineo)}
                                    {renderInfoRow("Peso", detalhesPaciente.peso + " kg")}
                                    {renderInfoRow("Altura", detalhesPaciente.altura + " m")}
                                    {renderInfoRow("Cidade", detalhesPaciente.pessoa?.dataDetalhesEndereco?.cidade)}
                                </div>
                            </div>
                        )}

                        {abaAtiva === 'historico' && (
                            <div>
                                {historicoConsultas.length > 0 ? historicoConsultas.map(c => (
                                    <div key={c.id} style={{ padding: '15px', borderRadius: '12px', backgroundColor: styles.colors.backgroundLight, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', color: styles.colors.textDark }}>{new Date(c.data).toLocaleString()}</div>
                                            <div style={{ fontSize: '13px', color: styles.colors.textMuted }}>{c.medicoNome} • {c.tipo}</div>
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px', backgroundColor: styles.colors.white }}>{c.statusConsula}</div>
                                    </div>
                                )) : <p style={{ textAlign: 'center', color: styles.colors.textMuted }}>Sem histórico.</p>}
                            </div>
                        )}

                        {abaAtiva === 'financeiro' && (
                            <div>
                                <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600' }}>SALDO EM CONTA</div>
                                    <div style={{ fontSize: '28px', color: '#15803d', fontWeight: '800' }}>
                                        {detalhesPaciente.pessoa?.saldo?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                                {renderInfoRow("Convênio", detalhesPaciente.convenio?.nomeConvenio)}
                                {renderInfoRow("Carteirinha", detalhesPaciente.numeroCarteiraConvenio)}
                                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                    <ActionButton label="Adicionar Saldo" icon={<FiPlusCircle />} onClick={() => { setModalDetalhesAberto(false); abrirSaldo(pacienteSelecionado); }} variant="success" styles={styles} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : <p>Erro ao carregar.</p>}
            </ModalBase>

            {/* MODAL AGENDAMENTO */}
            <ModalBase isOpen={modalAgendamentoAberto} onClose={() => setModalAgendamentoAberto(false)} title={`Agendar: ${pacienteSelecionado?.nome}`} styles={styles} width="900px">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={styles.app.label}>Unidade</label>
                            <select style={styles.app.select} value={selectedUnidade} onChange={e => handleUnidadeChange(e.target.value)}>
                                <option value="">Selecione...</option>
                                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                            </select>
                        </div>
                        {selectedUnidade && (
                            <div>
                                <label style={styles.app.label}>Especialidade</label>
                                <select style={styles.app.select} value={selectedEspecialidade} onChange={e => setSelectedEspecialidade(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {especialidades.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                </select>
                            </div>
                        )}
                        {selectedEspecialidade && (
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <label style={styles.app.label}>Médico</label>
                                {medicos.map(m => (
                                    <div 
                                        key={m.id} onClick={() => setSelectedMedico(m)}
                                        style={{ 
                                            padding: '10px', marginBottom: '5px', borderRadius: '8px', cursor: 'pointer',
                                            border: selectedMedico?.id === m.id ? `2px solid ${styles.colors.primary}` : `1px solid ${styles.colors.border}`,
                                            backgroundColor: selectedMedico?.id === m.id ? `${styles.colors.primary}10` : styles.colors.white
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{m.dataDetalhesFuncionario.dataDetalhesPessoa.nome}</div>
                                        <div style={{ fontSize: '12px', color: styles.colors.textMuted }}>CRM: {m.crm}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        {selectedMedico ? (
                            <>
                                <label style={styles.app.label}>Data</label>
                                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                                    <DatePicker selected={dataSelecionada} onChange={date => { setDataSelecionada(date); setSelectedHorario(null); }} includeDates={datasDatepicker} inline />
                                </div>
                                {dataSelecionada && (
                                    <div>
                                        <label style={styles.app.label}>Horário</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
                                            {horariosDia.map(h => (
                                                <button 
                                                    key={h} onClick={() => setSelectedHorario(h)}
                                                    style={{ 
                                                        padding: '5px', borderRadius: '5px', border: 'none', cursor: 'pointer',
                                                        backgroundColor: selectedHorario === h ? styles.colors.primary : styles.colors.lightGray,
                                                        color: selectedHorario === h ? '#fff' : styles.colors.textDark
                                                    }}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: styles.colors.textMuted }}>Selecione um médico para ver a agenda</div>}
                    </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '20px', borderTop: `1px solid ${styles.colors.borderLight}` }}>
                    <ActionButton label="Cancelar" onClick={() => setModalAgendamentoAberto(false)} variant="outline" styles={styles} />
                    <ActionButton label="Confirmar Agendamento" onClick={marcarConsulta} disabled={!selectedHorario} styles={styles} />
                </div>
            </ModalBase>

            {/* MODAL SALDO */}
            <ModalBase isOpen={modalSaldoAberto} onClose={() => setModalSaldoAberto(false)} title={`Saldo: ${pacienteSelecionado?.nome}`} styles={styles} width="500px">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={styles.app.label}>Valor (R$)</label>
                        <input type="number" value={valorSaldo} onChange={e => setValorSaldo(e.target.value)} style={styles.app.input} placeholder="0.00" />
                    </div>
                    <div>
                        <label style={styles.app.label}>Forma Pagamento</label>
                        <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} style={styles.app.select}>
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="PIX">PIX</option>
                            <option value="CARTAO">Cartão</option>
                        </select>
                    </div>
                    <div>
                        <label style={styles.app.label}>Observação</label>
                        <textarea value={observacoesSaldo} onChange={e => setObservacoesSaldo(e.target.value)} style={{...styles.app.input, height: '80px'}} />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <ActionButton label="Confirmar Recarga" icon={<FiCheckCircle />} onClick={adicionarSaldo} fullWidth variant="success" styles={styles} />
                    </div>
                </div>
            </ModalBase>

        </div>
    );
};

export default BuscarPacientesRecepcao;