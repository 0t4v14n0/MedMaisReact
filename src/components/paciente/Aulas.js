import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import api from '../../api/api';

// =================================================================
// HOOKS & HELPERS (Mantidos da versão anterior)
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

// --- Helpers de Data e Hora ---
const formatarData = (dataString) => {
    if (!dataString) return '';
    const date = new Date(dataString.replace(/-/g, '/'));
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
};

const formatarDiaCurto = (dataString) => {
    const date = new Date(dataString.replace(/-/g, '/'));
    return date.toLocaleDateString('pt-BR', { day: '2-digit' });
};

const formatarMesCurto = (dataString) => {
    const date = new Date(dataString.replace(/-/g, '/'));
    return date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
};

const formatarSemanaCurto = (dia) => {
    const dias = { 'SEGUNDA-FEIRA': 'SEG', 'TERCA-FEIRA': 'TER', 'QUARTA-FEIRA': 'QUA', 'QUINTA-FEIRA': 'QUI', 'SEXTA-FEIRA': 'SEX', 'SABADO': 'SÁB', 'DOMINGO': 'DOM' };
    return dias[dia] || dia.substring(0, 3);
};

const formatarHora = (timeString) => timeString ? timeString.substring(0, 5) : '';

const criarDataLocal = (dataString, horarioString) => {
    const dataAula = new Date(dataString.replace(/-/g, '/'));
    if (horarioString) {
        const [hours, minutes] = horarioString.split(':');
        dataAula.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
        dataAula.setHours(0, 0, 0, 0);
    }
    return dataAula;
};

// --- Lógica de Negócio ---
const podeSeInscrever = (aula, dataString) => {
    if (!aula || !aula.horarioInicio || aula.status !== 'DISPONIVEL' || aula.usuarioJaInscrito || aula.vagasDisponiveis <= 0) return false;
    const agora = new Date();
    const dataAula = criarDataLocal(dataString, aula.horarioInicio);
    const inicioPermitido = new Date(dataAula.getTime() - (24 * 60 * 60 * 1000));
    const fimPermitido = new Date(dataAula.getTime() - (60 * 60 * 1000));
    return agora >= inicioPermitido && agora < fimPermitido;
};

const getStatusAula = (aula, dataString) => {
    const agora = new Date();
    const dataAula = criarDataLocal(dataString, aula.horarioInicio);
    const inicioPermitido = new Date(dataAula.getTime() - (24 * 60 * 60 * 1000));
    const fimPermitido = new Date(dataAula.getTime() - (60 * 60 * 1000));
    if (agora < inicioPermitido) return 'AGUARDANDO';
    if (agora >= fimPermitido) return 'EXPIRADO';
    return 'ABERTO';
};

// =================================================================
// COMPONENTES UI INTEGRADOS AO SEU TEMA
// =================================================================

const ModernToast = ({ message, type, onClose, styles }) => (
    <div style={{
        position: 'fixed', top: '24px', right: '24px', 
        padding: '16px 24px', borderRadius: '12px',
        backgroundColor: styles.colors.white,
        borderLeft: `6px solid ${type === 'success' ? styles.colors.success : styles.colors.danger}`,
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 1100,
        display: 'flex', alignItems: 'center', gap: '16px',
        color: styles.colors.textDark,
        animation: 'slideIn 0.3s ease-out',
        border: `1px solid ${styles.colors.border}`
    }}>
        <div style={{ 
            width: '24px', height: '24px', borderRadius: '50%', 
            backgroundColor: type === 'success' ? `${styles.colors.success}20` : `${styles.colors.danger}20`,
            color: type === 'success' ? styles.colors.success : styles.colors.danger,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'
        }}>
            {type === 'success' ? '✓' : '!'}
        </div>
        <span style={{ fontWeight: '500', fontSize: '14px' }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted, fontSize: '18px' }}>×</button>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
);

const ModernModal = ({ title, children, onCancel, styles }) => (
    <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px'
    }}>
        <div style={{
            backgroundColor: styles.colors.white, borderRadius: '16px', width: '100%', maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'scaleIn 0.2s ease-out',
            border: `1px solid ${styles.colors.border}`
        }}>
            <div style={{ padding: '24px', borderBottom: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: styles.colors.textDark, fontSize: '20px', fontWeight: '600' }}>{title}</h3>
                <button onClick={onCancel} style={{
                    width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: styles.colors.lightGray,
                    color: styles.colors.textDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>×</button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto', color: styles.colors.textDark }}>{children}</div>
        </div>
        <style>{`@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
);

const ProgressBar = ({ current, max, color, styles }) => (
    <div style={{ width: '100%', height: '6px', backgroundColor: styles.colors.lightGray, borderRadius: '3px', overflow: 'hidden', marginTop: '8px' }}>
        <div style={{ width: `${(current / max) * 100}%`, height: '100%', backgroundColor: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
    </div>
);

const StatusBadge = ({ status, customLabel, styles }) => {
    let bg = styles.colors.lightGray;
    let color = styles.colors.textMuted;
    let label = customLabel || status;

    if (status === 'DISPONIVEL' || status === 'CONFIRMADA') { bg = `${styles.colors.success}20`; color = styles.colors.success; label = customLabel || 'Confirmada'; }
    if (status === 'LOTADO' || status === 'EXPIRADO') { bg = `${styles.colors.danger}20`; color = styles.colors.danger; } // Usando danger como warning visual se não tiver warning
    if (status === 'CANCELADA') { bg = `${styles.colors.danger}20`; color = styles.colors.danger; }
    if (status === 'AGUARDANDO') { bg = `${styles.colors.info}20`; color = styles.colors.info; }

    return (
        <span style={{ 
            padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, 
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' 
        }}>
            {label}
        </span>
    );
};

// =================================================================
// CARD DE AULA (COM CORES DO TEMA)
// =================================================================

const ClassCard = ({ aula, dia, onInscricao, onViewAlunos, styles }) => {
    const { colors } = styles;
    const statusTemporal = getStatusAula(aula, dia.data);
    const podeInscrever = podeSeInscrever(aula, dia.data);
    
    // Lógica para cor/texto do tempo restante
    const getTempoInfo = () => {
        const agora = new Date();
        const dataAula = criarDataLocal(dia.data, aula.horarioInicio);
        const inicio = new Date(dataAula.getTime() - (24 * 60 * 60 * 1000));
        const fim = new Date(dataAula.getTime() - (60 * 60 * 1000));

        if (agora < inicio) {
            const diffHours = Math.floor((inicio - agora) / (1000 * 60 * 60));
            return { text: `Abre em ${diffHours}h`, color: colors.textMuted };
        }
        if (agora >= fim) return { text: 'Encerrado', color: colors.danger };
        
        const diffMin = Math.floor((fim - agora) / (1000 * 60));
        const diffH = Math.floor(diffMin / 60);
        const text = diffH > 0 ? `${diffH}h restantes` : `${diffMin}min restantes`;
        return { text, color: colors.success };
    };

    const tempoInfo = getTempoInfo();
    const totalVagas = aula.vagasDisponiveis + (aula.alunosInscritos?.length || 0);
    const ocupacao = totalVagas - aula.vagasDisponiveis;

    return (
        <div style={{ 
            backgroundColor: colors.white, borderRadius: '16px', padding: '20px', marginBottom: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.borderLight}`, transition: 'all 0.2s ease',
            position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
        >
            {/* Indicador Lateral de Status */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: aula.status === 'DISPONIVEL' ? colors.success : colors.danger }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '10px', backgroundColor: colors.lightGray, borderRadius: '12px', minWidth: '70px',
                        border: `1px solid ${colors.border}`
                    }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textDark }}>{formatarHora(aula.horarioInicio)}</span>
                        <span style={{ fontSize: '12px', color: colors.textMuted }}>{formatarHora(aula.horarioFim)}</span>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: colors.textDark }}>{aula.modalidade}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: `${colors.primary}20`, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                👨‍🏫
                            </div>
                            <span style={{ fontSize: '14px', color: colors.textMuted }}>{aula.nomeProfessor}</span>
                        </div>
                    </div>
                </div>
                
                {aula.usuarioJaInscrito ? (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${colors.success}20`, color: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>✓</div>
                ) : (
                    <StatusBadge status={aula.status} customLabel={statusTemporal === 'AGUARDANDO' ? 'Em Breve' : null} styles={styles} />
                )}
            </div>

            {/* Info de Ocupação */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: colors.textMuted }}>
                    <span>{aula.nomeTurma}</span>
                    <span>{ocupacao}/{totalVagas} Alunos</span>
                </div>
                <ProgressBar current={ocupacao} max={totalVagas} color={aula.status === 'DISPONIVEL' ? colors.primary : colors.danger} styles={styles} />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onViewAlunos(aula, dia); }}
                        style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        Ver quem vai 👥
                    </button>
                </div>
            </div>

            {/* Footer de Ação */}
            <div style={{ borderTop: `1px solid ${colors.borderLight}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: tempoInfo.color }}>
                   ⏱ {tempoInfo.text}
                </span>

                {!aula.usuarioJaInscrito && aula.status === 'DISPONIVEL' && (
                    <button
                        disabled={!podeInscrever}
                        onClick={(e) => { e.stopPropagation(); onInscricao(aula, dia); }}
                        style={{
                            padding: '10px 24px', borderRadius: '30px', border: 'none',
                            backgroundColor: podeInscrever ? colors.primary : colors.lightGray,
                            color: podeInscrever ? colors.textLight : colors.disabled,
                            fontWeight: '600', cursor: podeInscrever ? 'pointer' : 'not-allowed',
                            boxShadow: podeInscrever ? `0 0 10px ${colors.primary}40` : 'none',
                            transition: 'all 0.2s ease', opacity: podeInscrever ? 1 : 0.7
                        }}
                    >
                        {podeInscrever ? 'Inscrever-se' : 'Aguarde'}
                    </button>
                )}
                 {aula.usuarioJaInscrito && (
                     <span style={{ fontSize: '14px', fontWeight: '600', color: colors.success }}>Inscrição Ativa</span>
                 )}
            </div>
        </div>
    );
};

// =================================================================
// TELA PRINCIPAL
// =================================================================
const Aulas = () => {
    // 1. Usando os Hooks e Contextos originais do usuário
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode); // Styles gerados dinamicamente com base no tema
    const { colors } = styles;
    
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [agendaSemanal, setAgendaSemanal] = useState([]);
    const [minhasInscricoes, setMinhasInscricoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    
    // Modais e UI
    const [modalConfig, setModalConfig] = useState({ type: null, aula: null, dia: null });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [abaAtiva, setAbaAtiva] = useState('agenda');
    const [diaSelecionadoId, setDiaSelecionadoId] = useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [agendaRes, inscricoesRes] = await Promise.all([
                api.get('/paciente/aula/agendas/semana'),
                api.get('/paciente/aula/minhas-inscricoes')
            ]);

            const agendaOrdenada = (agendaRes.data || []).sort((a, b) => new Date(a.data) - new Date(b.data));
            setAgendaSemanal(agendaOrdenada);
            setMinhasInscricoes(inscricoesRes.data || []);

            if (agendaOrdenada.length > 0 && !diaSelecionadoId) {
                const hoje = new Date().toISOString().split('T')[0];
                const temHoje = agendaOrdenada.find(d => d.data === hoje);
                const comAulas = agendaOrdenada.find(d => d.aulas && d.aulas.length > 0);
                setDiaSelecionadoId(temHoje ? temHoje.data : (comAulas ? comAulas.data : agendaOrdenada[0].data));
            }
        } catch (err) {
            console.error(err);
            mostrarToast("Erro de conexão.", "error");
        } finally {
            setLoading(false);
        }
    };

    const mostrarToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
    };

    const handleConfirmarInscricao = async () => {
        if (!modalConfig.aula) return;
        setLoadingAction(true);
        try {
            const response = await api.post('/paciente/aula/inscricao', { idAgendaTurma: modalConfig.aula.agendaTurmaId });
            mostrarToast("Inscrição confirmada com sucesso!", "success");
            setModalConfig({ type: null, aula: null, dia: null });
            await carregarDados();
        } catch (error) {
            const msg = error.response?.data?.message || 'Erro ao realizar inscrição.';
            mostrarToast(msg, "error");
        } finally {
            setLoadingAction(false);
        }
    };

    const handleCancelarInscricao = async (idInscricao) => {
        if (!window.confirm("Deseja realmente cancelar?")) return;
        try {
            await api.put(`/paciente/aula/${idInscricao}/cancelar`);
            mostrarToast("Inscrição cancelada.", "success");
            await carregarDados();
        } catch (error) {
            mostrarToast("Não foi possível cancelar.", "error");
        }
    };

    // --- Renderização do Calendário Horizontal (Usando Styles do Tema) ---
    const renderCalendario = () => (
        <div style={{ 
            display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 0 20px 0', 
            scrollbarWidth: 'none', msOverflowStyle: 'none' 
        }}>
            {agendaSemanal.map(dia => {
                const isSelected = diaSelecionadoId === dia.data;
                const hasAulas = dia.aulas && dia.aulas.length > 0;
                
                return (
                    <button
                        key={dia.data}
                        onClick={() => setDiaSelecionadoId(dia.data)}
                        style={{
                            minWidth: '70px', height: '90px', borderRadius: '16px', border: isSelected ? 'none' : `1px solid ${colors.border}`,
                            backgroundColor: isSelected ? colors.primary : colors.white,
                            color: isSelected ? colors.textLight : colors.textDark,
                            boxShadow: isSelected ? `0 4px 12px ${colors.primary}40` : '0 2px 4px rgba(0,0,0,0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: hasAulas ? 1 : 0.6,
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                        }}
                    >
                        <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.8 }}>
                            {formatarSemanaCurto(dia.diaSemana)}
                        </span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                            {formatarDiaCurto(dia.data)}
                        </span>
                        <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: '500' }}>
                            {formatarMesCurto(dia.data)}
                        </span>
                        {hasAulas && !isSelected && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.primary, marginTop: '6px' }} />
                        )}
                    </button>
                );
            })}
        </div>
    );

    const diaAtualAgenda = agendaSemanal.find(d => d.data === diaSelecionadoId);

    return (
        <div style={{ 
            ...styles.app.container, 
            display: 'block', // Override para layout fluido 
            padding: isMobile ? '20px' : '40px',
            minHeight: '100vh'
        }}>
            {toast.show && <ModernToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} styles={styles} />}

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                {/* HEADER */}
                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '-0.5px', color: colors.textDark }}>
                            Studio <span style={{ color: colors.primary }}>Wellness</span>
                        </h1>
                        <p style={{ margin: 0, color: colors.textMuted }}>Gerencie sua rotina de treinos.</p>
                    </div>
                    
                    {/* Switcher de Abas */}
                    <div style={{ 
                        backgroundColor: colors.lightGray, padding: '4px', borderRadius: '30px', 
                        display: 'flex', gap: '4px', border: `1px solid ${colors.border}` 
                    }}>
                        {['agenda', 'minhas-inscricoes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setAbaAtiva(tab)}
                                style={{
                                    padding: '8px 20px', borderRadius: '24px', border: 'none',
                                    backgroundColor: abaAtiva === tab ? colors.white : 'transparent',
                                    color: abaAtiva === tab ? colors.textDark : colors.textMuted,
                                    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                    boxShadow: abaAtiva === tab ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {tab === 'agenda' ? 'Agenda' : 'Minhas Aulas'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTEÚDO */}
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                        <div style={{ 
                            width: '40px', height: '40px', 
                            border: `3px solid ${colors.border}`, 
                            borderTopColor: colors.primary, 
                            borderRadius: '50%', margin: '0 auto 16px', 
                            animation: 'spin 1s linear infinite' 
                        }} />
                        <p>Carregando sua agenda...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        {abaAtiva === 'agenda' && (
                            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                {renderCalendario()}
                                
                                <div style={{ marginTop: '20px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: colors.textDark }}>
                                        Aulas de {diaAtualAgenda ? formatarData(diaAtualAgenda.data) : '...'}
                                    </h3>
                                    
                                    {diaAtualAgenda?.aulas?.length > 0 ? (
                                        diaAtualAgenda.aulas.map((aula, idx) => (
                                            <ClassCard 
                                                key={idx} 
                                                aula={aula} 
                                                dia={diaAtualAgenda} 
                                                onInscricao={(a, d) => setModalConfig({ type: 'CONFIRM', aula: a, dia: d })}
                                                onViewAlunos={(a, d) => setModalConfig({ type: 'ALUNOS', aula: a, dia: d })}
                                                styles={styles}
                                            />
                                        ))
                                    ) : (
                                        <div style={{ 
                                            padding: '60px 20px', textAlign: 'center', backgroundColor: colors.white, 
                                            borderRadius: '16px', border: `2px dashed ${colors.border}`,
                                            color: colors.textMuted
                                        }}>
                                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>💤</div>
                                            <h4 style={{ margin: '0 0 8px 0', color: colors.textDark }}>Day Off!</h4>
                                            <p style={{ margin: 0 }}>Nenhuma aula programada para este dia.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {abaAtiva === 'minhas-inscricoes' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.5s ease' }}>
                                {minhasInscricoes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
                                        Você ainda não se inscreveu em nenhuma aula.
                                    </div>
                                ) : (
                                    minhasInscricoes.map((inscricao) => (
                                        <div key={inscricao.idInscricao} style={{ 
                                            backgroundColor: colors.white, padding: '20px', borderRadius: '16px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                                            border: `1px solid ${colors.borderLight}`,
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.textDark }}>{inscricao.nomeAula}</h4>
                                                    <StatusBadge status={inscricao.status} styles={styles} />
                                                </div>
                                                <p style={{ margin: 0, color: colors.textMuted, fontSize: '13px' }}>
                                                    {formatarData(inscricao.dataAula)} • {formatarHora(inscricao.horarioInicio)}
                                                </p>
                                            </div>
                                            {inscricao.status === 'CONFIRMADA' && (
                                                <button 
                                                    onClick={() => handleCancelarInscricao(inscricao.idInscricao)}
                                                    style={{ 
                                                        color: colors.danger, background: `${colors.danger}20`, border: 'none',
                                                        padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* MODAL CONFIRMAÇÃO */}
            {modalConfig.type === 'CONFIRM' && (
                <ModernModal title="Confirmar Inscrição" onCancel={() => setModalConfig({ type: null, aula: null, dia: null })} styles={styles}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                        <h4 style={{ fontSize: '18px', marginBottom: '8px', color: colors.textDark }}>{modalConfig.aula.modalidade}</h4>
                        <p style={{ color: colors.textMuted, marginBottom: '24px' }}>
                            {formatarData(modalConfig.dia.data)} às {formatarHora(modalConfig.aula.horarioInicio)}
                        </p>
                        
                        <div style={{ backgroundColor: colors.lightGray, padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', textAlign: 'left', border: `1px solid ${colors.border}` }}>
                            <p style={{ margin: '0 0 8px 0', color: colors.textDark }}>✅ <strong>Cancelamento grátis</strong> até 2h antes.</p>
                            <p style={{ margin: 0, color: colors.textDark }}>⚠️ <strong>Chegue cedo:</strong> Tolerância de 10min.</p>
                        </div>

                        <button 
                            onClick={handleConfirmarInscricao}
                            disabled={loadingAction}
                            style={{ 
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                                backgroundColor: colors.primary, color: colors.textLight, fontSize: '16px', fontWeight: '600',
                                cursor: loadingAction ? 'not-allowed' : 'pointer', opacity: loadingAction ? 0.7 : 1
                            }}
                        >
                            {loadingAction ? 'Processando...' : 'Confirmar Presença'}
                        </button>
                    </div>
                </ModernModal>
            )}

            {/* MODAL ALUNOS */}
            {modalConfig.type === 'ALUNOS' && (
                <ModernModal title="Lista de Presença" onCancel={() => setModalConfig({ type: null, aula: null, dia: null })} styles={styles}>
                    {(!modalConfig.aula.alunosInscritos || modalConfig.aula.alunosInscritos.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>
                            Ninguém confirmado ainda. Seja o primeiro! 🥇
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {modalConfig.aula.alunosInscritos.map((aluno, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderBottom: `1px solid ${colors.borderLight}` }}>
                                    <div style={{ 
                                        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${colors.primary}20`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: colors.primary
                                    }}>
                                        {aluno.nome.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: '500', color: colors.textDark }}>{aluno.nome}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </ModernModal>
            )}
        </div>
    );
};

export default Aulas;