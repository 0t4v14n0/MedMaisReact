import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import { FiEdit, FiToggleLeft, FiToggleRight, FiTrash2, FiSearch } from 'react-icons/fi';

// =================================================================
// HOOK DE RESPONSIVIDADE
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

// =================================================================
// COMPONENTES DE UI REUTILIZÁVEIS
// =================================================================
const InputField = ({ label, error, styles, colors, ...props }) => (
    <div style={{ width: '100%' }}>
        {label && <label style={styles.app.label}>{label}</label>}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {props.icon && <span style={{ position: 'absolute', left: '16px', color: colors.text_secondary || '#34495e', top: '50%', transform: 'translateY(-50%)' }}>{props.icon}</span>}
            <input style={{
                ...styles.app.input,
                boxSizing: 'border-box',
                paddingLeft: props.icon ? '44px' : '16px',
                ...(error && { borderColor: colors.danger })
            }} {...props} />
        </div>
        {error && <span style={{ color: colors.danger, fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

const Button = ({ children, onClick, type = 'button', disabled = false, variant = 'primary', styles, colors, icon, ...props }) => {
    const colorMap = {
        primary: { bg: colors.primary, text: colors.white },
        success: { bg: colors.success, text: colors.white },
        danger: { bg: colors.danger, text: colors.white },
        warning: { bg: colors.warning || '#f39c12', text: colors.white },
        secondary: { bg: colors.background_secondary || colors.lightGray, text: colors.text_secondary || '#34495e', border: `1px solid ${colors.border}` }
    };

    const currentVariant = colorMap[variant] || colorMap.primary;

    const style = {
        ...styles.app.button,
        backgroundColor: currentVariant.bg,
        color: currentVariant.text,
        border: currentVariant.border || 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: children ? '8px' : '0',
        padding: children ? '10px 15px' : '10px',
        minWidth: '40px',
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled} style={style} {...props}>
            {icon}
            {children}
        </button>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL: TabelaMedicos
// =================================================================
const TabelaMedicos = ({ onEdit, onToggleStatus, onDelete, onRefresh }) => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 820px)');
    
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMedicos = useCallback(async (searchTerm = "", page = 0) => {
        setLoading(true);
        try {
            const url = `/admin/medico/all?search=${encodeURIComponent(searchTerm)}&page=${page}`;
            const response = await api.get(url);
            const data = response.data.content || response.data || [];
            setMedicos(Array.isArray(data) ? data : []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error("Erro ao buscar médicos:", error);
            setMedicos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchMedicos(termoBusca, currentPage);
        }, 500);
        return () => clearTimeout(handler);
    }, [termoBusca, currentPage, fetchMedicos]);

    useEffect(() => {
        fetchMedicos();
    }, [onRefresh, fetchMedicos]);

    const getInitials = (name) => {
        if (!name) return 'M';
        const names = name.split(' ');
        let initials = names[0].substring(0, 1).toUpperCase();
        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    };

    const renderMedicoRow = (medico) => {
        const funcionario = medico.dataDetalhesFuncionario || {};
        const pessoa = funcionario.dataDetalhesPessoa || {};
        const nome = pessoa.nome || '';
        const email = pessoa.email || '';
        const fotoPerfilUrl = medico.fotoPerfilUrl || pessoa.fotoPerfilUrl || '';
        const crm = medico.crm || '';
        const especialidadesMedica = medico.especialidadesMedica || [];
        const status = funcionario.status || 'INATIVO';
        const isAtivo = status === 'ATIVO';

        return {
            id: medico.id || crm,
            nome, email, fotoPerfilUrl, crm, especialidadesMedica, isAtivo, medicoCompleto: medico
        };
    };

    const MedicosTable = () => {
        const customStyles = {
            table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
            th: {
                backgroundColor: colors.background_secondary || colors.lightGray,
                padding: '12px 15px', fontWeight: '600', color: colors.text_primary,
                borderBottom: `2px solid ${colors.border}`
            },
            td: { padding: '12px 15px', borderBottom: `1px solid ${colors.border}` },
        };

        return (
            <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: '8px', backgroundColor: colors.white }}>
                <table style={customStyles.table}>
                    <thead>
                        <tr>
                            <th style={customStyles.th}>Nome</th>
                            <th style={customStyles.th}>CRM</th>
                            <th style={customStyles.th}>Especialidades</th>
                            <th style={{...customStyles.th, textAlign: 'center'}}>Status</th>
                            <th style={{...customStyles.th, textAlign: 'right'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicos.map(medicoData => {
                            const { id, nome, email, fotoPerfilUrl, crm, especialidadesMedica, isAtivo, medicoCompleto } = renderMedicoRow(medicoData);
                            return (
                                <tr key={id}>
                                    <td style={customStyles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {fotoPerfilUrl ? (
                                                <img src={fotoPerfilUrl} alt={`Foto de ${nome}`} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: colors.primary_light || '#e0f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, fontWeight: 'bold' }}>
                                                    {getInitials(nome)}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: '600', color: colors.text_primary }}>{nome}</div>
                                                <div style={{ fontSize: '12px', color: colors.text_secondary }}>{email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={customStyles.td}>{crm}</td>
                                    <td style={customStyles.td}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {especialidadesMedica.map(e => (
                                                <span key={e.id} style={{ padding: '4px 10px', borderRadius: '16px', backgroundColor: colors.primary_light || '#e0f7f5', color: colors.primary, fontSize: '12px', fontWeight: '500' }}>
                                                    {e.nome}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{...customStyles.td, textAlign: 'center'}}>
                                        <span style={{ padding: '6px 12px', borderRadius: '99px', color: 'white', fontSize: '12px', fontWeight: '600', backgroundColor: isAtivo ? colors.success : colors.danger }}>
                                            {isAtivo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td style={{...customStyles.td, textAlign: 'right'}}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <Button title="Editar" styles={styles} colors={colors} variant="primary" onClick={() => onEdit(medicoCompleto)} icon={<FiEdit size={16} />} />
                                            <Button title={isAtivo ? 'Inativar' : 'Ativar'} styles={styles} colors={colors} variant={isAtivo ? 'warning' : 'success'} onClick={() => onToggleStatus(medicoCompleto)} icon={isAtivo ? <FiToggleLeft size={16} /> : <FiToggleRight size={16} />} />
                                            <Button title="Excluir" styles={styles} colors={colors} variant="danger" onClick={() => onDelete(medicoCompleto)} icon={<FiTrash2 size={16} />} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const MedicosGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {medicos.map(medicoData => {
                const { id, nome, email, fotoPerfilUrl, crm, especialidadesMedica, isAtivo, medicoCompleto } = renderMedicoRow(medicoData);
                return (
                    <div key={id} style={{ ...styles.app.card, padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                             {fotoPerfilUrl ? (
                                <img src={fotoPerfilUrl} alt={`Foto de ${nome}`} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: colors.primary_light || '#e0f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, fontWeight: 'bold', fontSize: '18px' }}>
                                    {getInitials(nome)}
                                </div>
                            )}
                            <div>
                                <h4 style={{ margin: 0, color: colors.primary }}>{nome}</h4>
                                <div style={{ fontSize: '12px', color: colors.text_secondary }}>{email}</div>
                            </div>
                        </div>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>CRM:</strong> {crm}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ padding: '6px 12px', borderRadius: '99px', color: 'white', fontSize: '12px', fontWeight: '600', backgroundColor: isAtivo ? colors.success : colors.danger }}>
                                {isAtivo ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '15px', borderTop: `1px solid ${colors.border}`, paddingTop: '15px' }}>
                            <Button styles={styles} colors={colors} variant="primary" onClick={() => onEdit(medicoCompleto)} icon={<FiEdit size={16} />}>Editar</Button>
                            <Button styles={styles} colors={colors} variant="danger" onClick={() => onDelete(medicoCompleto)} icon={<FiTrash2 size={16} />}>Excluir</Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );


    return (
        <div style={{ ...styles.app.card, backgroundColor: colors.background_secondary || colors.lightGray, padding: isMobile ? '15px' : '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ ...styles.app.title, margin: 0, border: 'none', padding: 0 }}>Médicos Cadastrados</h2>
                    <p style={{ margin: '4px 0 0', color: colors.text_secondary, fontSize: '15px' }}>Busque, edite e gerencie os médicos da clínica.</p>
                </div>
                <div style={{ width: isMobile ? '100%' : 'auto', maxWidth: '400px' }}>
                    <InputField
                        styles={styles} colors={colors}
                        placeholder="Buscar médico..."
                        value={termoBusca}
                        icon={<FiSearch size={16} />}
                        onChange={(e) => { setTermoBusca(e.target.value); setCurrentPage(0); }}
                    />
                </div>
            </div>

            {loading && medicos.length === 0 ? <p style={{textAlign: 'center', color: colors.text_secondary, padding: '20px'}}>Carregando médicos...</p> : 
            medicos.length === 0 ? <p style={{textAlign: 'center', color: colors.text_secondary, padding: '20px'}}>Nenhum médico encontrado.</p> :
            (isMobile ? <MedicosGrid /> : <MedicosTable />)}

            {medicos.length > 0 && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${colors.border}` }}>
                    <Button styles={styles} colors={colors} variant="secondary" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>Anterior</Button>
                    <span style={{ color: colors.text_primary, fontSize: '14px', fontWeight: '500' }}>
                        Página {currentPage + 1} de {totalPages}
                    </span>
                    <Button styles={styles} colors={colors} variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>Próxima</Button>
                </div>
            )}
        </div>
    );
};

export default TabelaMedicos;