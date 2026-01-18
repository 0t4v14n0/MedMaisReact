import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// =================================================================
// 🎨 UI COMPONENTS & HELPERS
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

// Select Moderno
const ModernSelect = ({ value, onChange, options, styles, disabled }) => (
    <div style={{ position: 'relative', minWidth: '200px' }}>
        <select 
            value={value} onChange={onChange} disabled={disabled}
            style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: `1px solid ${styles.colors.border}`,
                backgroundColor: styles.colors.white, color: styles.colors.textDark,
                fontSize: '14px', fontWeight: '600', outline: 'none', appearance: 'none', cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: styles.colors.textMuted }}>▼</div>
    </div>
);

// Badge de Status
const TransactionStatusBadge = ({ status, styles }) => {
    let bg = styles.colors.lightGray;
    let color = styles.colors.textMuted;
    let label = status.replace(/_/g, ' ');

    switch (status) {
        case 'CONCLUIDA': 
            bg = `${styles.colors.success}20`; color = styles.colors.success; 
            break;
        case 'PENDENTE': 
        case 'EM_PROCESSAMENTO':
            bg = `${styles.colors.accent}20`; color = styles.colors.accent;
            break;
        case 'CANCELADA': 
        case 'FALHOU':
            bg = `${styles.colors.danger}20`; color = styles.colors.danger; 
            break;
        case 'REEMBOLSADA':
            bg = '#f3e8ff'; color = '#9333ea';
            break;
        default: break;
    }

    return (
        <span style={{ 
            padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, 
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
        }}>
            {label}
        </span>
    );
};

const ActionButton = ({ children, onClick, disabled, styles }) => (
    <button 
        onClick={onClick} disabled={disabled}
        style={{
            padding: '10px 20px', borderRadius: '30px', border: 'none',
            backgroundColor: disabled ? styles.colors.lightGray : 'transparent',
            color: disabled ? styles.colors.textMuted : styles.colors.primary,
            fontSize: '14px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px',
            border: disabled ? 'none' : `1px solid ${styles.colors.primary}40`
        }}
    >
        {children}
    </button>
);

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================

const HistoricoTransacoes = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [statusDisponiveis, setStatusDisponiveis] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("TODAS");
    const [transacoes, setTransacoes] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [carregando, setCarregando] = useState(true);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await api.get("/historicotransacoes/status");
            setStatusDisponiveis(["TODAS", ...(response.data || [])]);
        } catch (error) { console.error("Erro status:", error); }
    }, []);

    const fetchTransacoes = useCallback(async (status, page) => {
        setCarregando(true);
        try {
            const { data } = await api.get(`/historicotransacoes/${status}`, { params: { page, size: 10 } });
            setTransacoes(data.content || []);
            setTotalPaginas(data.totalPages || 0);
            setPaginaAtual(data.number || 0);
        } catch (error) {
            console.error("Erro transações:", error); setTransacoes([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);
    useEffect(() => { fetchTransacoes(selectedStatus, paginaAtual); }, [selectedStatus, paginaAtual, fetchTransacoes]);

    // Lógica para determinar se é positivo (Verde) ou negativo (Vermelho)
    const isPositive = (tipo) => ['CREDITO', 'REEMBOLSO'].includes(tipo);
    
    const formatarData = (dataString) => {
        if (!dataString) return '-';
        const date = new Date(dataString);
        return {
            dia: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            completa: date.toLocaleString('pt-BR')
        };
    };

    const formatarValor = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

    const getIconeTipo = (tipo) => {
        if (tipo === 'CREDITO') return '💰'; 
        if (tipo === 'REEMBOLSO') return '↩️';
        return '💸'; 
    };

    // Card Mobile
    const MobileCard = ({ transacao }) => {
        const positive = isPositive(transacao.tipo);
        const dataFmt = formatarData(transacao.dataTransacao);

        return (
            <div style={{ 
                backgroundColor: colors.white, padding: '20px', borderRadius: '20px', marginBottom: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.borderLight}`,
                display: 'flex', alignItems: 'center', gap: '16px'
            }}>
                <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    backgroundColor: positive ? `${colors.success}15` : `${colors.danger}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                }}>
                    {getIconeTipo(transacao.tipo)}
                </div>
                
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textDark }}>
                            {transacao.descricao || 'Transação'}
                        </span>
                        {/* AQUI APLICAMOS A COR VERDE OU VERMELHA */}
                        <span style={{ 
                            fontSize: '14px', fontWeight: '800', 
                            color: positive ? colors.success : colors.danger 
                        }}>
                            {positive ? '+ ' : '- '} {formatarValor(transacao.valor)}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: colors.textMuted }}>
                            {dataFmt.dia} • {dataFmt.hora}
                        </span>
                        <TransactionStatusBadge status={transacao.status} styles={styles} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ 
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
                    justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', 
                    marginBottom: '30px', gap: '20px' 
                }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: colors.textDark, letterSpacing: '-0.5px' }}>
                            Extrato <span style={{ color: colors.primary }}>Financeiro</span>
                        </h1>
                        <p style={{ margin: 0, color: colors.textMuted }}>Acompanhe seus pagamentos e reembolsos.</p>
                    </div>

                    <ModernSelect 
                        value={selectedStatus} 
                        onChange={(e) => { setSelectedStatus(e.target.value); setPaginaAtual(0); }}
                        options={statusDisponiveis.map(s => ({ value: s, label: s === 'TODAS' ? 'Todos os Status' : s.replace(/_/g, ' ') }))}
                        styles={styles}
                        disabled={carregando}
                    />
                </div>

                {/* Conteúdo */}
                {carregando ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
                         <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.border}`, borderTopColor: colors.primary, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                         Carregando movimentações...
                         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : transacoes.length > 0 ? (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        
                        {isMobile ? (
                            <div>
                                {transacoes.map(t => <MobileCard key={t.id} transacao={t} />)}
                            </div>
                        ) : (
                            <div style={{ 
                                backgroundColor: colors.white, borderRadius: '24px', overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${colors.borderLight}`
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: colors.lightGray }}>
                                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>Data</th>
                                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>Descrição / Tipo</th>
                                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'center' }}>Status</th>
                                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'right' }}>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transacoes.map((t, idx) => {
                                            const positive = isPositive(t.tipo);
                                            const dataFmt = formatarData(t.dataTransacao);
                                            return (
                                                <tr key={t.id} style={{ 
                                                    borderBottom: idx === transacoes.length - 1 ? 'none' : `1px solid ${colors.borderLight}`,
                                                    transition: 'background-color 0.2s' 
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.primary}05`}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <td style={{ padding: '20px', color: colors.textDark, fontSize: '14px' }}>
                                                        <div style={{ fontWeight: '600' }}>{dataFmt.dia}</div>
                                                        <div style={{ fontSize: '12px', color: colors.textMuted }}>{dataFmt.hora}</div>
                                                    </td>
                                                    <td style={{ padding: '20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ 
                                                                width: '36px', height: '36px', borderRadius: '10px', 
                                                                backgroundColor: positive ? `${colors.success}10` : `${colors.danger}10`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                                                            }}>
                                                                {getIconeTipo(t.tipo)}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: colors.textDark }}>{t.descricao || 'Transação'}</div>
                                                                <div style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'capitalize' }}>{t.tipo.toLowerCase()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '20px', textAlign: 'center' }}>
                                                        <TransactionStatusBadge status={t.status} styles={styles} />
                                                    </td>
                                                    {/* AQUI APLICAMOS A COR VERDE OU VERMELHA */}
                                                    <td style={{ padding: '20px', textAlign: 'right', fontWeight: '800', fontSize: '15px', color: positive ? colors.success : colors.danger }}>
                                                        {positive ? '+ ' : '- '} {formatarValor(t.valor)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Paginação */}
                        {totalPaginas > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '10px' }}>
                                <ActionButton disabled={paginaAtual === 0} onClick={() => setPaginaAtual(p => p - 1)} styles={styles}>← Anterior</ActionButton>
                                <span style={{ display: 'flex', alignItems: 'center', color: colors.textMuted, fontSize: '14px', fontWeight: '600' }}>
                                    {paginaAtual + 1} / {totalPaginas}
                                </span>
                                <ActionButton disabled={paginaAtual >= totalPaginas - 1} onClick={() => setPaginaAtual(p => p + 1)} styles={styles}>Próxima →</ActionButton>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ 
                        padding: '60px', textAlign: 'center', backgroundColor: colors.white, 
                        borderRadius: '24px', border: `2px dashed ${colors.border}` 
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>💸</div>
                        <h3 style={{ margin: '0 0 8px 0', color: colors.textDark }}>Nada por aqui</h3>
                        <p style={{ margin: 0, color: colors.textMuted }}>Nenhuma transação encontrada com este filtro.</p>
                    </div>
                )}
            </div>
            
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default HistoricoTransacoes;