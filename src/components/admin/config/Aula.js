import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';

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

const Toast = ({ message, type, onClose, colors }) => (
    <div style={{
        position: 'fixed', top: '20px', right: '20px', padding: '12px 20px',
        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1002,
        backgroundColor: type === 'success' ? colors.success : colors.danger,
        color: 'white', display: 'flex', alignItems: 'center', gap: '10px',
        transition: 'all 0.3s ease', maxWidth: 'calc(100% - 40px)', fontSize: '14px',
        borderLeft: `5px solid ${type === 'success' ? '#27ae60' : '#c0392b'}`
    }}>
        {message}
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', marginLeft: 'auto' }}>&times;</button>
    </div>
);

const Modal = ({ title, children, onCancel, styles, maxWidth = '600px' }) => (
    <div style={styles.app.modalOverlay}>
        <div style={{ ...styles.app.modalContent, ...styles.app.card, width: '95%', maxWidth, margin: '20px auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={styles.app.modalHeader}>
                <h3 style={styles.app.modalTitle}>{title}</h3>
                <button onClick={onCancel} style={styles.app.closeButton}>&times;</button>
            </div>
            <div style={{ padding: "20px", overflowY: 'auto', flex: 1 }}>{children}</div>
        </div>
    </div>
);

const InputField = ({ label, styles, ...props }) => (
    <div style={styles.app.formGroup}>
        {label && <label style={styles.app.label}>{label}</label>}
        <input style={{ ...styles.app.input, width: '100%', boxSizing: 'border-box' }} {...props} />
    </div>
);

const TextareaField = ({ label, styles, ...props }) => (
    <div style={styles.app.formGroup}>
        {label && <label style={styles.app.label}>{label}</label>}
        <textarea style={{ ...styles.app.textarea, width: '100%', boxSizing: 'border-box', minHeight: '100px' }} {...props}></textarea>
    </div>
);

const Pill = ({ text, color, backgroundColor }) => (
    <span style={{
        padding: '5px 12px', borderRadius: '16px', color, backgroundColor,
        fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap'
    }}>
        {text}
    </span>
);

// =================================================================
// MODAL DE DETALHES DA AULA
// =================================================================
const DetalhesAulaModal = ({ aula, onClose, styles }) => {
    const { colors } = styles;

    const DetailItem = ({ label, value }) => (
        <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: colors.text_primary, display: 'block', fontSize: '14px', marginBottom: '5px' }}>{label}</strong>
            <span style={{ color: colors.text_secondary, fontSize: '15px' }}>{value || 'N/A'}</span>
        </div>
    );

    return (
        <Modal title={`Detalhes da Aula: ${aula.nome}`} onCancel={onClose} styles={styles} maxWidth="500px">
            <div style={{ lineHeight: '1.6' }}>
                <DetailItem label="Nome" value={aula.nome} />
                <DetailItem label="Descrição" value={aula.descricao} />
                <DetailItem label="Status" value={
                    <Pill 
                        text={aula.ativa ? 'Ativa' : 'Inativa'} 
                        color={colors.white} 
                        backgroundColor={aula.ativa ? colors.success : colors.danger} 
                    />
                } />
                <DetailItem label="ID" value={aula.id} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${colors.border}` }}>
                <button onClick={onClose} style={{ ...styles.app.button, backgroundColor: colors.secondary }}>Fechar</button>
            </div>
        </Modal>
    );
};

// =================================================================
// MODAL DE CRIAÇÃO/EDIÇÃO DA AULA
// =================================================================
const AulaModal = ({ onClose, onSave, aula, styles }) => {
    const { colors } = styles;
    const [formData, setFormData] = useState({
        nome: aula?.nome || '',
        descricao: aula?.descricao || ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        } else if (formData.nome.trim().length < 2) {
            newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
        }
        
        if (!formData.descricao.trim()) {
            newErrors.descricao = 'Descrição é obrigatória';
        } else if (formData.descricao.trim().length < 10) {
            newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <Modal title={aula ? 'Editar Aula' : 'Adicionar Nova Aula'} onCancel={onClose} styles={styles}>
            <form onSubmit={handleSubmit} style={styles.app.form}>
                <InputField 
                    styles={styles} 
                    label="Nome da Aula *" 
                    name="nome" 
                    value={formData.nome} 
                    onChange={handleChange} 
                    placeholder="Ex: Yoga Básico, Pilates Avançado..."
                />
                {errors.nome && <span style={{ color: colors.danger, fontSize: '12px', marginTop: '5px' }}>{errors.nome}</span>}

                <TextareaField 
                    styles={styles} 
                    label="Descrição *" 
                    name="descricao" 
                    value={formData.descricao} 
                    onChange={handleChange}
                    placeholder="Descreva os objetivos, público-alvo e benefícios desta aula..."
                />
                {errors.descricao && <span style={{ color: colors.danger, fontSize: '12px', marginTop: '5px' }}>{errors.descricao}</span>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                    <button type="button" onClick={onClose} style={{ ...styles.app.button, backgroundColor: colors.secondary }}>Cancelar</button>
                    <button type="submit" style={{ ...styles.app.button, backgroundColor: colors.success }}>
                        {aula ? 'Atualizar Aula' : 'Criar Aula'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL DE AULAS
// =================================================================
const Aula = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 820px)');

    const [aulas, setAulas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [aulaEmEdicao, setAulaEmEdicao] = useState(null);
    const [aulaEmDetalhe, setAulaEmDetalhe] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const mostrarToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => { setToast({ show: false, message: '' }); }, 3000);
    };

    const fetchAulas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/aula/all');
            setAulas(response.data || []);
        } catch (err) {
            console.error('Erro ao carregar aulas:', err);
            mostrarToast("Erro ao carregar aulas.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchAulas(); 
    }, []);

    const handleSave = async (formData) => {
        const isEditing = !!aulaEmEdicao;
        const endpoint = isEditing ? `/admin/aula/atualizar/${aulaEmEdicao.id}` : '/admin/aula/criar';
        const method = isEditing ? 'put' : 'post';
        
        try {
            await api[method](endpoint, formData);
            mostrarToast(`Aula ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
            handleCloseModals();
            fetchAulas();
        } catch (error) {
            console.error('Erro ao salvar aula:', error);
            mostrarToast(error.response?.data?.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} aula.`, "error");
        }
    };

    const handleDesativarAula = async (id) => {
        if (!window.confirm('Tem certeza que deseja desativar esta aula?')) return;
        
        try {
            await api.get(`/admin/aula/desativar/${id}`);
            mostrarToast('Aula desativada com sucesso!');
            fetchAulas();
        } catch (error) {
            console.error('Erro ao desativar aula:', error);
            mostrarToast('Erro ao desativar aula.', "error");
        }
    };

    const handleAtivarAula = async (id) => {
        try {
            await api.put(`/admin/aula/atualizar/${id}`, { 
                nome: aulas.find(a => a.id === id)?.nome,
                descricao: aulas.find(a => a.id === id)?.descricao
            });
            mostrarToast('Aula ativada com sucesso!');
            fetchAulas();
        } catch (error) {
            console.error('Erro ao ativar aula:', error);
            mostrarToast('Erro ao ativar aula.', "error");
        }
    };

    const handleDeletarAula = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir permanentemente esta aula? Esta ação não pode ser desfeita.')) return;
        
        try {
            await api.get(`/admin/aula/deletar/${id}`);
            mostrarToast('Aula excluída com sucesso!');
            fetchAulas();
        } catch (error) {
            console.error('Erro ao excluir aula:', error);
            mostrarToast('Erro ao excluir aula.', "error");
        }
    };

    const handleOpenEditModal = (aula) => { 
        setAulaEmEdicao(aula); 
        setShowFormModal(true); 
    };

    const handleOpenDetailsModal = (aula) => { 
        setAulaEmDetalhe(aula); 
        setShowDetailsModal(true); 
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDetailsModal(false);
        setAulaEmEdicao(null);
        setAulaEmDetalhe(null);
    };

    // Estilos para tabela
    const tableStyles = {
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '14px',
        },
        th: {
            backgroundColor: isDarkMode ? '#2d2d2d' : '#f9f9f9',
            padding: '12px 15px',
            fontWeight: '600',
            color: isDarkMode ? '#f5f5f5' : '#2c3e50',
            borderBottom: `2px solid ${isDarkMode ? '#444' : '#ddd'}`
        },
        td: {
            padding: '12px 15px',
            borderBottom: `1px solid ${isDarkMode ? '#444' : '#eee'}`,
            color: isDarkMode ? '#bdc3c7' : '#34495e'
        }
    };

    const AulasTable = () => (
        <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: '8px', backgroundColor: colors.white }}>
            <table style={tableStyles.table}>
                <thead>
                    <tr>
                        <th style={tableStyles.th}>Nome</th>
                        <th style={tableStyles.th}>Descrição</th>
                        <th style={{...tableStyles.th, textAlign: 'center'}}>Status</th>
                        <th style={{...tableStyles.th, textAlign: 'right'}}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {aulas.map(aula => (
                        <tr key={aula.id}>
                            <td style={{...tableStyles.td, fontWeight: '500', color: colors.text_primary}}>{aula.nome}</td>
                            <td style={tableStyles.td}>
                                {aula.descricao && aula.descricao.length > 100 
                                    ? `${aula.descricao.substring(0, 100)}...` 
                                    : aula.descricao}
                            </td>
                            <td style={{...tableStyles.td, textAlign: 'center'}}>
                                <Pill 
                                    text={aula.ativa ? 'Ativa' : 'Inativa'} 
                                    color={colors.white} 
                                    backgroundColor={aula.ativa ? colors.success : colors.danger} 
                                />
                            </td>
                            <td style={{...tableStyles.td, textAlign: 'right'}}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <button 
                                        onClick={() => handleOpenDetailsModal(aula)} 
                                        style={{ ...styles.app.button, backgroundColor: colors.info, padding: '6px 12px', margin: 0, fontSize: '12px' }}
                                    >
                                        👁️ Ver
                                    </button>
                                    <button 
                                        onClick={() => handleOpenEditModal(aula)} 
                                        style={{ ...styles.app.button, backgroundColor: colors.warning || '#f39c12', padding: '6px 12px', margin: 0, fontSize: '12px' }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    {aula.ativa ? (
                                        <button 
                                            onClick={() => handleDesativarAula(aula.id)} 
                                            style={{ ...styles.app.button, backgroundColor: colors.secondary, padding: '6px 12px', margin: 0, fontSize: '12px' }}
                                        >
                                            ⏸️ Desativar
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleAtivarAula(aula.id)} 
                                            style={{ ...styles.app.button, backgroundColor: colors.success, padding: '6px 12px', margin: 0, fontSize: '12px' }}
                                        >
                                            ▶️ Ativar
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDeletarAula(aula.id)} 
                                        style={{ ...styles.app.button, backgroundColor: colors.danger, padding: '6px 12px', margin: 0, fontSize: '12px' }}
                                    >
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const AulasGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {aulas.map(aula => (
                <div key={aula.id} style={{ ...styles.app.card, padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: colors.primary, flex: 1 }}>{aula.nome}</h4>
                        <Pill 
                            text={aula.ativa ? 'Ativa' : 'Inativa'} 
                            color={colors.white} 
                            backgroundColor={aula.ativa ? colors.success : colors.danger} 
                        />
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: colors.text_secondary }}>
                        {aula.descricao && aula.descricao.length > 120 
                            ? `${aula.descricao.substring(0, 120)}...` 
                            : aula.descricao}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', borderTop: `1px solid ${colors.border}`, paddingTop: '15px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => handleOpenDetailsModal(aula)} 
                            style={{ ...styles.app.button, backgroundColor: colors.info, flex: '1 1 80px', margin: 0, fontSize: '12px' }}
                        >
                            👁️ Ver
                        </button>
                        <button 
                            onClick={() => handleOpenEditModal(aula)} 
                            style={{ ...styles.app.button, backgroundColor: colors.warning || '#f39c12', flex: '1 1 80px', margin: 0, fontSize: '12px' }}
                        >
                            ✏️ Editar
                        </button>
                        {aula.ativa ? (
                            <button 
                                onClick={() => handleDesativarAula(aula.id)} 
                                style={{ ...styles.app.button, backgroundColor: colors.secondary, flex: '1 1 100px', margin: 0, fontSize: '12px' }}
                            >
                                ⏸️ Desativar
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleAtivarAula(aula.id)} 
                                style={{ ...styles.app.button, backgroundColor: colors.success, flex: '1 1 80px', margin: 0, fontSize: '12px' }}
                            >
                                ▶️ Ativar
                            </button>
                        )}
                        <button 
                            onClick={() => handleDeletarAula(aula.id)} 
                            style={{ ...styles.app.button, backgroundColor: colors.danger, flex: '1 1 80px', margin: 0, fontSize: '12px' }}
                        >
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ padding: '20px 0' }}>
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '' })} colors={colors} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h3 style={{ ...styles.app.subtitle, margin: 0, color: colors.text_primary }}>Gerenciar Aulas</h3>
                    <p style={{ margin: '4px 0 0', color: colors.text_secondary, fontSize: '14px' }}>
                        Crie, edite e gerencie as aulas oferecidas pela clínica.
                    </p>
                </div>
                <button 
                    onClick={() => { setAulaEmEdicao(null); setShowFormModal(true); }} 
                    style={{ 
                        ...styles.app.button, 
                        backgroundColor: colors.success, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 12px', 
                        fontSize: '14px' 
                    }}
                >
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Nova Aula
                </button>
            </div>

            {loading ? (
                <p style={styles.app.text}>Carregando aulas...</p>
            ) : aulas.length > 0 ? (
                isMobile ? <AulasGrid /> : <AulasTable />
            ) : (
                <div style={{ textAlign: 'center', color: colors.text_secondary, padding: '40px 20px' }}>
                    <p style={{ fontSize: '16px', marginBottom: '20px' }}>Nenhuma aula cadastrada ainda.</p>
                    <button 
                        onClick={() => { setAulaEmEdicao(null); setShowFormModal(true); }} 
                        style={{ ...styles.app.button, backgroundColor: colors.success }}
                    >
                        Criar Primeira Aula
                    </button>
                </div>
            )}

            {showFormModal && (
                <AulaModal
                    styles={styles}
                    onClose={handleCloseModals}
                    onSave={handleSave}
                    aula={aulaEmEdicao}
                />
            )}

            {showDetailsModal && aulaEmDetalhe && (
                <DetalhesAulaModal 
                    aula={aulaEmDetalhe} 
                    onClose={handleCloseModals} 
                    styles={styles} 
                />
            )}
        </div>
    );
};

export default Aula;