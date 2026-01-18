import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api'; 
import { useTheme } from '../../contexts/ThemeContext'; 
import { generateStyles } from '../../styles/globalStyles'; 

// --- IMPORT DOS ÍCONES ---
import { 
    FiCheck, 
    FiStar, 
    FiCreditCard, 
    FiX, 
    FiLock, 
    FiPlusCircle, 
    FiActivity, 
    FiUsers, 
    FiDroplet, 
    FiCheckCircle, 
    FiInfo, 
    FiDollarSign,   
    FiChevronRight,
    FiExternalLink
} from 'react-icons/fi';

// Hook para responsividade
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

// =================================================================
// 1. COMPONENTE: Modal de Detalhes do Plano
// =================================================================
const ModalDetalhesPlano = ({ plano, onClose, onAssinar, styles, isMobile }) => {
    const formatMoney = (val) => val ? `R$ ${Number(val).toFixed(2)}` : 'R$ 0,00';

    const renderEmpty = (text) => (
        <div style={{ padding: '15px', textAlign: 'center', color: styles.colors.textMuted, fontSize: '13px', fontStyle: 'italic', backgroundColor: styles.colors.background, borderRadius: '8px' }}>
            {text}
        </div>
    );

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1200, 
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{
                backgroundColor: styles.colors.white, borderRadius: '24px',
                width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: '25px', borderBottom: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: styles.colors.primary, fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>
                            {plano.categoria?.nome || 'Plano de Saúde'}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '24px', color: styles.colors.textDark }}>{plano.nome}</h2>
                        {plano.abrangencia && (
                            <span style={{ fontSize: '13px', color: styles.colors.textMuted, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                                <FiInfo size={14} /> Abrangência: {plano.abrangencia.nome}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted }}>
                        <FiX size={28} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '25px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ color: styles.colors.textMuted, lineHeight: '1.6' }}>{plano.descricao}</p>
                        {plano.observacoes && (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '13px', borderLeft: '4px solid #f59e0b' }}>
                                <strong>Nota:</strong> {plano.observacoes}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                        {/* AULAS */}
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: styles.colors.textDark, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <FiActivity color={styles.colors.success} /> Aulas e Atividades
                            </h3>
                            {plano.dataAulas?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {plano.dataAulas.map(item => (
                                        <div key={item.id} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '10px', 
                                            padding: '10px', borderRadius: '8px', 
                                            backgroundColor: item.incluso ? '#ecfdf5' : styles.colors.background,
                                            border: `1px solid ${item.incluso ? '#a7f3d0' : styles.colors.borderLight}`
                                        }}>
                                            <div style={{ color: item.incluso ? styles.colors.success : styles.colors.textMuted }}>
                                                {item.incluso ? <FiCheckCircle /> : <FiX />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px', color: styles.colors.textDark }}>{item.aula.nome}</div>
                                                <div style={{ fontSize: '11px', color: styles.colors.textMuted }}>{item.incluso ? 'Totalmente Incluso' : 'Não incluso'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : renderEmpty("Nenhuma aula específica listada.")}
                        </div>

                        {/* ESPECIALIDADES */}
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: styles.colors.textDark, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <FiUsers color={styles.colors.primary} /> Descontos em Consultas
                            </h3>
                            {plano.dataEspecialidades?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {plano.dataEspecialidades.map(item => (
                                        <div key={item.id} style={{ 
                                            padding: '10px', borderRadius: '8px', backgroundColor: styles.colors.background,
                                            border: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px', color: styles.colors.textDark }}>{item.especialidade.nome}</div>
                                                <div style={{ fontSize: '11px', color: styles.colors.textMuted }}>
                                                    {item.limiteConsultas ? `Limite: ${item.limiteConsultas}/mês` : 'Sem limite mensal'}
                                                </div>
                                            </div>
                                            <div style={{ backgroundColor: `${styles.colors.primary}20`, color: styles.colors.primary, padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                                                -{item.descontoPercentual}% OFF
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : renderEmpty("Sem descontos específicos em especialidades.")}
                        </div>
                    </div>

                    {/* EXAMES */}
                    <div style={{ marginTop: '25px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: styles.colors.textDark, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <FiDroplet color="#8b5cf6" /> Exames Laboratoriais
                        </h3>
                        {plano.dataExames?.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                                {plano.dataExames.map(item => (
                                    <div key={item.id} style={{ 
                                        padding: '12px', borderRadius: '8px', backgroundColor: styles.colors.white,
                                        border: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '13px', color: styles.colors.textDark }}>{item.dataExame.nome}</div>
                                            <div style={{ fontSize: '11px', color: styles.colors.textMuted }}>
                                                {item.limiteExames ? `${item.limiteExames} exames/mês` : 'Ilimitado'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '13px' }}>-{item.desconto}%</div>
                                            <div style={{ fontSize: '10px', textDecoration: 'line-through', color: styles.colors.textMuted }}>
                                                {formatMoney(item.dataExame.valor)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : renderEmpty("Nenhum exame incluso neste plano.")}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ 
                    padding: '20px 25px', borderTop: `1px solid ${styles.colors.borderLight}`, 
                    backgroundColor: styles.colors.background, borderRadius: '0 0 24px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '15px'
                }}>
                    <div>
                        <span style={{ fontSize: '13px', color: styles.colors.textMuted }}>Valor Mensal</span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: styles.colors.textDark }}>
                            {formatMoney(plano.valorMensalidade)}
                        </div>
                    </div>
                    <button 
                        onClick={() => { onClose(); onAssinar(plano); }} 
                        style={{
                            ...styles.app.button, 
                            backgroundColor: styles.colors.success, 
                            padding: '12px 30px', fontSize: '16px', width: isMobile ? '100%' : 'auto',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        Quero este Plano
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// 2. COMPONENTE: Modal de Seleção de Pagamento
// =================================================================
const ModalSelecaoPagamento = ({ plano, saldoUsuario, onClose, onSelectMethod, styles, loading }) => {
    const temSaldoSuficiente = saldoUsuario >= plano.valorMensalidade;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1100, 
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{
                backgroundColor: styles.colors.white, borderRadius: '24px',
                width: '100%', maxWidth: '450px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '25px', borderBottom: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: styles.colors.textDark, fontSize: '18px' }}>Como deseja pagar?</h3>
                    <button onClick={onClose} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted }}><FiX size={24} /></button>
                </div>

                <div style={{ padding: '25px' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <p style={{ color: styles.colors.textMuted, fontSize: '14px', marginBottom: '5px' }}>Plano Selecionado</p>
                        <h2 style={{ color: styles.colors.textDark, fontSize: '22px', margin: 0 }}>{plano.nome}</h2>
                        <div style={{ color: styles.colors.primary, fontWeight: 'bold', fontSize: '24px', marginTop: '5px' }}>
                            R$ {plano.valorMensalidade.toFixed(2)}<span style={{fontSize:'14px', color: styles.colors.textMuted}}>/mês</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        {/* OPÇÃO 1: SALDO EM CONTA */}
                        <button 
                            onClick={() => temSaldoSuficiente && onSelectMethod('saldo')}
                            disabled={!temSaldoSuficiente || loading}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '20px', borderRadius: '16px',
                                border: `2px solid ${temSaldoSuficiente ? styles.colors.success : styles.colors.borderLight}`,
                                backgroundColor: temSaldoSuficiente ? '#f0fdf4' : '#f3f4f6',
                                cursor: temSaldoSuficiente ? 'pointer' : 'not-allowed',
                                opacity: temSaldoSuficiente && !loading ? 1 : 0.7,
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ 
                                    backgroundColor: temSaldoSuficiente ? styles.colors.success : styles.colors.textMuted, 
                                    color: 'white', padding: '10px', borderRadius: '10px' 
                                }}>
                                    <FiDollarSign size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: styles.colors.textDark, fontSize: '16px' }}>Usar meu Saldo</div>
                                    <div style={{ fontSize: '13px', color: temSaldoSuficiente ? styles.colors.success : '#ef4444', fontWeight: '500' }}>
                                        Disponível: R$ {saldoUsuario.toFixed(2)}
                                    </div>
                                    {!temSaldoSuficiente && (
                                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>Saldo insuficiente</div>
                                    )}
                                </div>
                            </div>
                            {temSaldoSuficiente && <FiChevronRight size={20} color={styles.colors.success} />}
                        </button>

                        {/* OPÇÃO 2: STRIPE (Cartão) */}
                        <button 
                            onClick={() => onSelectMethod('stripe')}
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '20px', borderRadius: '16px',
                                border: `2px solid #635bff`, // Cor do Stripe
                                backgroundColor: styles.colors.white,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = `#635bff05`}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.colors.white}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ backgroundColor: '#635bff', color: 'white', padding: '10px', borderRadius: '10px' }}>
                                    <FiCreditCard size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: styles.colors.textDark, fontSize: '16px' }}>
                                        {loading ? 'Redirecionando...' : 'Cartão de Crédito'}
                                    </div>
                                    <div style={{ fontSize: '13px', color: styles.colors.textMuted }}>
                                        Pagamento seguro via Stripe
                                    </div>
                                </div>
                            </div>
                            {loading ? (
                                <div style={{ width: '20px', height: '20px', border: '2px solid #635bff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            ) : (
                                <FiExternalLink size={20} color="#635bff" />
                            )}
                        </button>

                    </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#f9fafb', fontSize: '12px', textAlign: 'center', color: styles.colors.textMuted }}>
                    <FiLock style={{ marginBottom: '-2px' }} /> Ambiente seguro
                </div>
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

// =================================================================
// 3. COMPONENTE: Card de Plano
// =================================================================
const PlanCard = ({ plano, onAssinar, onVerDetalhes, styles, isPopular }) => {
    return (
        <div 
            style={{
                backgroundColor: styles.colors.white,
                borderRadius: '24px',
                padding: '30px',
                border: isPopular ? `2px solid ${styles.colors.primary}` : `1px solid ${styles.colors.borderLight}`,
                boxShadow: isPopular ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '100%'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isPopular ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
        >
            {isPopular && (
                <div style={{
                    position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: styles.colors.primary, color: 'white',
                    padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                    display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <FiStar fill="white" /> Recomendado
                </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: styles.colors.textDark, marginBottom: '10px' }}>{plano.nome}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '16px', color: styles.colors.textMuted }}>R$</span>
                    <span style={{ fontSize: '42px', fontWeight: '800', color: styles.colors.textDark }}>{Math.floor(plano.valorMensalidade)}</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: styles.colors.textDark }}>,{plano.valorMensalidade.toFixed(2).split('.')[1]}</span>
                    <span style={{ fontSize: '14px', color: styles.colors.textMuted }}>/mês</span>
                </div>
            </div>

            <div style={{ flex: 1, marginBottom: '25px' }}>
                <p style={{ color: styles.colors.textMuted, fontSize: '14px', lineHeight: '1.6', textAlign: 'center', marginBottom: '20px' }}>
                    {plano.descricao}
                </p>
                
                <div style={{ borderTop: `1px solid ${styles.colors.borderLight}`, paddingTop: '20px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li style={{ display: 'flex', gap: '10px', alignItems: 'start', fontSize: '14px', color: styles.colors.textDark }}>
                            <div style={{ minWidth: '20px', color: styles.colors.success }}><FiCheck size={20} /></div>
                            {plano.observacoes || "Acesso completo aos benefícios"}
                        </li>
                    </ul>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onVerDetalhes(plano); }}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: styles.colors.primary, fontWeight: '600', fontSize: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                            width: '100%', marginTop: '15px', padding: '10px',
                            borderRadius: '8px', transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = `${styles.colors.primary}15`}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <FiPlusCircle /> Ver benefícios completos
                    </button>
                </div>
            </div>

            <button 
                onClick={() => onAssinar(plano)}
                style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                    fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                    backgroundColor: isPopular ? styles.colors.primary : styles.colors.background,
                    color: isPopular ? 'white' : styles.colors.primary,
                    border: isPopular ? 'none' : `2px solid ${styles.colors.primary}`,
                    transition: 'all 0.2s', boxShadow: isPopular ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
            >
                Escolher {plano.nome}
            </button>
        </div>
    );
};

// =================================================================
// 4. COMPONENTE PRINCIPAL (Página Completa)
// =================================================================
const PlanosClinicas = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [planos, setPlanos] = useState([]);
    const [saldoUsuario, setSaldoUsuario] = useState(0); 
    const [loading, setLoading] = useState(true);
    
    // Estados de Controle de Modais
    const [planoSelecionado, setPlanoSelecionado] = useState(null); 
    const [modalEtapa, setModalEtapa] = useState(null); // 'selecao' (O Stripe não tem modal próprio)
    const [modalEtapaDetalhes, setModalEtapaDetalhes] = useState(null);
    
    const [toast, setToast] = useState({ show: false, message: '' });
    const navigate = useNavigate();

    // Buscar Planos e Saldo
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Busca Planos
                const resPlanos = await api.get('/plano/all');
                const planosOrdenados = (resPlanos.data || []).sort((a, b) => a.valorMensalidade - b.valorMensalidade);
                setPlanos(planosOrdenados);

                // Busca Saldo
                try {
                    const resPaciente = await api.get('/paciente/meus-dados'); 
                    setSaldoUsuario(resPaciente.data.saldo || 0); 
                } catch (e) {
                    console.warn("Não foi possível carregar o saldo ou endpoint inexistente.");
                    setSaldoUsuario(0);
                }

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Passo 1: Iniciar Assinatura
    const handleIniciarAssinatura = (plano) => {
        setPlanoSelecionado(plano);
        setModalEtapa('selecao');
        setModalEtapaDetalhes(null);
    };

    // Passo 2: Escolha do Método
    const handleSelectMethod = async (metodo) => {
        if (metodo === 'stripe') {
            await handleAssinarComStripe(planoSelecionado);
        } else if (metodo === 'saldo') {
            await pagarComSaldo(planoSelecionado);
        }
    };

    // --- NOVA FUNÇÃO: ASSINAR COM STRIPE ---
    const handleAssinarComStripe = async (plano) => {
        try {
            setLoading(true);
            
            // ATENÇÃO: Se você usa JWT, o backend pega o login pelo token.
            // Se precisar mandar manual:
            const loginUsuario = ""; // Pegue do seu AuthContext se necessário

            // Chama o Controller do Stripe
            const response = await api.post(`/stripe/checkout/${plano.id}`, { 
                loginUsuario: loginUsuario 
            });

            // O Backend devolve a URL segura do Stripe
            const { url } = response.data;

            // Redireciona o usuário (sai do site e vai pro Stripe)
            window.location.href = url;

        } catch (error) {
            console.error("Erro ao criar pagamento Stripe", error);
            alert("Erro ao conectar com Stripe: " + (error.response?.data?.message || "Tente novamente."));
            setLoading(false); // Só para o loading se der erro, senão ele sai da página
        }
    };

    // Pagamento com Saldo (Legado / Interno)
    const pagarComSaldo = async (plano) => {
        if (!window.confirm(`Confirma o pagamento de R$ ${plano.valorMensalidade.toFixed(2)} usando seu saldo?`)) return;

        try {
            setLoading(true);
            await api.post(`/assinatura/pagar-saldo/${plano.id}`);
            handleAssinaturaConcluida(`Assinatura realizada com sucesso usando seu saldo!`);
        } catch (error) {
            alert(error.response?.data?.message || "Erro ao processar pagamento com saldo.");
            setModalEtapa(null);
            setLoading(false);
        }
    };

    // Conclusão (Só usado para Saldo agora, pois Stripe redireciona)
    const handleAssinaturaConcluida = (message) => {
        setModalEtapa(null);
        setPlanoSelecionado(null);
        setToast({ show: true, message });
        
        if (message.includes('saldo')) {
            setSaldoUsuario(prev => prev - (planoSelecionado?.valorMensalidade || 0));
        }

        setTimeout(() => {
            setToast({ show: false, message: '' });
            navigate('/paciente/dashboard');
        }, 3000);
    };

    if (loading && !planos.length) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', border: `4px solid ${styles.colors.borderLight}`, borderTop: `4px solid ${styles.colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: styles.colors.textMuted }}>Carregando...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: styles.colors.background, padding: isMobile ? '20px' : '60px 20px' }}>
            
            {/* Toast de Sucesso */}
            {toast.show && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1200, backgroundColor: styles.colors.success, color: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideIn 0.3s ease-out' }}>
                    <FiCheckCircle size={20} /> {toast.message}
                </div>
            )}
            
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                     <h1 style={{fontSize: isMobile ? '32px' : '48px', fontWeight: '800', color: styles.colors.textDark, marginBottom: '15px'}}>
                        Invista na sua <span style={{ color: styles.colors.primary }}>Saúde</span>
                     </h1>
                     <div style={{marginTop: '10px', display: 'inline-block', padding: '8px 16px', backgroundColor: styles.colors.white, borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: styles.colors.textDark, fontSize: '14px', border: `1px solid ${styles.colors.borderLight}`}}>
                        <FiDollarSign style={{marginRight: '8px', color: styles.colors.success, marginBottom:'-2px'}} />
                        Seu Saldo: <strong>R$ {saldoUsuario.toFixed(2)}</strong>
                     </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
                    {planos.map((plano, index) => (
                        <PlanCard 
                            key={plano.id} 
                            plano={plano} 
                            onAssinar={handleIniciarAssinatura}
                            onVerDetalhes={setModalEtapaDetalhes}
                            styles={styles}
                            isPopular={planos.length >= 3 ? index === 1 : index === planos.length - 1}
                        />
                    ))}
                </div>
            </div>

            {/* --- MODAIS --- */}
            
            {/* 1. Detalhes */}
            {modalEtapaDetalhes && (
                <ModalDetalhesPlano
                    plano={modalEtapaDetalhes}
                    onClose={() => setModalEtapaDetalhes(null)}
                    onAssinar={handleIniciarAssinatura}
                    styles={styles}
                    isMobile={isMobile}
                />
            )}

            {/* 2. Seleção de Pagamento */}
            {modalEtapa === 'selecao' && planoSelecionado && (
                <ModalSelecaoPagamento 
                    plano={planoSelecionado}
                    saldoUsuario={saldoUsuario}
                    onClose={() => { setModalEtapa(null); setPlanoSelecionado(null); }}
                    onSelectMethod={handleSelectMethod}
                    styles={styles}
                    loading={loading} // Passa o loading para desabilitar botões
                    isMobile={isMobile}
                />
            )}

            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
};

export default PlanosClinicas;