import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { generateStyles } from '../styles/globalStyles';
import api from '../api/api';

import { 
    FiMenu, FiX, FiCalendar, FiMapPin, FiUser, FiClock, 
    FiCheckCircle, FiTruck, FiRefreshCw, FiAlertTriangle, 
    FiHome, FiMap, FiDroplet, FiDollarSign, FiFileText,
    FiInfo, FiChevronDown, FiChevronUp, FiFilter, FiClipboard
} from 'react-icons/fi';

// =================================================================
// 🎨 DEFINIÇÃO DA COR DA ROLE (COLETA)
// =================================================================
const ROLE_COLOR = '#06b6d4'; // Ciano (Coleta)
const ROLE_BG_TINT = '#06b6d415'; // Ciano suave

// =================================================================
// 🎨 UI COMPONENTS
// =================================================================

const SidebarItem = ({ icon, label, active, onClick, styles }) => (
    <li 
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 20px', margin: '4px 12px', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.2s ease',
            backgroundColor: active ? ROLE_BG_TINT : 'transparent',
            color: active ? ROLE_COLOR : styles.colors.textMuted,
            fontWeight: active ? '700' : '500',
            borderLeft: active ? `4px solid ${ROLE_COLOR}` : '4px solid transparent'
        }}
    >
        <span style={{ fontSize: '20px', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '14px' }}>{label}</span>
    </li>
);

// Card de Estatística (Topo da Agenda)
const StatCard = ({ title, value, icon, styles, color }) => (
    <div style={{
        backgroundColor: styles.colors.white, padding: '20px', borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
        display: 'flex', alignItems: 'center', gap: '15px', flex: 1
    }}>
        <div style={{
            width: '45px', height: '45px', borderRadius: '12px',
            backgroundColor: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: styles.colors.textDark }}>{value}</div>
            <div style={{ fontSize: '12px', color: styles.colors.textMuted, textTransform: 'uppercase', fontWeight: '600' }}>{title}</div>
        </div>
    </div>
);

const Toast = ({ message, type, onClose, styles }) => (
    <div style={{
        position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', 
        borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 1001,
        backgroundColor: styles.colors.white,
        borderLeft: `5px solid ${type === 'success' ? styles.colors.success : styles.colors.danger}`,
        color: styles.colors.textDark,
        display: 'flex', alignItems: 'center', gap: '15px', maxWidth: 'calc(100% - 40px)',
        animation: 'slideIn 0.3s ease-out'
    }}>
        {type === 'success' ? <FiCheckCircle color={styles.colors.success} /> : <FiAlertTriangle color={styles.colors.danger} />}
        <span style={{ fontWeight: '500' }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: styles.colors.textMuted, fontSize: '18px', cursor: 'pointer', marginLeft: 'auto' }}>&times;</button>
    </div>
);

const DetalhesExames = ({ itens, styles }) => {
    if (!itens || itens.length === 0) return null;
    return (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: styles.colors.background, borderRadius: '12px', border: `1px solid ${styles.colors.borderLight}` }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: styles.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Itens do Pedido</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {itens.map((item) => (
                    <div key={item.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px', backgroundColor: styles.colors.white, borderRadius: '8px',
                        border: `1px solid ${styles.colors.borderLight}`
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: styles.colors.textDark }}>{item.nomeExame}</span>
                            <span style={{ fontSize: '0.75rem', color: item.status === 'CONCLUIDO' ? styles.colors.success : styles.colors.textMuted }}>{item.status.replace('_', ' ')}</span>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: ROLE_COLOR }}>R$ {item.valor?.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// =================================================================
// 📅 COMPONENTE DA AGENDA
// =================================================================
const MinhaAgenda = ({ styles, mostrarToast, tipoColeta }) => {
    const { colors } = styles; // Aqui usamos 'colors', 'app' não é estritamente necessário aqui, mas é passado.
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
    const [itensExpandidos, setItensExpandidos] = useState(new Set());

    const fetchAgenda = useCallback(async () => {
        setLoading(true);
        try {
            let finalAgenda = [];
            const params = { data: dataSelecionada };

            if (tipoColeta === 'TODAS') {
                const [domiciliarRes, presencialRes] = await Promise.all([
                    api.get('/coletor/agenda/DOMICILIAR', { params }),
                    api.get('/coletor/agenda/PRESENCIAL', { params })
                ]);
                finalAgenda = [...(domiciliarRes.data || []), ...(presencialRes.data || [])];
            } else {
                const response = await api.get(`/coletor/agenda/${tipoColeta}`, { params });
                finalAgenda = response.data || [];
            }
            
            finalAgenda.sort((a, b) => new Date(a.dataHoraAgendada) - new Date(b.dataHoraAgendada));
            setAgenda(finalAgenda);
        } catch (err) {
            mostrarToast("Erro ao carregar agenda.", "error");
        } finally {
            setLoading(false);
        }
    }, [tipoColeta, dataSelecionada, mostrarToast]);

    useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

    const handleStatusUpdate = async (id, acao) => {
        const endpoint = acao === 'INICIAR' ? `/coletor/agenda/${id}/iniciar-deslocamento` : `/coletor/agenda/${id}/confirmar-coleta`;
        const novoStatus = acao === 'INICIAR' ? 'A_CAMINHO' : 'REALIZADO';
        try {
            await api.put(endpoint);
            setAgenda(prev => prev.map(ag => ag.id === id ? { ...ag, status: novoStatus } : ag));
            mostrarToast(acao === 'INICIAR' ? "Deslocamento iniciado!" : "Coleta realizada com sucesso!", 'success');
        } catch (err) {
            mostrarToast("Erro ao atualizar status.", "error");
        }
    };

    const getStatusInfo = (status) => {
        switch(status) {
            case 'REALIZADO': return { label: 'Realizado', color: colors.success, bg: '#dcfce7' };
            case 'A_CAMINHO': return { label: 'A Caminho', color: '#d97706', bg: '#fef3c7' }; // Amarelo escuro
            case 'AGENDADO': return { label: 'Agendado', color: ROLE_COLOR, bg: ROLE_BG_TINT };
            default: return { label: status, color: colors.textMuted, bg: colors.lightGray };
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
            {/* Header da Página */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.textDark, marginBottom: '10px' }}>
                    Agenda <span style={{ color: ROLE_COLOR }}>{tipoColeta === 'TODAS' ? 'Geral' : tipoColeta === 'DOMICILIAR' ? 'Domiciliar' : 'Unidade'}</span>
                </h1>
                
                {/* Controles de Data e Atualização */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: colors.white, padding: '10px', borderRadius: '12px', border: `1px solid ${colors.borderLight}`, width: 'fit-content' }}>
                    <FiCalendar color={ROLE_COLOR} />
                    <input 
                        type="date" 
                        value={dataSelecionada} 
                        onChange={(e) => setDataSelecionada(e.target.value)}
                        style={{ border: 'none', outline: 'none', color: colors.textDark, backgroundColor: 'transparent', fontSize: '14px', fontWeight: '600' }}
                    />
                    <div style={{ width: '1px', height: '20px', backgroundColor: colors.borderLight, margin: '0 10px' }} />
                    <button onClick={fetchAgenda} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ROLE_COLOR, display: 'flex', alignItems: 'center' }}>
                        <FiRefreshCw />
                    </button>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <StatCard title="Total" value={agenda.length} icon={<FiClipboard />} styles={styles} color={ROLE_COLOR} />
                <StatCard title="Pendentes" value={agenda.filter(a => a.status === 'AGENDADO').length} icon={<FiClock />} styles={styles} color={colors.primary} />
                <StatCard title="Realizadas" value={agenda.filter(a => a.status === 'REALIZADO').length} icon={<FiCheckCircle />} styles={styles} color={colors.success} />
            </div>

            {/* Lista de Agenda */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Carregando agenda...</div>
            ) : agenda.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: colors.white, borderRadius: '20px', border: `2px dashed ${colors.borderLight}` }}>
                    <FiCalendar size={40} color={colors.border} style={{ marginBottom: '10px' }} />
                    <p style={{ color: colors.textMuted }}>Nenhuma coleta agendada para hoje.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {agenda.map(ag => {
                        const statusInfo = getStatusInfo(ag.status);
                        const isExpanded = itensExpandidos.has(ag.id);
                        const IconeLocal = ag.tipoColeta === 'DOMICILIAR' ? FiHome : FiMap;

                        return (
                            <div key={ag.id} style={{
                                backgroundColor: colors.white, borderRadius: '16px',
                                border: `1px solid ${colors.borderLight}`,
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                overflow: 'hidden', position: 'relative'
                            }}>
                                {/* Barra lateral colorida baseada no status */}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: statusInfo.color }} />

                                <div style={{ padding: '20px 20px 20px 30px' }}>
                                    {/* Header do Card */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div style={{ backgroundColor: `${ROLE_COLOR}10`, padding: '10px', borderRadius: '10px', color: ROLE_COLOR, textAlign: 'center', minWidth: '70px' }}>
                                                <div style={{ fontWeight: '800', fontSize: '18px' }}>
                                                    {new Date(ag.dataHoraAgendada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div style={{ fontSize: '11px', fontWeight: '600' }}>HORÁRIO</div>
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '16px', color: colors.textDark }}>{ag.nomePaciente}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: colors.textMuted, fontSize: '13px' }}>
                                                    <IconeLocal size={14} />
                                                    {ag.tipoColeta === 'DOMICILIAR' ? ag.enderecoCompleto : ag.nomeUnidade}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <span style={{ 
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                                            backgroundColor: statusInfo.bg, color: statusInfo.color, display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Ações e Detalhes */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: `1px solid ${colors.borderLight}`, paddingTop: '15px', flexWrap: 'wrap', gap: '15px' }}>
                                        <button 
                                            onClick={() => {
                                                const newSet = new Set(itensExpandidos);
                                                isExpanded ? newSet.delete(ag.id) : newSet.add(ag.id);
                                                setItensExpandidos(newSet);
                                            }}
                                            style={{ background: 'none', border: 'none', color: ROLE_COLOR, cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                            {isExpanded ? 'Ocultar Pedido' : 'Ver Pedido'}
                                        </button>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {ag.status === 'AGENDADO' && ag.tipoColeta === 'DOMICILIAR' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(ag.id, 'INICIAR')}
                                                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <FiTruck /> Iniciar Rota
                                                </button>
                                            )}
                                            {(ag.status === 'A_CAMINHO' || (ag.status === 'AGENDADO' && ag.tipoColeta !== 'DOMICILIAR')) && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(ag.id, 'CONFIRMAR')}
                                                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: colors.success, color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <FiCheckCircle /> Confirmar Coleta
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <DetalhesExames itens={ag.dataPedidoExame?.itens} styles={styles} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// =================================================================
// 🖥️ DASHBOARD COLETA (SHELL)
// =================================================================
const DashboardColeta = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    
    // ✨ CORREÇÃO AQUI: Extraindo 'app' junto com 'colors'
    const { colors, app } = styles; 
    
    const dashboardBgColor = isDarkMode ? '#121212' : '#f3f4f6';

    const [opcaoSelecionada, setOpcaoSelecionada] = useState('TODAS');
    const [menuAberto, setMenuAberto] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const mostrarToast = useCallback((message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setMenuAberto(true);
            else setMenuAberto(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuClick = (key) => {
        setOpcaoSelecionada(key);
        if (isMobile) setMenuAberto(false);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: dashboardBgColor, overflow: 'hidden' }}>
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} styles={styles} />}
            
            {/* Overlay Mobile */}
            {isMobile && menuAberto && (
                <div onClick={() => setMenuAberto(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '280px', backgroundColor: colors.white, height: '100%',
                position: isMobile ? 'fixed' : 'relative',
                left: isMobile && !menuAberto ? '-280px' : '0',
                transition: 'left 0.3s ease', zIndex: 999,
                display: 'flex', flexDirection: 'column',
                borderRight: `1px solid ${colors.borderLight}`,
                boxShadow: isMobile && menuAberto ? '4px 0 20px rgba(0,0,0,0.1)' : 'none'
            }}>
                <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: ROLE_COLOR, letterSpacing: '-0.5px' }}>medMais</h2>
                        <span style={{ fontSize: '11px', color: colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700' }}>Coleta</span>
                    </div>
                    {isMobile && <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', color: colors.textMuted }}><FiX size={24} /></button>}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
                    <SidebarItem icon={<FiCalendar />} label="Agenda Geral" active={opcaoSelecionada === 'TODAS'} onClick={() => handleMenuClick('TODAS')} styles={styles} />
                    <div style={{ height: '1px', backgroundColor: colors.borderLight, margin: '10px 20px' }} />
                    <SidebarItem icon={<FiHome />} label="Domiciliar" active={opcaoSelecionada === 'DOMICILIAR'} onClick={() => handleMenuClick('DOMICILIAR')} styles={styles} />
                    <SidebarItem icon={<FiMap />} label="Na Unidade" active={opcaoSelecionada === 'PRESENCIAL'} onClick={() => handleMenuClick('PRESENCIAL')} styles={styles} />
                </ul>

                <div style={{ padding: '20px', borderTop: `1px solid ${colors.borderLight}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: dashboardBgColor, borderRadius: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: ROLE_COLOR, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiUser />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: colors.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Coletor</p>
                            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>Logado</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main style={{ flex: 1, overflowY: 'auto', position: 'relative', width: '100%' }}>
                {isMobile && (
                    <div style={{ padding: '15px 20px', backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.borderLight}`, position: 'sticky', top: 0, zIndex: 900 }}>
                        <span style={{ fontWeight: '800', color: ROLE_COLOR }}>medMais</span>
                        <button onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', color: colors.textDark }}><FiMenu size={24} /></button>
                    </div>
                )}
                {/* Passo 'app' para o componente filho */}
                <MinhaAgenda styles={{colors, app}} mostrarToast={mostrarToast} tipoColeta={opcaoSelecionada} />
            </main>
        </div>
    );
};

export default DashboardColeta;