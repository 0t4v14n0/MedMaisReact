import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// =================================================================
// 🎨 UI COMPONENTS (REUTILIZÁVEIS DO TEMA WELLNESS)
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

// Toast Moderno
const ModernToast = ({ message, type, onClose, styles }) => (
    <div style={{
        position: 'fixed', top: '24px', right: '24px', 
        padding: '16px 24px', borderRadius: '16px',
        backgroundColor: styles.colors.white,
        borderLeft: `6px solid ${type === 'success' ? styles.colors.success : styles.colors.danger}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 1100,
        display: 'flex', alignItems: 'center', gap: '16px',
        animation: 'slideIn 0.3s ease-out',
        border: `1px solid ${styles.colors.borderLight}`
    }}>
        <div style={{ 
            width: '24px', height: '24px', borderRadius: '50%', 
            backgroundColor: type === 'success' ? `${styles.colors.success}20` : `${styles.colors.danger}20`,
            color: type === 'success' ? styles.colors.success : styles.colors.danger,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'
        }}>
            {type === 'success' ? '✓' : '!'}
        </div>
        <span style={{ fontWeight: '600', fontSize: '14px', color: styles.colors.textDark }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted, fontSize: '18px' }}>×</button>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
);

const ActionButton = ({ children, onClick, disabled, loading, styles, variant = 'primary', fullWidth }) => {
    let bgColor = styles.colors.primary;
    let color = styles.colors.white;

    if (variant === 'secondary') { bgColor = styles.colors.lightGray; color = styles.colors.textDark; }
    if (variant === 'danger') { bgColor = `${styles.colors.danger}20`; color = styles.colors.danger; }
    if (variant === 'success') { bgColor = styles.colors.success; color = styles.colors.white; }
    if (disabled) { bgColor = styles.colors.lightGray; color = styles.colors.textMuted; }

    return (
        <button 
            onClick={onClick} disabled={disabled || loading}
            style={{
                width: fullWidth ? '100%' : 'auto',
                padding: '14px 24px', borderRadius: '12px', border: 'none',
                backgroundColor: bgColor, color: color,
                fontSize: '14px', fontWeight: '600', cursor: disabled || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: (variant === 'primary' || variant === 'success') && !disabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            {loading && <span style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>}
            {children}
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </button>
    );
};

// Card de Opção Selecionável
const SelectionCard = ({ selected, onClick, title, subtitle, icon, styles }) => (
    <div 
        onClick={onClick}
        style={{
            border: `2px solid ${selected ? styles.colors.primary : styles.colors.borderLight}`,
            backgroundColor: selected ? `${styles.colors.primary}05` : styles.colors.white,
            borderRadius: '16px', padding: '24px', cursor: 'pointer',
            transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px',
            boxShadow: selected ? `0 0 0 4px ${styles.colors.primary}10` : 'none'
        }}
    >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: styles.colors.textDark }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, fontSize: '13px', color: styles.colors.textMuted }}>{subtitle}</p>}
        {selected && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', color: styles.colors.primary, fontSize: '20px' }}>✓</div>
        )}
    </div>
);

// Badge de Status
const OrderStatusBadge = ({ status, styles }) => {
    let bg = styles.colors.lightGray;
    let color = styles.colors.textMuted;
    
    if (['CONCLUIDO', 'FINALIZADO', 'LAUDO_DISPONIVEL'].includes(status)) { bg = `${styles.colors.success}20`; color = styles.colors.success; }
    else if (['PENDENTE', 'EM_ANALISE', 'AGUARDANDO_PAGAMENTO'].includes(status)) { bg = `${styles.colors.warning}20`; color = styles.colors.warning; }
    else if (['CANCELADO', 'RECUSADO'].includes(status)) { bg = `${styles.colors.danger}20`; color = styles.colors.danger; }
    else if (['AGENDADO', 'COLETA_AGENDADA', 'CONFIRMADO'].includes(status)) { bg = `${styles.colors.primary}20`; color = styles.colors.primary; }

    return (
        <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: bg, color: color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
};

// =================================================================
// SUB-COMPONENTE: SOLICITAR EXAMES (CORRIGIDO)
// =================================================================
const SolicitarExames = ({ mostrarToast, styles, isMobile, setVistaAtual }) => {
    const { colors } = styles;
    const [etapa, setEtapa] = useState('TIPO'); 
    
    // Dados
    const [tipoColeta, setTipoColeta] = useState(null);
    const [unidades, setUnidades] = useState([]);
    const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);
    const [examesDisponiveis, setExamesDisponiveis] = useState([]);
    const [examesSelecionados, setExamesSelecionados] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [horarioSelecionado, setHorarioSelecionado] = useState(null);
    const [dataAgendamento, setDataAgendamento] = useState(new Date().toISOString().split('T')[0]);
    const [convenioInfo, setConvenioInfo] = useState(null);
    
    // Estado para armazenar as regras do plano
    const [regrasPlano, setRegrasPlano] = useState([]);

    // Estados de Controle
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // --- FUNÇÕES DE BUSCA ---
    const fetchUnidades = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/unidade/coleta/all');
            setUnidades(res.data || []);
        } catch (err) { mostrarToast("Erro ao buscar unidades.", "error"); }
        finally { setLoading(false); }
    }, [mostrarToast]);

    const fetchExames = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = tipoColeta === 'UNIDADE' ? '/exame/all/ativo' : '/paciente/coleta-domiciliar/exames-elegiveis';
            
            const [examesRes, convenioRes, planoRes] = await Promise.allSettled([
                api.get(endpoint),
                api.get('/convenio/ativoUsuario'),
                api.get('/paciente/plano/atual/exame')
            ]);

            // 1. Exames
            if (examesRes.status === 'fulfilled') {
                setExamesDisponiveis(examesRes.value.data || []);
            }

            // 2. Convênio
            if (convenioRes.status === 'fulfilled') {
                setConvenioInfo(convenioRes.value.data || { ativo: false });
            }

            // 3. Plano (LÓGICA CORRIGIDA AQUI)
            if (planoRes.status === 'fulfilled' && planoRes.value.data) {
                const dados = planoRes.value.data;
                // Detecta se é um Array direto ou se está dentro de um objeto (Wrapper/Page)
                let regras = [];
                
                if (Array.isArray(dados)) {
                    regras = dados;
                } else if (dados.content && Array.isArray(dados.content)) {
                    regras = dados.content; // Suporte a Spring Page
                } else if (dados.dataExames && Array.isArray(dados.dataExames)) {
                    regras = dados.dataExames; // Suporte ao DTO wrapper antigo se houver
                }
                
                console.log("Regras de Plano carregadas:", regras);
                setRegrasPlano(regras);
            } else {
                setRegrasPlano([]);
            }

        } catch (err) { 
            console.error(err);
            mostrarToast("Erro ao carregar dados.", "error"); 
        } finally { 
            setLoading(false); 
        }
    }, [tipoColeta, mostrarToast]);

    const fetchHorarios = useCallback(async () => {
        if (!dataAgendamento) return;
        setLoading(true);
        try {
            const res = await api.get(`/coleta/horarios/unidade/proximas?data=${dataAgendamento}`);
            setHorarios(res.data || []);
        } catch (err) { mostrarToast("Erro ao buscar horários.", "error"); }
        finally { setLoading(false); }
    }, [dataAgendamento, mostrarToast]);

    // --- EFEITOS DE TRANSIÇÃO ---
    useEffect(() => {
        if (etapa === 'UNIDADE') fetchUnidades();
        if (etapa === 'EXAMES') fetchExames();
        if (etapa === 'AGENDAMENTO') fetchHorarios();
    }, [etapa, fetchUnidades, fetchExames, fetchHorarios]);

    // --- LÓGICA DE PRECIFICAÇÃO COM DESCONTO (CORRIGIDA) ---
    const getPrecoExame = (exame) => {
        const valorOriginal = Number(exame.valor);
        
        // Se não tiver regras, retorna preço cheio
        if (!regrasPlano || regrasPlano.length === 0) {
            return { original: valorOriginal, final: valorOriginal, temDesconto: false, percentual: 0 };
        }

        // Procura a regra correspondente ao exame
        // O DTO Java é: DataDetalhePlanoExame { ExameDataDetalhes dataExame; ... }
        const regra = regrasPlano.find(r => {
            // Verifica se o objeto interno 'dataExame' existe antes de acessar o ID
            if (!r.dataExame) return false;
            
            // Compara IDs como String para evitar problemas de tipo (number vs string)
            return String(r.dataExame.id) === String(exame.id);
        });

        if (regra && regra.desconto && Number(regra.desconto) > 0) {
            const descontoPercentual = Number(regra.desconto);
            const valorDesconto = (valorOriginal * descontoPercentual) / 100;
            const valorFinal = valorOriginal - valorDesconto;
            
            return {
                original: valorOriginal,
                final: valorFinal,
                temDesconto: true,
                percentual: descontoPercentual
            };
        }

        return {
            original: valorOriginal,
            final: valorOriginal,
            temDesconto: false,
            percentual: 0
        };
    };

    // --- AÇÕES ---
    const handleToggleExame = (id) => {
        setExamesSelecionados(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const finalizarSolicitacao = async (metodoPagamento) => {
        setSubmitting(true);
        try {
            if (tipoColeta === 'UNIDADE') {
                const endpoint = metodoPagamento === 'CONVENIO' ? '/exame/solicitar/convenio' : '/exame/solicitar';
                await api.post(endpoint, {
                    idUnidade: unidadeSelecionada.id,
                    examesIds: examesSelecionados,
                    justificativa: ""
                });
                mostrarToast("Solicitação realizada com sucesso!", "success");
            } else {
                await api.post('/coleta/solicitar/pedido', {
                    dataHoraEscolhida: horarioSelecionado,
                    examesIds: examesSelecionados
                });
                mostrarToast("Coleta domiciliar agendada!", "success");
            }
            setTimeout(() => setVistaAtual('listar'), 1500);
        } catch (error) {
            mostrarToast(error.response?.data?.message || "Erro ao processar.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Cálculo do Total considerando os descontos
    const totalPedido = examesDisponiveis
        .filter(e => examesSelecionados.includes(e.id))
        .reduce((acc, curr) => acc + getPrecoExame(curr).final, 0);

    // --- RENDERS ---
    
    if (etapa === 'TIPO') return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.textDark, marginBottom: '20px', textAlign: 'center' }}>Como deseja realizar seus exames?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                <SelectionCard 
                    title="Realizar na Unidade" 
                    subtitle="Escolha a unidade mais próxima e vá até lá." 
                    icon="🏥" 
                    styles={styles} 
                    onClick={() => { setTipoColeta('UNIDADE'); setEtapa('UNIDADE'); }} 
                />
                <SelectionCard 
                    title="Coleta Domiciliar" 
                    subtitle="Vamos até você no conforto da sua casa." 
                    icon="🏠" 
                    styles={styles} 
                    onClick={() => { setTipoColeta('DOMICILIAR'); setEtapa('EXAMES'); }} 
                />
            </div>
        </div>
    );

    if (etapa === 'UNIDADE') return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                <button onClick={() => setEtapa('TIPO')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}>←</button>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.textDark, margin: 0 }}>Selecione a Unidade</h2>
            </div>
            
            {loading ? <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Carregando unidades...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                    {unidades.map(unidade => (
                        <div key={unidade.id} onClick={() => { setUnidadeSelecionada(unidade); setEtapa('EXAMES'); }}
                            style={{
                                border: `1px solid ${colors.borderLight}`, borderRadius: '16px', padding: '20px',
                                backgroundColor: colors.white, cursor: 'pointer', transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderLight; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '700', color: colors.textDark }}>{unidade.nome}</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted }}>{unidade.endereco?.endereco}, {unidade.endereco?.cidade}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (etapa === 'EXAMES') return (
        <div style={{ animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '24px' }}>
            {/* Lista de Exames */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                    <button onClick={() => setEtapa(tipoColeta === 'UNIDADE' ? 'UNIDADE' : 'TIPO')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}>←</button>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.textDark, margin: 0 }}>Selecione os Exames</h2>
                </div>

                {loading ? <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Carregando exames...</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {examesDisponiveis.map(exame => {
                            const isSelected = examesSelecionados.includes(exame.id);
                            // Usa a função de preço para exibir descontos
                            const precoInfo = getPrecoExame(exame);

                            return (
                                <div key={exame.id} onClick={() => handleToggleExame(exame.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px', borderRadius: '12px', cursor: 'pointer',
                                        backgroundColor: isSelected ? `${colors.primary}10` : colors.white,
                                        border: `1px solid ${isSelected ? colors.primary : colors.borderLight}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ fontSize: '15px', fontWeight: '600', color: colors.textDark }}>{exame.nome}</div>
                                            {precoInfo.temDesconto && (
                                                <span style={{ fontSize: '10px', backgroundColor: '#16a34a', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                    {precoInfo.percentual}% OFF
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '12px', color: colors.textMuted }}>{exame.preparacao || 'Sem preparo'}</div>
                                    </div>
                                    
                                    <div style={{ textAlign: 'right' }}>
                                        {precoInfo.temDesconto && (
                                            <div style={{ fontSize: '11px', textDecoration: 'line-through', color: colors.textMuted }}>
                                                R$ {precoInfo.original.toFixed(2)}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: precoInfo.temDesconto ? '#16a34a' : colors.primary }}>
                                            R$ {precoInfo.final.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Resumo Lateral */}
            <div style={{ backgroundColor: colors.white, borderRadius: '20px', padding: '24px', border: `1px solid ${colors.borderLight}`, height: 'fit-content', position: isMobile ? 'static' : 'sticky', top: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: colors.textDark }}>Resumo do Pedido</h3>
                
                {examesSelecionados.length === 0 ? (
                    <p style={{ fontSize: '13px', color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' }}>Nenhum exame selecionado.</p>
                ) : (
                    <div style={{ marginBottom: '20px' }}>
                        {examesDisponiveis.filter(e => examesSelecionados.includes(e.id)).map(e => {
                            const precoInfo = getPrecoExame(e);
                            return (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: colors.textMuted }}>
                                    <span>{e.nome}</span>
                                    <span>R$ {precoInfo.final.toFixed(2)}</span>
                                </div>
                            );
                        })}
                        <div style={{ borderTop: `1px dashed ${colors.border}`, margin: '16px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: colors.textDark }}>
                            <span>Total</span>
                            <span>R$ {totalPedido.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {tipoColeta === 'UNIDADE' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <ActionButton fullWidth onClick={() => finalizarSolicitacao('SALDO')} disabled={examesSelecionados.length === 0 || submitting} loading={submitting && !convenioInfo?.ativo} styles={styles} variant="success">
                            Pagar com Saldo
                        </ActionButton>
                        {convenioInfo?.ativo && (
                            <ActionButton fullWidth onClick={() => finalizarSolicitacao('CONVENIO')} disabled={examesSelecionados.length === 0 || submitting} loading={submitting} styles={styles}>
                                Solicitar via Convênio
                            </ActionButton>
                        )}
                    </div>
                ) : (
                    <ActionButton fullWidth onClick={() => setEtapa('AGENDAMENTO')} disabled={examesSelecionados.length === 0} styles={styles}>
                        Agendar Coleta →
                    </ActionButton>
                )}
            </div>
        </div>
    );

    // 4. Agendamento (Apenas para Domiciliar)
    if (etapa === 'AGENDAMENTO') return (
        <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                <button onClick={() => setEtapa('EXAMES')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}>←</button>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.textDark, margin: 0 }}>Agendar Data e Hora</h2>
            </div>

            <div style={{ backgroundColor: colors.white, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.borderLight}` }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Selecione a Data</label>
                    <input 
                        type="date" 
                        value={dataAgendamento} 
                        onChange={(e) => setDataAgendamento(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.textMuted, marginBottom: '12px', textTransform: 'uppercase' }}>Horários Disponíveis</label>
                    {loading ? <div style={{ color: colors.textMuted, fontSize: '13px' }}>Buscando horários...</div> : (
                        horarios.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                {horarios.map(h => (
                                    <button key={h} onClick={() => setHorarioSelecionado(h)}
                                        style={{
                                            padding: '10px', borderRadius: '8px', border: `1px solid ${horarioSelecionado === h ? colors.primary : colors.borderLight}`,
                                            backgroundColor: horarioSelecionado === h ? colors.primary : colors.lightGray,
                                            color: horarioSelecionado === h ? colors.white : colors.textDark,
                                            cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                                        }}
                                    >
                                        {new Date(h).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                                    </button>
                                ))}
                            </div>
                        ) : <div style={{ color: colors.danger, fontSize: '13px' }}>Sem horários para esta data.</div>
                    )}
                </div>

                <ActionButton fullWidth onClick={finalizarSolicitacao} disabled={!horarioSelecionado || submitting} loading={submitting} styles={styles} variant="success">
                    Confirmar Agendamento
                </ActionButton>
            </div>
        </div>
    );

    return null;
};

// =================================================================
// SUB-COMPONENTE: LISTAR PEDIDOS
// =================================================================
const ListarPedidos = ({ mostrarToast, styles, isMobile }) => {
    const { colors } = styles;
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFiltro, setStatusFiltro] = useState('TODOS');
    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => {
        api.get('/exame/pedidos/status').then(res => {
            const s = res.data || [];
            setStatusOptions(['TODOS', ...s.filter(i => i !== 'TODOS')]);
        }).catch(() => setStatusOptions(['TODOS']));
    }, []);

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/exame/pedidos/meus-pedidos/${statusFiltro}`);
            setPedidos(res.data.map(p => ({...p, valorTotal: Number(p.valorTotal) || 0 })) || []);
        } catch { mostrarToast("Erro ao buscar pedidos.", "error"); }
        finally { setLoading(false); }
    }, [statusFiltro, mostrarToast]);

    useEffect(() => { if(statusOptions.length) fetchPedidos(); }, [fetchPedidos, statusOptions]);

    const cancelarPedido = async (id) => {
        if (!window.confirm("Deseja cancelar?")) return;
        try {
            await api.delete(`/exame/deletar/${id}`);
            mostrarToast("Pedido cancelado.");
            fetchPedidos();
        } catch (e) { mostrarToast("Erro ao cancelar.", "error"); }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.textDark, margin: 0 }}>Histórico de Pedidos</h2>
                <div style={{ position: 'relative', minWidth: '150px' }}>
                    <select 
                        value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`,
                            backgroundColor: colors.white, fontSize: '14px', outline: 'none', appearance: 'none', cursor: 'pointer'
                        }}
                    >
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '10px', color: colors.textMuted }}>▼</div>
                </div>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Carregando histórico...</div> : (
                pedidos.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pedidos.map(pedido => (
                            <div key={pedido.id} style={{ 
                                backgroundColor: colors.white, borderRadius: '16px', padding: '20px',
                                border: `1px solid ${colors.borderLight}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>PEDIDO #{pedido.id}</div>
                                        <div style={{ fontSize: '14px', color: colors.textDark, marginTop: '2px' }}>
                                            {new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                    <OrderStatusBadge status={pedido.status} styles={styles} />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: colors.textDark, marginBottom: '8px' }}>Exames:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {pedido.itens?.map(item => (
                                            <span key={item.id} style={{ fontSize: '12px', backgroundColor: colors.lightGray, padding: '4px 10px', borderRadius: '8px', color: colors.textMuted }}>
                                                {item.nomeExame}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ borderTop: `1px solid ${colors.borderLight}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: '700', fontSize: '16px', color: colors.textDark }}>
                                        Total: <span style={{ color: colors.primary }}>R$ {pedido.valorTotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {(pedido.status === 'AGUARDANDO_COLETA' || pedido.status === 'COLETA_AGENDADA') && (
                                            <ActionButton onClick={() => cancelarPedido(pedido.id)} styles={styles} variant="danger">Cancelar</ActionButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: colors.white, borderRadius: '20px', border: `2px dashed ${colors.border}` }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>📁</div>
                        <h3 style={{ margin: '0 0 8px 0', color: colors.textDark }}>Sem pedidos</h3>
                        <p style={{ margin: 0, color: colors.textMuted }}>Você não tem pedidos neste status.</p>
                    </div>
                )
            )}
        </div>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================
const Exames = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    const [vistaAtual, setVistaAtual] = useState('solicitar');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const mostrarToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
    }, []);

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: colors.background, minHeight: '100vh' }}>
            {toast.show && <ModernToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} styles={styles} />}
            
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: colors.textDark, letterSpacing: '-0.5px' }}>
                            Central de <span style={{ color: colors.primary }}>Exames</span>
                        </h1>
                        <p style={{ margin: 0, color: colors.textMuted }}>Agende exames ou consulte seus pedidos.</p>
                    </div>
                </div>

                {/* Switcher de Abas Moderno */}
                <div style={{ 
                    display: 'flex', backgroundColor: colors.lightGray, padding: '4px', borderRadius: '16px', 
                    marginBottom: '30px', width: 'fit-content', border: `1px solid ${colors.border}`
                }}>
                    <button 
                        onClick={() => setVistaAtual('solicitar')}
                        style={{
                            padding: '10px 24px', borderRadius: '12px', border: 'none',
                            backgroundColor: vistaAtual === 'solicitar' ? colors.white : 'transparent',
                            color: vistaAtual === 'solicitar' ? colors.primary : colors.textMuted,
                            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                            boxShadow: vistaAtual === 'solicitar' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        + Nova Solicitação
                    </button>
                    <button 
                        onClick={() => setVistaAtual('listar')}
                        style={{
                            padding: '10px 24px', borderRadius: '12px', border: 'none',
                            backgroundColor: vistaAtual === 'listar' ? colors.white : 'transparent',
                            color: vistaAtual === 'listar' ? colors.primary : colors.textMuted,
                            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                            boxShadow: vistaAtual === 'listar' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        📋 Meus Pedidos
                    </button>
                </div>

                {/* Conteúdo */}
                {vistaAtual === 'solicitar' 
                    ? <SolicitarExames mostrarToast={mostrarToast} styles={styles} isMobile={isMobile} setVistaAtual={setVistaAtual} />
                    : <ListarPedidos mostrarToast={mostrarToast} styles={styles} isMobile={isMobile} />
                }
            </div>
        </div>
    );
};

export default Exames;