import React, { useState } from 'react';
import api from '../../api/api'; // Ajuste o caminho se necessário
import { useTheme } from '../../contexts/ThemeContext'; // Ajuste o caminho se necessário
import { generateStyles } from '../../styles/globalStyles'; // Ajuste o caminho se necessário

// =================================================================
// HOOK DE RESPONSIVIDADE
// =================================================================
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    React.useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);
    return matches;
};

// =================================================================
// FUNÇÕES UTILITÁRIAS
// =================================================================
const formatDateToISO = (date) => date.toISOString().split('T')[0];
const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
const formatarData = (dataString) => {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
};

// =================================================================
// SUB-COMPONENTES DE UI
// =================================================================
const InputField = ({ label, styles, colors, ...props }) => (
    <div style={{ flex: 1 }}>
        <label style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: '500',
            fontSize: '14px',
            color: colors.text_primary || colors.textDark
        }}>{label}</label>
        <input style={{
            ...styles.app.input,
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.background,
            color: colors.text_primary || colors.textDark,
            fontSize: '14px',
        }} {...props} />
    </div>
);

const Card = ({ title, children, styles, colors }) => (
    <div style={{
        ...styles.app.card,
        backgroundColor: colors.background_card || colors.white,
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: `1px solid ${colors.border}`
    }}>
        <h3 style={{
            ...styles.app.subtitle,
            color: colors.text_primary || colors.textDark,
            marginTop: 0,
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${colors.border}`
        }}>{title}</h3>
        {children}
    </div>
);

const Stat = ({ label, value, colors }) => (
    <p style={{ margin: '10px 0', fontSize: '15px', color: colors.text_secondary || colors.textMuted }}>
        <strong style={{ color: colors.text_primary || colors.textDark }}>{label}:</strong> {value}
    </p>
);

// =================================================================
// COMPONENTE PRINCIPAL: GerenciarRelatorios
// =================================================================

const GerenciarRelatorios = () => {
    const { isDarkMode } = useTheme();
    
    const theme = generateStyles(isDarkMode) || {};
    const styles = theme.styles || { app: {} }; 
    const colors = theme.colors || {};

    const isMobile = useMediaQuery('(max-width: 768px)');
    const [inicio, setInicio] = useState(() => formatDateToISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [fim, setFim] = useState(() => formatDateToISO(new Date()));
    const [relatorio, setRelatorio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGerarRelatorio = async () => {
        setLoading(true);
        setError('');
        setRelatorio(null);
        try {
            const response = await api.get('/admin/relatorios/geral', { params: { inicio, fim } });
            setRelatorio(response.data);
        } catch (err) {
            setError('Falha ao buscar o relatório. Tente novamente mais tarde.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calcularTaxaCancelamento = (total, canceladas) => {
        if (!total || total === 0) return "0.0%";
        return `${((canceladas / total) * 100).toFixed(1)}%`;
    };

    return (
        <div style={{
            ...styles.app.card,
            backgroundColor: colors.background_secondary || colors.lightGray,
            padding: isMobile ? '1rem' : '2rem',
            borderRadius: '12px',
        }}>
            <h2 style={{
                ...styles.app.title,
                color: colors.text_primary || colors.textDark,
                textAlign: 'center',
                marginBottom: '2rem'
            }}>
                Relatório Geral da Clínica 📈
            </h2>

            <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-end',
                flexDirection: isMobile ? 'column' : 'row',
                padding: '20px',
                marginBottom: '30px',
                backgroundColor: colors.background_card || colors.white,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
            }}>
                <InputField
                    label="Data de Início"
                    type="date"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    styles={styles}
                    colors={colors}
                />
                <InputField
                    label="Data Final"
                    type="date"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
                    styles={styles}
                    colors={colors}
                />
                <button
                    onClick={handleGerarRelatorio}
                    disabled={loading}
                    style={{
                        ...styles.app.button,
                        backgroundColor: loading ? colors.secondary || colors.disabled : colors.primary,
                        width: isMobile ? '100%' : 'auto',
                        padding: '10px 20px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? 'Gerando...' : 'Gerar Relatório'}
                </button>
            </div>

            {error && <p style={{ color: colors.danger, textAlign: 'center' }}>{error}</p>}
            {!loading && !relatorio && !error && <p style={{ color: colors.text_secondary || colors.textMuted, textAlign: 'center' }}>Selecione um período e clique em "Gerar Relatório" para começar.</p>}
            {loading && <p style={{ color: colors.text_primary || colors.textDark, textAlign: 'center' }}>Carregando dados...</p>}
            
            {relatorio && (
                <div>
                    <h3 style={{ ...styles.app.subtitle, textAlign: 'center' }}>
                        Exibindo resultados para o período de {formatarData(relatorio.periodo.inicio)} a {formatarData(relatorio.periodo.fim)}
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '20px',
                        marginTop: '2rem'
                    }}>
                        {/* ================================================================ */}
                        {/* CÓDIGO ATUALIZADO PARA O NOVO JSON A PARTIR DAQUI               */}
                        {/* ================================================================ */}
                        
                        <Card title="💰 Financeiro" styles={styles} colors={colors}>
                            <Stat label="Receita Total" value={formatarMoeda(relatorio.financeiro.receitaTotal)} colors={colors} />
                            <Stat label="Receita de Consultas" value={formatarMoeda(relatorio.financeiro.receitaConsultas)} colors={colors} />
                            <Stat label="Receita de Exames" value={formatarMoeda(relatorio.financeiro.receitaExames)} colors={colors} />
                            <Stat label="Receita de Assinaturas" value={formatarMoeda(relatorio.financeiro.receitaAssinaturas)} colors={colors} />
                            <Stat label="Receita de Aulas" value={formatarMoeda(relatorio.financeiro.receitaAulas)} colors={colors} />
                        </Card>

                        <Card title="🩺 Consultas" styles={styles} colors={colors}>
                            <Stat label="Total" value={relatorio.consultas.total} colors={colors} />
                            <Stat label="Canceladas" value={relatorio.consultas.canceladas} colors={colors} />
                            <Stat label="Taxa de Cancelamento" value={calcularTaxaCancelamento(relatorio.consultas.total, relatorio.consultas.canceladas)} colors={colors} />
                        </Card>

                        <Card title="🔬 Exames" styles={styles} colors={colors}>
                            <Stat label="Total Realizados" value={relatorio.exames.total} colors={colors} />
                        </Card>
                        
                        <Card title="💳 Assinaturas" styles={styles} colors={colors}>
                            <Stat label="Ativas" value={relatorio.assinaturas.ativos} colors={colors} />
                            <Stat label="Novas no Período" value={relatorio.assinaturas.novos} colors={colors} />
                            <Stat label="Canceladas no Período" value={relatorio.assinaturas.cancelados} colors={colors} />
                            <Stat label="Ticket Médio" value={formatarMoeda(relatorio.assinaturas.ticketMedio)} colors={colors} />
                        </Card>

                        <Card title="🤸 Aulas em Grupo" styles={styles} colors={colors}>
                            <Stat label="Total de Alunos" value={relatorio.aulas.total} colors={colors} />
                            <Stat label="Participação Média" value={(relatorio.aulas.participacaoMedia || 0).toFixed(1)} colors={colors} />
                        </Card>

                        <Card title="🧑‍⚕️ Equipe" styles={styles} colors={colors}>
                            <Stat label="Médicos Ativos" value={relatorio.funcionarios.medicosAtivos} colors={colors} />
                            <Stat label="Funcionários Ativos" value={relatorio.funcionarios.funcionariosAtivos} colors={colors} />
                            <Stat label="Ocupação Média (Médicos)" value={`${(relatorio.funcionarios.ocupacaoMedia || 0).toFixed(1)}%`} colors={colors} />
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciarRelatorios;