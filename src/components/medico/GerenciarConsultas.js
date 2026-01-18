import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import { 
    FiCalendar, FiClock, FiUser, FiVideo, FiMapPin, 
    FiCheckCircle, FiXCircle, FiAlertCircle, FiExternalLink, FiPlay 
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

// Chip de Filtro
const FilterChip = ({ label, active, onClick, styles }) => (
    <button 
        onClick={onClick}
        style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none',
            backgroundColor: active ? styles.colors.primary : styles.colors.lightGray,
            color: active ? '#fff' : styles.colors.textMuted,
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        }}
    >
        {label}
    </button>
);

// Botão de Ação
const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary', fullWidth, icon }) => {
    let bg = styles.colors.primary;
    let color = '#fff';

    if (variant === 'video') { bg = '#7c3aed'; color = '#fff'; }
    if (variant === 'success') { bg = styles.colors.success; color = '#fff'; }
    if (disabled) { bg = styles.colors.lightGray; color = styles.colors.textMuted; }

    return (
        <button 
            onClick={onClick} disabled={disabled || loading}
            style={{
                width: fullWidth ? '100%' : 'auto',
                padding: '10px 20px', borderRadius: '12px', border: 'none',
                backgroundColor: bg, color: color,
                fontSize: '14px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: !disabled ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            {loading && <span className="spinner" />}
            {!loading && icon}
            {children}
            <style>{`.spinner { width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; borderRadius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
    );
};

// Badge de Status
const StatusBadge = ({ status, styles }) => {
    let bg = styles.colors.lightGray; let color = styles.colors.textMuted; let icon = null;
    
    if (['AGENDADA', 'CONFIRMADA'].includes(status)) { bg = `${styles.colors.primary}20`; color = styles.colors.primary; icon = <FiCalendar />; }
    if (['CONCLUIDA', 'FECHADA', 'REALIZADA'].includes(status)) { bg = `${styles.colors.success}20`; color = styles.colors.success; icon = <FiCheckCircle />; }
    if (['CANCELADA'].includes(status)) { bg = `${styles.colors.danger}20`; color = styles.colors.danger; icon = <FiXCircle />; }

    return (
        <span style={{ 
            padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, 
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', 
            display: 'flex', alignItems: 'center', gap: '6px'
        }}>
            {icon} {status}
        </span>
    );
};

// Card de Consulta
const ConsultationCard = ({ consulta, onStart, styles, isMobile }) => {
    const { data, hora } = formatarDataHora(consulta.data);
    const nomePaciente = consulta.dataDetalhesPaciente?.dataDetalhesPessoa?.nome || 'Paciente não informado';
    const temTelemedicina = !!consulta.linkTelemedicina;
    const isOnline = consulta.tipoConsulta === 'ONLINE' || temTelemedicina; // Fallback se não tiver tipoConsulta

    return (
        <div style={{
            backgroundColor: styles.colors.white, borderRadius: '20px', padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
            transition: 'transform 0.2s ease', marginBottom: '20px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ 
                        width: '50px', height: '50px', borderRadius: '14px', 
                        backgroundColor: `${styles.colors.primary}10`, color: styles.colors.primary,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', lineHeight: '1.2'
                    }}>
                        <span style={{ fontSize: '18px' }}>{data.split(' de ')[0]}</span>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{data.split(' de ')[1].substring(0,3)}</span>
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: styles.colors.textDark }}>{nomePaciente}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: styles.colors.textMuted, marginTop: '4px' }}>
                            <FiClock /> {hora}
                            <span>•</span>
                            {isOnline ? <><FiVideo /> Online</> : <><FiMapPin /> Presencial</>}
                        </div>
                    </div>
                </div>
                <StatusBadge status={consulta.statusConsula} styles={styles} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: `1px solid ${styles.colors.borderLight}`, paddingTop: '20px', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end' }}>
                {temTelemedicina && (
                    <ActionButton 
                        variant="video" fullWidth={isMobile} icon={<FiExternalLink />} styles={styles}
                        onClick={() => window.open(consulta.linkTelemedicina, '_blank')}
                    >
                        Telemedicina
                    </ActionButton>
                )}
                
                {consulta.statusConsula === 'AGENDADA' && (
                    <ActionButton 
                        variant="success" fullWidth={isMobile} icon={<FiPlay />} styles={styles}
                        onClick={() => onStart(consulta)}
                    >
                        Iniciar Atendimento
                    </ActionButton>
                )}
            </div>
        </div>
    );
};

// Helper
const formatarDataHora = (dataString) => {
    if (!dataString) return { data: '-', hora: '-' };
    const d = new Date(dataString);
    return {
        data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
        hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
};

// =================================================================
// 🩺 COMPONENTE PRINCIPAL
// =================================================================

const GerenciarConsultas = ({ onIniciarConsulta }) => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // States
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusDisponiveis, setStatusDisponiveis] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("TODAS");
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);

    // Data Fetching
    useEffect(() => {
        api.get('/medico/consulta/statusUnico')
           .then(res => setStatusDisponiveis(["TODAS", ...(res.data || [])]))
           .catch(err => console.error("Erro status:", err));
    }, []);

    const fetchConsultas = useCallback(async (status, page) => {
        setLoading(true);
        try {
            const res = await api.get(`/medico/consulta/status/${status}`, { params: { page, size: 6 } });
            setConsultas(res.data.content || []);
            setTotalPaginas(res.data.totalPages || 0);
            setPaginaAtual(res.data.number || 0);
        } catch (error) { console.error("Erro consultas:", error); setConsultas([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchConsultas(selectedStatus, paginaAtual); }, [selectedStatus, paginaAtual, fetchConsultas]);

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                        Minhas <span style={{ color: styles.colors.primary }}>Consultas</span>
                    </h1>
                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Gerencie sua agenda e inicie atendimentos.</p>
                </div>

                {/* Filtros Modernos (Chips) */}
                <div style={{ 
                    display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px',
                    scrollbarWidth: 'none', msOverflowStyle: 'none'
                }}>
                    {statusDisponiveis.map((status) => (
                        <FilterChip 
                            key={status} label={status} active={selectedStatus === status} styles={styles}
                            onClick={() => { setSelectedStatus(status); setPaginaAtual(0); }}
                        />
                    ))}
                </div>

                {/* Lista de Consultas */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: styles.colors.textMuted }}>
                         <div style={{ width: '40px', height: '40px', border: `3px solid ${styles.colors.border}`, borderTopColor: styles.colors.primary, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                         Carregando agenda...
                         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : consultas.length > 0 ? (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        {consultas.map(consulta => (
                            <ConsultationCard 
                                key={consulta.id} consulta={consulta} 
                                onStart={onIniciarConsulta} styles={styles} isMobile={isMobile}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: styles.colors.white, borderRadius: '24px', border: `2px dashed ${styles.colors.border}` }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3 style={{ margin: '0 0 8px 0', color: styles.colors.textDark }}>Sem consultas</h3>
                        <p style={{ margin: 0, color: styles.colors.textMuted }}>Nenhum agendamento encontrado para este status.</p>
                    </div>
                )}

                {/* Paginação */}
                {totalPaginas > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                        <ActionButton variant="secondary" disabled={paginaAtual === 0} onClick={() => setPaginaAtual(p => p - 1)} styles={styles}>Anterior</ActionButton>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: styles.colors.textMuted }}>{paginaAtual + 1} / {totalPaginas}</span>
                        <ActionButton variant="secondary" disabled={paginaAtual + 1 >= totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} styles={styles}>Próxima</ActionButton>
                    </div>
                )}

            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default GerenciarConsultas;