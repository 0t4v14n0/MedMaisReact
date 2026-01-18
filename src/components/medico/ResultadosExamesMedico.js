import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import { 
    FiSearch, FiFilter, FiDownload, FiEye, FiUser, FiCalendar, 
    FiFileText, FiActivity, FiX, FiCheckCircle, FiClock, FiAlertCircle 
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

// Input Moderno
const ModernInput = ({ value, onChange, placeholder, icon, styles }) => (
    <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: styles.colors.textMuted, fontSize: '18px' }}>{icon}</div>
        <input 
            type="text" value={value} onChange={onChange} placeholder={placeholder}
            style={{
                width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px',
                border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white,
                color: styles.colors.textDark, fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.target.style.borderColor = styles.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${styles.colors.primary}15`; }}
            onBlur={(e) => { e.target.style.borderColor = styles.colors.border; e.target.style.boxShadow = 'none'; }}
        />
    </div>
);

// Select Moderno
const ModernSelect = ({ value, onChange, options, icon, styles }) => (
    <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: styles.colors.textMuted, fontSize: '18px' }}>{icon}</div>
        <select 
            value={value} onChange={onChange}
            style={{
                width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px',
                border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white,
                color: styles.colors.textDark, fontSize: '14px', outline: 'none', appearance: 'none',
                cursor: 'pointer', transition: 'all 0.2s'
            }}
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: styles.colors.textMuted }}>▼</div>
    </div>
);

// Badge de Status
const StatusBadge = ({ status, styles }) => {
    let bg = styles.colors.lightGray; let color = styles.colors.textMuted; let icon = <FiClock />; let label = status;

    if (status === 'RESULTADO_DISPONIVEL') { bg = `${styles.colors.success}20`; color = styles.colors.success; icon = <FiCheckCircle />; label = 'Disponível'; }
    else if (status.includes('AGUARDANDO')) { bg = `${styles.colors.warning}20`; color = styles.colors.warning; icon = <FiClock />; label = 'Pendente'; }
    else if (status === 'CANCELADO') { bg = `${styles.colors.danger}20`; color = styles.colors.danger; icon = <FiX />; label = 'Cancelado'; }
    else if (status === 'EM_ANALISE') { bg = `${styles.colors.info || '#3b82f6'}20`; color = styles.colors.info || '#3b82f6'; icon = <FiActivity />; label = 'Em Análise'; }

    return (
        <span style={{ 
            padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, 
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', 
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
        }}>
            {icon} {label}
        </span>
    );
};

// Card de Exame
const ExamCard = ({ exame, onDownload, onView, styles, isMobile }) => {
    const nomePaciente = exame.pedido?.nomePaciente || 'Paciente não identificado';
    const dataResultado = exame.dataResultado ? new Date(exame.dataResultado).toLocaleDateString('pt-BR') : '-';
    const disponivel = exame.status === 'RESULTADO_DISPONIVEL' && exame.urlResultado;

    return (
        <div style={{
            backgroundColor: styles.colors.white, borderRadius: '16px', padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
            transition: 'transform 0.2s ease', display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            gap: '20px', alignItems: isMobile ? 'flex-start' : 'center'
        }}>
            {/* Ícone */}
            <div style={{ 
                width: '50px', height: '50px', borderRadius: '12px', backgroundColor: `${styles.colors.primary}10`, 
                color: styles.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
            }}>
                <FiFileText />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: styles.colors.textDark }}>{exame.nomeExame}</h4>
                    <StatusBadge status={exame.status} styles={styles} />
                </div>
                <div style={{ display: 'flex', gap: '15px', color: styles.colors.textMuted, fontSize: '13px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUser /> {nomePaciente}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiCalendar /> Resultado: {dataResultado}</span>
                </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                <button 
                    onClick={() => onView(exame)}
                    disabled={!disponivel}
                    style={{
                        flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none',
                        backgroundColor: disponivel ? styles.colors.primary : styles.colors.lightGray,
                        color: disponivel ? '#fff' : styles.colors.textMuted, cursor: disponivel ? 'pointer' : 'not-allowed',
                        fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                >
                    <FiEye /> Visualizar
                </button>
                <button 
                    onClick={() => onDownload(exame)}
                    disabled={!disponivel}
                    style={{
                        flex: 1, padding: '10px 16px', borderRadius: '10px', border: `1px solid ${disponivel ? styles.colors.border : 'transparent'}`,
                        backgroundColor: disponivel ? 'transparent' : styles.colors.lightGray,
                        color: disponivel ? styles.colors.textDark : styles.colors.textMuted, cursor: disponivel ? 'pointer' : 'not-allowed',
                        fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                >
                    <FiDownload /> Baixar
                </button>
            </div>
        </div>
    );
};

// =================================================================
// 🩺 COMPONENTE PRINCIPAL
// =================================================================

const ResultadosExamesMedico = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // States
    const [exames, setExames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({ paciente: '', tipo: 'TODOS', status: 'TODOS' });
    const [tiposExame, setTiposExame] = useState(['TODOS']);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    
    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [exameSelecionado, setExameSelecionado] = useState(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        api.get('/exame/all/ativo').then(res => {
            const tipos = res.data.map(e => ({ value: e.nome, label: e.nome }));
            setTiposExame([{ value: 'TODOS', label: 'Todos os Tipos' }, ...tipos]);
        }).catch(console.error);
    }, []);

    const fetchExames = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: paginaAtual,
                size: 8,
                ...(filtros.paciente && { paciente: filtros.paciente }),
                ...(filtros.tipo !== 'TODOS' && { tipoExame: filtros.tipo }),
                ...(filtros.status !== 'TODOS' && { status: filtros.status })
            };
            const res = await api.get('/medico/exames', { params });
            setExames(res.data.content || []);
            setTotalPaginas(res.data.totalPages || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [paginaAtual, filtros]);

    useEffect(() => { fetchExames(); }, [fetchExames]);

    // --- ACTIONS ---
    const handleDownload = async (exame) => {
        try {
            const res = await api.get(`/medico/exames/${exame.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `exame_${exame.nomeExame}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) { alert("Erro ao baixar PDF."); }
    };

    const handleView = (exame) => {
        if (exame.urlResultado) window.open(exame.urlResultado, '_blank');
        else {
            setExameSelecionado(exame);
            setModalOpen(true);
        }
    };

    const opcoesStatus = [
        { value: 'TODOS', label: 'Todos os Status' },
        { value: 'RESULTADO_DISPONIVEL', label: 'Concluídos' },
        { value: 'AGUARDANDO_RESULTADO', label: 'Aguardando Lab.' },
        { value: 'EM_ANALISE', label: 'Em Análise' }
    ];

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                        Resultados de <span style={{ color: styles.colors.primary }}>Exames</span>
                    </h1>
                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Consulte e baixe os laudos dos seus pacientes.</p>
                </div>

                {/* Filtros */}
                <div style={{ backgroundColor: styles.colors.white, borderRadius: '20px', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '15px' }}>
                        <ModernInput 
                            value={filtros.paciente} 
                            onChange={e => setFiltros({...filtros, paciente: e.target.value})} 
                            placeholder="Buscar paciente..." 
                            icon={<FiSearch />} styles={styles} 
                        />
                        <ModernSelect 
                            value={filtros.tipo} 
                            onChange={e => setFiltros({...filtros, tipo: e.target.value})} 
                            options={tiposExame} 
                            icon={<FiFilter />} styles={styles} 
                        />
                        <ModernSelect 
                            value={filtros.status} 
                            onChange={e => setFiltros({...filtros, status: e.target.value})} 
                            options={opcoesStatus} 
                            icon={<FiActivity />} styles={styles} 
                        />
                    </div>
                </div>

                {/* Lista */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: styles.colors.textMuted }}>Carregando resultados...</div>
                ) : exames.length > 0 ? (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {exames.map(exame => (
                            <ExamCard 
                                key={exame.id} exame={exame} 
                                onDownload={handleDownload} onView={handleView} 
                                styles={styles} isMobile={isMobile} 
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: styles.colors.white, borderRadius: '20px', border: `2px dashed ${styles.colors.border}` }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧪</div>
                        <p style={{ color: styles.colors.textMuted }}>Nenhum exame encontrado.</p>
                    </div>
                )}

                {/* Paginação Simples */}
                {totalPaginas > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                        <button onClick={() => setPaginaAtual(p => p - 1)} disabled={paginaAtual === 0} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: styles.colors.white, cursor: 'pointer' }}>Anterior</button>
                        <span style={{ padding: '8px', color: styles.colors.textMuted }}>{paginaAtual + 1} / {totalPaginas}</span>
                        <button onClick={() => setPaginaAtual(p => p + 1)} disabled={paginaAtual + 1 >= totalPaginas} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: styles.colors.white, cursor: 'pointer' }}>Próxima</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultadosExamesMedico;