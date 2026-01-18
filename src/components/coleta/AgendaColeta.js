import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import api from '../../api/api';

import { FiUser, FiMapPin, FiClock, FiCheckCircle, FiTruck, FiRefreshCw, FiAlertTriangle, FiHome, FiMap, FiDroplet } from 'react-icons/fi';

const Toast = ({ message, type, onClose, styles }) => (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', 
      borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1001,
      backgroundColor: type === 'success' ? (styles.colors.success || 'green') : (styles.colors.danger || 'red'),
      color: styles.colors.textLight || 'white',
      display: 'flex', alignItems: 'center', gap: '15px'
    }}>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>
        &times;
      </button>
    </div>
);

// =================================================================
// VISTA PRINCIPAL: A Agenda Simplificada
// =================================================================
const AgendaColeta = ({ styles, mostrarToast, tipoColeta }) => {
    const { colors, app } = styles;
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const fetchAgenda = useCallback(async () => {
        setLoading(true);
        setErro(null);
        try {
            let finalAgenda = [];

            if (tipoColeta === 'TODAS') {
                const [domiciliarRes, presencialRes] = await Promise.all([
                    api.get('/coletor/agenda/DOMICILIAR'),
                    api.get('/coletor/agenda/PRESENCIAL')
                ]);
                finalAgenda = [...(domiciliarRes.data || []), ...(presencialRes.data || [])];
            } else {
                const response = await api.get(`/coletor/agenda/${tipoColeta}`);
                finalAgenda = response.data || [];
            }
            
            // Ordenar por data mais próxima
            finalAgenda.sort((a, b) => new Date(a.dataHoraAgendada) - new Date(b.dataHoraAgendada));
            setAgenda(finalAgenda);

        } catch (err) {
            setErro("Não foi possível carregar a agenda.");
            console.error("Erro ao buscar agenda:", err);
        } finally {
            setLoading(false);
        }
    }, [tipoColeta]);

    useEffect(() => {
        fetchAgenda();
    }, [fetchAgenda]);

    const handleStatusUpdate = async (agendamentoId, acao) => {
        const endpoint = acao === 'INICIAR'
            ? `/coletor/agenda/${agendamentoId}/iniciar-deslocamento`
            : `/coletor/agenda/${agendamentoId}/confirmar-coleta`;
        const novoStatus = acao === 'INICIAR' ? 'A_CAMINHO' : 'REALIZADO';
        
        try {
            await api.put(endpoint);
            setAgenda(prev => prev.map(ag => ag.id === agendamentoId ? { ...ag, status: novoStatus } : ag));
            mostrarToast(`Status atualizado!`, 'success');
        } catch (err) {
            mostrarToast("Erro ao atualizar status.", "error");
        }
    };

    // Agrupar coletas por status
    const coletasPendentes = agenda.filter(ag => ag.status === 'AGENDADO' || ag.status === 'A_CAMINHO');
    const coletasRealizadas = agenda.filter(ag => ag.status === 'REALIZADO');

    if (loading) return (
        <div style={{...app.card, textAlign: 'center', padding: '40px'}}>
            <FiRefreshCw size={30} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '15px' }} />
            <p style={{ color: colors.textMuted }}>Carregando agenda...</p>
        </div>
    );

    if (erro) return (
        <div style={{...app.card, textAlign: 'center', padding: '40px', color: colors.danger}}>
            <FiAlertTriangle size={30} style={{ marginBottom: '15px' }} />
            <p>{erro}</p>
            <button 
                onClick={fetchAgenda} 
                style={{...app.button, marginTop: '15px' }}
            >
                <FiRefreshCw style={{ marginRight: '8px' }} /> Tentar Novamente
            </button>
        </div>
    );

    return (
        <div style={app.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{...app.title, margin: 0}}>Minhas Coletas</h2>
                <button 
                    onClick={fetchAgenda}
                    style={{
                        ...app.button,
                        backgroundColor: colors.background_secondary,
                        color: colors.primary,
                        border: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px'
                    }}
                >
                    <FiRefreshCw size={16} /> Atualizar
                </button>
            </div>
            
            {/* Coletas Pendentes */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{
                    ...app.subtitle, 
                    color: colors.warning,
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📋 Coletas Pendentes ({coletasPendentes.length})
                </h3>
                
                {coletasPendentes.length === 0 ? (
                    <p style={{ textAlign: 'center', color: colors.textMuted, padding: '2rem' }}>
                        Nenhuma coleta pendente.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {coletasPendentes.map(ag => {
                            const IconeTipo = ag.tipoColeta === 'DOMICILIAR' ? FiHome : FiMap;
                            const localColeta = ag.tipoColeta === 'DOMICILIAR' ? ag.enderecoCompleto : ag.nomeUnidade;
                            const totalExames = ag.dataPedidoExame?.itens?.length || 0;
                            
                            return (
                                <div key={ag.id} style={{ 
                                    ...app.card, 
                                    margin: 0, 
                                    padding: '20px',
                                    border: `2px solid ${ag.status === 'A_CAMINHO' ? colors.warning : colors.info}`,
                                    background: colors.background_secondary 
                                }}>
                                    {/* Cabeçalho com data/hora e status */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FiClock size={18} color={colors.primary} />
                                            <div>
                                                <strong style={{ fontSize: '1.1rem', color: colors.textDark, display: 'block' }}>
                                                    {new Date(ag.dataHoraAgendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </strong>
                                                <span style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                                                    {new Date(ag.dataHoraAgendada).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '12px', 
                                                fontSize: '0.75rem', 
                                                color: '#fff',
                                                backgroundColor: ag.status === 'A_CAMINHO' ? colors.warning : colors.info
                                            }}>
                                                {ag.status === 'A_CAMINHO' ? 'A CAMINHO' : 'AGENDADO'}
                                            </span>
                                            <IconeTipo size={16} color={ag.tipoColeta === 'DOMICILIAR' ? colors.warning : colors.info} />
                                        </div>
                                    </div>
                                    
                                    {/* Informações principais */}
                                    <div style={{ color: colors.textDark, marginBottom: '15px' }}>
                                        <p style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FiUser size={16} />
                                            <strong>Paciente:</strong> {ag.nomePaciente}
                                        </p>
                                        <p style={{ margin: '0 0 8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <FiMapPin size={16} style={{ marginTop: '2px' }} />
                                            <span><strong>Local:</strong> {localColeta}</span>
                                        </p>
                                        <p style={{ margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FiDroplet size={16} />
                                            <span><strong>Exames:</strong> {totalExames} {totalExames === 1 ? 'exame' : 'exames'}</span>
                                        </p>
                                        
                                        {/* Lista rápida de exames */}
                                        {totalExames > 0 && (
                                            <div style={{ 
                                                marginTop: '10px', 
                                                padding: '8px',
                                                backgroundColor: colors.background_primary,
                                                borderRadius: '6px',
                                                fontSize: '0.85rem'
                                            }}>
                                                <strong style={{ display: 'block', marginBottom: '4px' }}>Lista de Exames:</strong>
                                                {ag.dataPedidoExame.itens.slice(0, 3).map((item, index) => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>• {item.nomeExame}</span>
                                                    </div>
                                                ))}
                                                {totalExames > 3 && (
                                                    <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>
                                                        + {totalExames - 3} outros exames
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Botões de ação */}
                                    {ag.status === 'AGENDADO' && ag.tipoColeta === 'DOMICILIAR' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(ag.id, 'INICIAR')} 
                                            style={{
                                                ...app.button, 
                                                backgroundColor: colors.warning,
                                                width: '100%', 
                                                marginTop: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <FiTruck size={16} /> Iniciar Deslocamento
                                        </button>
                                    )}
                                    {ag.status === 'A_CAMINHO' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(ag.id, 'CONFIRMAR')} 
                                            style={{
                                                ...app.button, 
                                                backgroundColor: colors.success,
                                                width: '100%', 
                                                marginTop: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <FiCheckCircle size={16} /> Confirmar Coleta
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Coletas Realizadas */}
            {coletasRealizadas.length > 0 && (
                <div>
                    <h3 style={{
                        ...app.subtitle, 
                        color: colors.success,
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        ✅ Coletas Realizadas ({coletasRealizadas.length})
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {coletasRealizadas.slice(0, 5).map(ag => (
                            <div key={ag.id} style={{ 
                                padding: '12px 15px',
                                backgroundColor: colors.background_primary,
                                borderRadius: '8px',
                                border: `1px solid ${colors.border}`,
                                fontSize: '0.9rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold' }}>{ag.nomePaciente}</span>
                                    <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>
                                        {new Date(ag.dataHoraAgendada).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                                    {ag.dataPedidoExame?.itens?.length || 0} exames • {ag.tipoColeta === 'DOMICILIAR' ? '🏠 Domiciliar' : '🗺️ Presencial'}
                                </div>
                            </div>
                        ))}
                        {coletasRealizadas.length > 5 && (
                            <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: '0.9rem', padding: '10px' }}>
                                + {coletasRealizadas.length - 5} coletas realizadas
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgendaColeta;