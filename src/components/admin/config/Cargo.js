import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';
import { FiEdit, FiTrash2, FiAlertTriangle, FiCheckCircle, FiPlus } from 'react-icons/fi';

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
// COMPONENTES DE UI (Podem ser movidos para um arquivo central no futuro)
// =================================================================
const Toast = ({ message, type, onClose, colors }) => {
    const isSuccess = type === 'success';
    const backgroundColor = isSuccess ? colors.success : colors.danger;
    const icon = isSuccess ? <FiCheckCircle size={20} /> : <FiAlertTriangle size={20} />;

    return (
        <div style={{
            position: 'fixed', top: '20px', right: '20px', padding: '12px 20px',
            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1002,
            backgroundColor, color: 'white', display: 'flex', alignItems: 'center', gap: '10px',
            transition: 'all 0.3s ease', maxWidth: 'calc(100% - 40px)', fontSize: '14px',
            borderLeft: `5px solid rgba(0,0,0,0.2)`
        }}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', marginLeft: 'auto' }}>&times;</button>
        </div>
    );
};

const ModalConfirmacao = ({ onConfirm, onCancel, styles, colors }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1001
    }}>
        <div style={{ ...styles.app.card, padding: '30px', width: '90%', maxWidth: '450px', textAlign: 'center', borderTop: `4px solid ${colors.danger}` }}>
            <FiTrash2 size={32} color={colors.danger} style={{ marginBottom: '15px' }} />
            <h3 style={{ ...styles.app.subtitle, margin: 0, marginBottom: '10px', color: styles.colors.text_primary }}>Confirmar Exclusão</h3>
            <p style={{ ...styles.app.text, margin: 0, marginBottom: '25px', color: styles.colors.text_secondary, lineHeight: 1.6 }}>Tem certeza que deseja apagar este item? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button onClick={onCancel} style={{ ...styles.app.button, backgroundColor: colors.secondary, color: colors.text_primary, flex: 1 }}>Cancelar</button>
                <button onClick={onConfirm} style={{ ...styles.app.button, backgroundColor: colors.danger, flex: 1 }}>Apagar</button>
            </div>
        </div>
    </div>
);

const FormModal = ({ title, children, onClose, styles }) => (
     <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    }}>
        <div style={{ ...styles.app.card, width: '90%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: `1px solid ${styles.colors.border}` }}>
                <h3 style={{ ...styles.app.subtitle, margin: 0 }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: styles.colors.text_secondary }}>&times;</button>
            </header>
            <div style={{ overflowY: 'auto', padding: '20px 5px' }}>
                {children}
            </div>
        </div>
    </div>
);


// =================================================================
// COMPONENTE PRINCIPAL: Cargo
// =================================================================
const Cargo = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemEmEdicao, setItemEmEdicao] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, onConfirm: () => {} });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const apiBaseUrl = '/admin/cargo';
    const entityName = 'Cargo';

    const mostrarToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`${apiBaseUrl}/all`);
            setCargos(response.data || []);
        } catch (error) {
            mostrarToast("Erro ao carregar cargos.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setItemEmEdicao({ id: item.id, nome: item.nome });
        } else {
            setItemEmEdicao({ id: null, nome: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemEmEdicao(null);
    };

    const handleSave = async (formData) => {
        const isEditing = !!formData.id;
        const data = { nome: formData.nome };
        const endpoint = isEditing ? `${apiBaseUrl}/atualizar/${formData.id}` : `${apiBaseUrl}/criar`;
        const method = isEditing ? 'put' : 'post';

        try {
            await api[method](endpoint, data);
            mostrarToast(`${entityName} ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            fetchData();
            handleCloseModal();
        } catch (error) {
            mostrarToast(error.response?.data?.message || `Erro ao salvar ${entityName.toLowerCase()}.`, 'error');
        }
    };
    
    const handleDelete = (item) => {
        setConfirmModal({
            show: true,
            onConfirm: async () => {
                try {
                    // Crie este endpoint no seu backend se precisar da função de apagar
                    // await api.delete(`${apiBaseUrl}/deletar/${item.id}`);
                    mostrarToast(`${entityName} apagado com sucesso. (SIMULAÇÃO)`); // Remova "(SIMULAÇÃO)" quando o endpoint existir
                    // fetchData(); // Descomente quando o endpoint existir
                } catch (error) {
                    mostrarToast(error.response?.data?.message || `Erro ao apagar ${entityName.toLowerCase()}.`, 'error');
                }
                setConfirmModal({ show: false });
            }
        });
    };

    const renderContent = () => {
        if (loading) return <p style={{ textAlign: 'center', color: colors.text_secondary }}>Carregando cargos...</p>;
        if (cargos.length === 0) return <p style={{ textAlign: 'center', color: colors.text_secondary, padding: '20px' }}>Nenhum cargo cadastrado.</p>;

        const customStyles = {
            table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
            th: { backgroundColor: colors.background_secondary, padding: '12px 15px', fontWeight: '600', color: colors.text_primary, borderBottom: `2px solid ${colors.border}` },
            td: { padding: '12px 15px', borderBottom: `1px solid ${colors.border}`, color: colors.text_secondary },
        };

        const TabelaDesktop = () => (
            <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: '8px', backgroundColor: colors.white }}>
                <table style={customStyles.table}>
                    <thead>
                        <tr>
                            <th style={customStyles.th}>ID</th>
                            <th style={customStyles.th}>Nome</th>
                            <th style={{...customStyles.th, textAlign: 'right'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargos.map(item => (
                            <tr key={item.id}>
                                <td style={customStyles.td}>{item.id}</td>
                                <td style={{...customStyles.td, color: colors.text_primary, fontWeight: '500'}}>{item.nome}</td>
                                <td style={{...customStyles.td, textAlign: 'right'}}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleOpenModal(item)} title="Editar" style={{ ...styles.app.button, backgroundColor: colors.warning, padding: '8px', margin: 0 }}><FiEdit size={16} /></button>
                                        <button onClick={() => handleDelete(item)} title="Excluir" style={{ ...styles.app.button, backgroundColor: colors.danger, padding: '8px', margin: 0 }}><FiTrash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        const GridMobile = () => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                {cargos.map(item => (
                    <div key={item.id} style={{ ...styles.app.card, padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h4 style={{ margin: 0, color: colors.primary, wordBreak: 'break-all' }}>{item.nome}</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleOpenModal(item)} style={{ ...styles.app.button, backgroundColor: colors.warning, padding: '8px', margin: 0 }}><FiEdit size={16}/></button>
                            <button onClick={() => handleDelete(item)} style={{ ...styles.app.button, backgroundColor: colors.danger, padding: '8px', margin: 0 }}><FiTrash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        );

        return isMobile ? <GridMobile /> : <TabelaDesktop />;
    };

    return (
        <div style={{ ...styles.app.card, backgroundColor: colors.background_secondary, padding: isMobile ? '15px' : '30px' }}>
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '' })} colors={colors} />}
            {confirmModal.show && <ModalConfirmacao onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal({ show: false })} styles={styles} colors={colors} />}
            
            {isModalOpen && (
                <CargoModal 
                    itemParaEditar={itemEmEdicao}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                    styles={styles}
                />
            )}

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', marginBottom: '20px', borderBottom: `1px solid ${colors.border}` }}>
                <div>
                    <h2 style={{ ...styles.app.title, margin: 0, border: 'none', padding: 0 }}>Gerenciar Cargos</h2>
                    <p style={{ margin: '4px 0 0', color: colors.text_secondary, fontSize: '15px' }}>Adicione, edite e gerencie os cargos da clínica.</p>
                </div>
                 <button onClick={() => handleOpenModal()} style={{ ...styles.app.button, backgroundColor: colors.primary, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <FiPlus/> Novo Cargo
                </button>
            </header>

            {renderContent()}
        </div>
    );
};


// Componente do Modal com o Formulário
const CargoModal = ({ itemParaEditar, onSave, onClose, styles }) => {
    const [formData, setFormData] = useState({ id: null, nome: '' });

    useEffect(() => {
        if (itemParaEditar) {
            setFormData(itemParaEditar);
        }
    }, [itemParaEditar]);

    const handleChange = (e) => {
        setFormData({ ...formData, nome: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <FormModal title={formData.id ? 'Editar Cargo' : 'Criar Novo Cargo'} onClose={onClose} styles={styles}>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={styles.app.label}>Nome do Cargo</label>
                    <input name="nome" value={formData.nome} onChange={handleChange} required style={{ ...styles.app.input, width: '100%', boxSizing: 'border-box' }}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', paddingTop: '15px', borderTop: `1px solid ${styles.colors.border}` }}>
                    <button type="button" onClick={onClose} style={{ ...styles.app.button, backgroundColor: styles.colors.secondary, margin: 0 }}>Cancelar</button>
                    <button type="submit" style={{ ...styles.app.button, backgroundColor: styles.colors.success, margin: 0 }}>Salvar</button>
                </div>
            </form>
        </FormModal>
    );
};

export default Cargo;