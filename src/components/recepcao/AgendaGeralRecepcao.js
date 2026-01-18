import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import { 
    FiCalendar, FiActivity, FiClock, FiUser, FiDollarSign, 
    FiCheckCircle, FiXCircle, FiMoreVertical, FiFilter, FiAlertCircle 
} from 'react-icons/fi';

// =================================================================
// 🎨 UI COMPONENTS
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

// Badge de Status (CORRIGIDO)
const StatusBadge = ({ status, styles }) => {
    // 1. Proteção contra nulos/undefined
    if (!status) {
        return (
            <span style={{ 
                padding: '6px 12px', borderRadius: '20px', 
                backgroundColor: styles.colors.lightGray, color: styles.colors.textMuted,
                fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', 
                display: 'flex', alignItems: 'center', gap: '6px'
            }}>
                <FiAlertCircle /> INDEFINIDO
            </span>
        );
    }

    // 2. Garante que é string
    const statusStr = String(status); 
    const statusUpper = statusStr.toUpperCase();

    let bg = styles.colors.lightGray; 
    let color = styles.colors.textMuted; 
    let icon = <FiClock />;

    if (statusUpper.includes('AGENDAD')) { bg = '#e0f2fe'; color = '#0284c7'; icon = <FiCalendar />; }
    else if (statusUpper.includes('CONCLUID') || statusUpper.includes('FECHAD') || statusUpper.includes('REALIZAD') || statusUpper.includes('RESULTADO_DISPONIVEL')) { bg = '#dcfce7'; color = '#16a34a'; icon = <FiCheckCircle />; }
    else if (statusUpper.includes('CANCELAD')) { bg = '#fee2e2'; color = '#dc2626'; icon = <FiXCircle />; }
    else if (statusUpper.includes('AGUARDANDO') || statusUpper.includes('EM_ANALISE')) { bg = '#fef9c3'; color = '#ca8a04'; icon = <FiClock />; }
    else if (statusUpper.includes('EM_ATENDIMENTO')) { bg = '#f3e8ff'; color = '#9333ea'; icon = <FiActivity />; }

    return (
        <span style={{ 
            padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, 
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', 
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
        }}>
            {icon} {statusStr.replace(/_/g, ' ')}
        </span>
    );
};

// Card da Agenda
const AgendaCard = ({ item, tipo, onClick, styles }) => {
    const isConsulta = tipo === 'consultas';
    const nomePaciente = isConsulta 
        ? item.dataDetalhesPaciente?.dataDetalhesPessoa?.nome 
        : item.nomePaciente;
    
    const nomeMedico = isConsulta
        ? item.dataDetalhesMedico?.dataDetalhesPessoa?.nome
        : item.medico?.dataDetalhesPessoa?.nome;

    // Tratamento seguro de datas
    const dataItem = isConsulta ? item.data : item.dataPedido;
    let hora = '--:--';
    let dataFormatada = '--/--';

    if (dataItem) {
        const dataObj = new Date(dataItem);
        if (!isNaN(dataObj)) {
            hora = dataObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            dataFormatada = dataObj.toLocaleDateString();
        }
    }

    const valor = isConsulta ? item.valorConsulta : item.valorTotal;
    
    // Tratamento seguro do status para passar ao componente filho
    const statusRaw = isConsulta ? item.statusConsula : item.status;

    return (
        <div 
            onClick={onClick}
            style={{
                backgroundColor: styles.colors.white, borderRadius: '16px', padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex', gap: '20px', alignItems: 'center'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
            }}
        >
            {/* Coluna Horário */}
            <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '10px', backgroundColor: `${styles.colors.primary}10`, borderRadius: '12px',
                minWidth: '70px', color: styles.colors.primary
            }}>
                <span style={{ fontSize: '18px', fontWeight: '800' }}>{hora}</span>
                <span style={{ fontSize: '11px', fontWeight: '600' }}>{dataFormatada.slice(0, 5)}</span>
            </div>

            {/* Coluna Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: styles.colors.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {nomePaciente || 'Paciente Desconhecido'}
                    </h4>
                    <StatusBadge status={statusRaw} styles={styles} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: styles.colors.textMuted }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiUser size={14} /> Dr(a). {nomeMedico || 'Não informado'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiDollarSign size={14} /> 
                        {valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                        {!isConsulta && <span style={{ marginLeft: '10px', fontSize: '11px', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{item.itens?.length || 0} exames</span>}
                    </span>
                </div>
            </div>

            {/* Ação */}
            <div style={{ color: styles.colors.textMuted }}>
                <FiMoreVertical size={20} />
            </div>
        </div>
    );
};

// =================================================================
// 🖥️ COMPONENTE PRINCIPAL
// =================================================================

const AgendaGeralRecepcao = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // States
    const [aba, setAba] = useState('consultas'); // 'consultas' | 'exames'
    const [statusFilter, setStatusFilter] = useState('TODAS');
    const [statusOptions, setStatusOptions] = useState([]);
    
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal
    const [modalAberto, setModalAberto] = useState(false);
    const [itemSelecionado, setItemSelecionado] = useState(null);

    // --- FETCHING ---
    const carregarStatus = useCallback(async () => {
        const endpoint = aba === 'consultas' ? '/recepcao/agenda/consulta/status' : '/recepcao/agenda/pedidoexame/status';
        try {
            const response = await api.get(endpoint);
            setStatusOptions(['TODAS', ...(response.data || [])]);
            setStatusFilter('TODAS'); 
        } catch (error) { 
            console.error('Erro status:', error); 
            setStatusOptions(['TODAS']);
        }
    }, [aba]);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = aba === 'consultas' 
                ? `/recepcao/agenda/consulta/${statusFilter}` 
                : `/recepcao/agenda/pedidoexame/${statusFilter}`;
            
            const response = await api.get(endpoint);
            setDados(response.data || []);
        } catch (error) { 
            console.error('Erro dados:', error); 
            setDados([]); 
        }
        finally { setLoading(false); }
    }, [aba, statusFilter]);

    useEffect(() => { carregarStatus(); }, [carregarStatus]);
    useEffect(() => { carregarDados(); }, [carregarDados]);

    // --- ACTIONS ---
    const executarAcao = async (acao) => {
        if (!itemSelecionado) return;
        const confirmMsg = acao === 'cancelar' ? 'Tem certeza que deseja cancelar?' : 'Confirmar ação?';
        if (!window.confirm(confirmMsg)) return;

        try {
            // Lógica de endpoints (Ajuste com suas rotas reais)
            if (aba === 'consultas') {
                if (acao === 'confirmar') await api.patch(`/recepcao/consulta/${itemSelecionado.id}/confirmar`); // Rota exemplo
                if (acao === 'cancelar') await api.patch(`/recepcao/consulta/${itemSelecionado.id}/cancelar`);
            } else {
                // Lógica para exames
                if (acao === 'cancelar') await api.patch(`/recepcao/pedidoexame/${itemSelecionado.id}/cancelar`);
            }
            alert('Ação realizada com sucesso!');
            setModalAberto(false);
            carregarDados();
        } catch (error) {
            alert('Erro ao executar ação: ' + (error.response?.data?.message || 'Erro desconhecido'));
            console.error(error);
        }
    };

    // --- RENDER ---
    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                        Agenda <span style={{ color: styles.colors.primary }}>Geral</span>
                    </h1>
                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Acompanhe todos os agendamentos da clínica.</p>
                </div>

                {/* Controles (Abas e Filtros) */}
                <div style={{ 
                    backgroundColor: styles.colors.white, borderRadius: '20px', padding: '15px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px',
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: '15px'
                }}>
                    {/* Abas */}
                    <div style={{ display: 'flex', backgroundColor: styles.colors.background, padding: '5px', borderRadius: '12px', width: isMobile ? '100%' : 'auto' }}>
                        <button 
                            onClick={() => setAba('consultas')}
                            style={{ 
                                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                                backgroundColor: aba === 'consultas' ? styles.colors.white : 'transparent',
                                color: aba === 'consultas' ? styles.colors.primary : styles.colors.textMuted,
                                boxShadow: aba === 'consultas' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                flex: isMobile ? 1 : 'initial', transition: 'all 0.2s'
                            }}
                        >
                            📅 Consultas
                        </button>
                        <button 
                            onClick={() => setAba('exames')}
                            style={{ 
                                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                                backgroundColor: aba === 'exames' ? styles.colors.white : 'transparent',
                                color: aba === 'exames' ? styles.colors.primary : styles.colors.textMuted,
                                boxShadow: aba === 'exames' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                flex: isMobile ? 1 : 'initial', transition: 'all 0.2s'
                            }}
                        >
                            🧪 Exames
                        </button>
                    </div>

                    {/* Filtro Status */}
                    <div style={{ position: 'relative', width: isMobile ? '100%' : '250px' }}>
                        <FiFilter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: styles.colors.textMuted }} />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                                border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white,
                                color: styles.colors.textDark, fontSize: '14px', outline: 'none', appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt} value={opt}>{String(opt).replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: styles.colors.textMuted }}>Carregando agenda...</div>
                ) : dados.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', gap: '15px' }}>
                        {dados.map(item => (
                            <AgendaCard 
                                key={item.id} 
                                item={item} 
                                tipo={aba} 
                                styles={styles} 
                                onClick={() => { setItemSelecionado(item); setModalAberto(true); }} 
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: styles.colors.white, borderRadius: '20px', border: `2px dashed ${styles.colors.border}` }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                        <p style={{ color: styles.colors.textMuted }}>Nenhum agendamento encontrado para este status.</p>
                    </div>
                )}
            </div>

            {/* Modal de Detalhes e Ações */}
            {modalAberto && itemSelecionado && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: styles.colors.background, borderRadius: '24px', width: '100%', maxWidth: '500px',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'scaleUp 0.3s ease-out'
                    }}>
                        {/* Header Modal */}
                        <div style={{ padding: '20px 24px', backgroundColor: styles.colors.primary, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>
                                {aba === 'consultas' ? 'Detalhes da Consulta' : 'Detalhes do Exame'}
                            </h3>
                            <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>

                        {/* Body Modal */}
                        <div style={{ padding: '25px' }}>
                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: styles.colors.white, borderRadius: '12px', border: `1px solid ${styles.colors.borderLight}` }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <span style={{ fontSize: '12px', color: styles.colors.textMuted, textTransform: 'uppercase', fontWeight: 'bold' }}>Paciente</span>
                                    <div style={{ fontSize: '16px', color: styles.colors.textDark, fontWeight: '600' }}>
                                        {aba === 'consultas' ? itemSelecionado.dataDetalhesPaciente?.dataDetalhesPessoa?.nome : itemSelecionado.nomePaciente}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', color: styles.colors.textMuted, textTransform: 'uppercase', fontWeight: 'bold' }}>Data</span>
                                        <div style={{ color: styles.colors.textDark }}>
                                            {itemSelecionado[aba === 'consultas' ? 'data' : 'dataPedido'] ? new Date(aba === 'consultas' ? itemSelecionado.data : itemSelecionado.dataPedido).toLocaleString() : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '12px', color: styles.colors.textMuted, textTransform: 'uppercase', fontWeight: 'bold' }}>Valor</span>
                                        <div style={{ color: styles.colors.success, fontWeight: '700' }}>
                                            {(aba === 'consultas' ? itemSelecionado.valorConsulta : itemSelecionado.valorTotal)?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <span style={{ fontSize: '12px', color: styles.colors.textMuted, textTransform: 'uppercase', fontWeight: 'bold' }}>Status Atual</span>
                                    <div style={{ marginTop: '5px' }}>
                                        <StatusBadge status={aba === 'consultas' ? itemSelecionado.statusConsula : itemSelecionado.status} styles={styles} />
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ margin: '0 0 10px 0', color: styles.colors.textDark, fontSize: '14px' }}>Ações Rápidas</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button 
                                    onClick={() => executarAcao('confirmar')}
                                    style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    ✅ Confirmar Presença
                                </button>
                                <button 
                                    onClick={() => executarAcao('cancelar')}
                                    style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    ❌ Cancelar Agendamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
};

export default AgendaGeralRecepcao;