import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { generateStyles } from '../styles/globalStyles';
import { 
    FiMenu, FiX, FiClipboard, FiCalendar, 
    FiHome, FiUser, FiArrowRight, FiActivity 
} from 'react-icons/fi';

// Componentes
import GerenciarPedidosExame from '../components/laboratorio/GerenciarPedidosExame';
import VisualizarAgendaColetas from '../components/laboratorio/VisualizarAgendaColetas';

// =================================================================
// 🎨 DEFINIÇÃO DA COR DA ROLE (LABORATÓRIO)
// =================================================================
const ROLE_COLOR = '#2563eb'; // Azul Royal (Laboratório)
const ROLE_BG_TINT = '#2563eb15'; // Azul suave para fundos

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
            // Usa a cor da Role para o fundo ativo e texto
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

const QuickActionCard = ({ title, desc, icon, onClick, styles, color }) => {
    const iconColor = color || ROLE_COLOR;
    const bgTint = `${iconColor}15`;

    return (
        <div 
            onClick={onClick}
            style={{
                backgroundColor: styles.colors.white, padding: '24px', borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
                cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '15px',
                position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Detalhe decorativo */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: iconColor }}></div>

            <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                backgroundColor: bgTint, color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
            }}>
                {icon}
            </div>
            <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: styles.colors.textDark, fontWeight: '700' }}>{title}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: styles.colors.textMuted }}>{desc}</p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: iconColor, fontWeight: '700' }}>
                Acessar <FiArrowRight />
            </div>
        </div>
    );
};

// =================================================================
// 🧪 DASHBOARD LABORATÓRIO
// =================================================================

const DashboardLaboratorio = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;

    // Fundo neutro para contraste
    const dashboardBgColor = isDarkMode ? '#121212' : '#f3f4f6';

    const [opcaoSelecionada, setOpcaoSelecionada] = useState('Home');
    const [menuAberto, setMenuAberto] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    const renderConteudo = () => {
        switch (opcaoSelecionada) {
            case "FilaExames": return <GerenciarPedidosExame />;
            case "AgendaColetas": return <VisualizarAgendaColetas />;
            default: return (
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '10px' : '30px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.textDark, marginBottom: '10px' }}>
                            Portal do <span style={{ color: ROLE_COLOR }}>Laboratório</span> 👋
                        </h1>
                        <p style={{ color: colors.textMuted, fontSize: '16px' }}>
                            Gerencie filas de exames e agenda de coletas.
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '20px' 
                    }}>
                        <QuickActionCard 
                            title="Fila de Exames" 
                            desc="Gerencie pedidos, insira resultados e libere laudos."
                            icon={<FiClipboard />} 
                            onClick={() => setOpcaoSelecionada('FilaExames')} 
                            styles={styles} 
                        />
                        <QuickActionCard 
                            title="Agenda de Coletas" 
                            desc="Visualize os horários agendados para coleta de material."
                            icon={<FiCalendar />} 
                            onClick={() => setOpcaoSelecionada('AgendaColetas')} 
                            styles={styles} 
                            color={colors.info} // Um tom diferente para diferenciar
                        />
                        {/* Exemplo de card extra para preencher o grid se necessário */}
                        <QuickActionCard 
                            title="Painel de Controle" 
                            desc="Visão geral de produtividade e exames pendentes."
                            icon={<FiActivity />} 
                            onClick={() => {}} 
                            styles={styles} 
                            color="#8b5cf6" 
                        />
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: dashboardBgColor, overflow: 'hidden' }}>
            
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
                        {/* Logo com Azul */}
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: ROLE_COLOR, letterSpacing: '-0.5px' }}>medMais</h2>
                        <span style={{ fontSize: '11px', color: colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700' }}>Laboratório</span>
                    </div>
                    {isMobile && <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', color: colors.textMuted }}><FiX size={24} /></button>}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
                    <SidebarItem icon={<FiHome />} label="Início" active={opcaoSelecionada === 'Home'} onClick={() => handleMenuClick('Home')} styles={styles} />
                    
                    <div style={{ height: '1px', backgroundColor: colors.borderLight, margin: '10px 20px' }} />
                    
                    <SidebarItem icon={<FiClipboard />} label="Fila de Exames" active={opcaoSelecionada === 'FilaExames'} onClick={() => handleMenuClick('FilaExames')} styles={styles} />
                    <SidebarItem icon={<FiCalendar />} label="Agenda de Coletas" active={opcaoSelecionada === 'AgendaColetas'} onClick={() => handleMenuClick('AgendaColetas')} styles={styles} />
                </ul>

                <div style={{ padding: '20px', borderTop: `1px solid ${colors.borderLight}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: dashboardBgColor, borderRadius: '12px' }}>
                        {/* Avatar Azul */}
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: ROLE_COLOR, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiUser />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: colors.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Técnico</p>
                            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>Laboratório</p>
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
                        <span style={{ fontWeight: '700', color: ROLE_COLOR }}>medMais</span>
                        <button onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', color: colors.textDark }}><FiMenu size={24} /></button>
                    </div>
                )}

                {renderConteudo()}
            </main>
        </div>
    );
};

export default DashboardLaboratorio;