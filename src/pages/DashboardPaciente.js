import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { generateStyles } from '../styles/globalStyles';
import { 
    FiMenu, FiX, FiHome, FiCalendar, FiActivity, FiVideo, 
    FiUser, FiClipboard, FiDollarSign, FiCreditCard, 
    FiPlusCircle, FiArrowRight 
} from 'react-icons/fi';

// Componentes das Funcionalidades
import Consulta from '../components/paciente/Consulta/Consulta';
import AtualizarDados from '../components/paciente/AtualizarDados';
import HistoricoDoencas from '../components/paciente/HistoricoDoencas';
import PlanosClinica from '../components/paciente/PlanosClinica';
import Exames from '../components/paciente/Exames';
import HistoricoTransacoes from '../components/paciente/HistoricoTransacoes';
import Aulas from '../components/paciente/Aulas';
import CreditarSaldo from '../components/paciente/RecargaSaldo';

// =================================================================
// 🎨 UI COMPONENTS
// =================================================================

const SidebarItem = ({ icon, label, active, onClick, styles }) => (
    <li 
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 20px', margin: '8px 12px', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.2s ease',
            backgroundColor: active ? `${styles.colors.primary}15` : 'transparent',
            color: active ? styles.colors.primary : styles.colors.textMuted,
            fontWeight: active ? '600' : '500',
            borderLeft: active ? `4px solid ${styles.colors.primary}` : '4px solid transparent'
        }}
    >
        <span style={{ fontSize: '20px', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '14px' }}>{label}</span>
    </li>
);

const QuickActionCard = ({ title, desc, icon, onClick, styles, color }) => {
    const iconColor = color || styles.colors.primary;
    return (
        <div 
            onClick={onClick}
            style={{
                backgroundColor: styles.colors.white, padding: '24px', borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
                cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '15px'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                backgroundColor: `${iconColor}15`, color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
            }}>
                {icon}
            </div>
            <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: styles.colors.textDark }}>{title}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: styles.colors.textMuted }}>{desc}</p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: iconColor, fontWeight: '600' }}>
                Acessar <FiArrowRight />
            </div>
        </div>
    );
};

// =================================================================
// 🏥 DASHBOARD PACIENTE
// =================================================================

const DashboardPaciente = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;

    const [opcaoSelecionada, setOpcaoSelecionada] = useState("Home");
    const [menuAberto, setMenuAberto] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setMenuAberto(true);
            else setMenuAberto(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { key: "Consulta", label: "Consultas", icon: <FiCalendar /> },
        { key: "Exames", label: "Meus Exames", icon: <FiActivity /> },
        { key: "Aulas", label: "Aulas e Conteúdos", icon: <FiVideo /> },
        { key: "PlanosClinica", label: "Planos Disponíveis", icon: <FiCreditCard /> },
        { key: "HistoricoTransacoes", label: "Financeiro", icon: <FiDollarSign /> },
        { key: "CreditarSaldo", label: "Adicionar Saldo", icon: <FiPlusCircle /> },
        { key: "HistoricoDoencas", label: "Histórico Clínico", icon: <FiClipboard /> },
        { key: "AtualizarDados", label: "Meu Perfil", icon: <FiUser /> },
    ];

    const handleMenuClick = (key) => {
        setOpcaoSelecionada(key);
        if (isMobile) setMenuAberto(false);
    };

    const renderConteudo = () => {
        switch (opcaoSelecionada) {
            case "Consulta": return <Consulta />;
            case "Exames": return <Exames />;
            case "Aulas": return <Aulas />;
            case "AtualizarDados": return <AtualizarDados />;
            case "HistoricoDoencas": return <HistoricoDoencas />;
            case "HistoricoTransacoes": return <HistoricoTransacoes />;
            case "PlanosClinica": return <PlanosClinica />;
            // Caso Creditar Saldo use um componente específico, adicione aqui. 
            // Se for parte do HistoricoTransacoes, redirecione.
            case "CreditarSaldo": return <CreditarSaldo abaInicial="credito" />; 
            
            default: return (
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '10px' : '30px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.textDark, marginBottom: '10px' }}>
                            Olá, Paciente 👋
                        </h1>
                        <p style={{ color: colors.textMuted, fontSize: '16px' }}>
                            Cuide da sua saúde. O que vamos fazer hoje?
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '20px' 
                    }}>
                        <QuickActionCard 
                            title="Agendar Consulta" 
                            desc="Marque atendimentos presenciais ou online com nossos especialistas."
                            icon={<FiCalendar />} 
                            onClick={() => setOpcaoSelecionada('Consulta')} 
                            styles={styles} 
                        />
                        <QuickActionCard 
                            title="Ver Resultados" 
                            desc="Acompanhe o status e baixe os resultados dos seus exames."
                            icon={<FiActivity />} 
                            onClick={() => setOpcaoSelecionada('Exames')} 
                            styles={styles} 
                            color={colors.info}
                        />
                        <QuickActionCard 
                            title="Financeiro" 
                            desc="Verifique seu histórico de pagamentos e adicione saldo."
                            icon={<FiDollarSign />} 
                            onClick={() => setOpcaoSelecionada('HistoricoTransacoes')} 
                            styles={styles} 
                            color={colors.success}
                        />
                        <QuickActionCard 
                            title="Conteúdos e Aulas" 
                            desc="Acesse materiais exclusivos para sua saúde e bem-estar."
                            icon={<FiVideo />} 
                            onClick={() => setOpcaoSelecionada('Aulas')} 
                            styles={styles} 
                            color="#8b5cf6"
                        />
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: colors.background, overflow: 'hidden' }}>
            
            {/* Overlay Mobile */}
            {isMobile && menuAberto && (
                <div 
                    onClick={() => setMenuAberto(false)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 }}
                />
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
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.primary }}>medMais</h2>
                        <span style={{ fontSize: '12px', color: colors.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Área do Paciente</span>
                    </div>
                    {isMobile && <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', color: colors.textMuted }}><FiX size={24} /></button>}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
                    <SidebarItem 
                        icon={<FiHome />} label="Início" 
                        active={opcaoSelecionada === 'Home'} 
                        onClick={() => handleMenuClick('Home')} 
                        styles={styles} 
                    />
                    <div style={{ height: '1px', backgroundColor: colors.borderLight, margin: '10px 20px' }} />
                    {menuItems.map(item => (
                        <SidebarItem 
                            key={item.key} 
                            icon={item.icon} 
                            label={item.label} 
                            active={opcaoSelecionada === item.key} 
                            onClick={() => handleMenuClick(item.key)} 
                            styles={styles} 
                        />
                    ))}
                </ul>

                <div style={{ padding: '20px', borderTop: `1px solid ${colors.borderLight}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: colors.background, borderRadius: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: colors.success, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiUser />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: colors.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Minha Conta</p>
                            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>Paciente</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main style={{ flex: 1, overflowY: 'auto', position: 'relative', width: '100%' }}>
                {/* Header Mobile */}
                {isMobile && (
                    <div style={{ 
                        padding: '15px 20px', backgroundColor: colors.white, 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: `1px solid ${colors.borderLight}`,
                        position: 'sticky', top: 0, zIndex: 900
                    }}>
                        <span style={{ fontWeight: '700', color: colors.primary }}>medMais</span>
                        <button onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', color: colors.textDark }}><FiMenu size={24} /></button>
                    </div>
                )}

                {renderConteudo()}
            </main>
        </div>
    );
};

export default DashboardPaciente;