import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

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
// COMPONENTES DE UI REUTILIZÁVEIS E MELHORADOS
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

const Modal = ({ title, children, onCancel, styles, maxWidth = '650px' }) => (
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

const SelectField = ({ label, options, styles, ...props }) => (
    <div style={styles.app.formGroup}>
        {label && <label style={styles.app.label}>{label}</label>}
        <select style={{ ...styles.app.select, width: '100%', boxSizing: 'border-box' }} {...props}>
            <option value="">Selecione...</option>
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
        </select>
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

const IconButton = ({ onClick, children, styles }) => (
    <button onClick={onClick} style={{
        ...styles.app.button,
        padding: '6px', width: '32px', height: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: styles.colors.danger,
        lineHeight: 1,
    }}>
        {children}
    </button>
);

// =================================================================
// MODAL DE DETALHES DO PLANO (Estilo Melhorado)
// =================================================================
const DetalhesPlanoModal = ({ plano, onClose, styles }) => {
    const { colors } = styles;
    const DetailItem = ({ label, value }) => (
        <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: colors.text_primary, display: 'block', fontSize: '14px' }}>{label}</strong>
            <span style={{ color: colors.text_secondary, fontSize: '15px' }}>{value}</span>
        </div>
    );

    const renderList = (title, items, renderItem) => {
        if (!items || items.length === 0) return null;
        return (
            <div style={{ marginTop: '20px' }}>
                <h4 style={{ ...styles.app.subtitle, fontSize: '16px' }}>{title}</h4>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '10px' }}>
                    {items.map((item, index) => (
                        <li key={index} style={{ background: colors.background_secondary || colors.lightGray, padding: '10px 12px', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', borderLeft: `3px solid ${colors.primary}` }}>
                            {renderItem(item)}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <Modal title={`Detalhes do Plano: ${plano.nome}`} onCancel={onClose} styles={styles} maxWidth="700px">
            <div style={{ lineHeight: '1.6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                        <DetailItem label="Descrição" value={plano.descricao || 'N/A'} />
                        <DetailItem label="Observações" value={plano.observacoes || 'N/A'} />
                    </div>
                    <div>
                        <DetailItem label="Valor da Mensalidade" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorMensalidade)} />
                        <DetailItem label="Categoria" value={plano.categoria?.nome} />
                        <DetailItem label="Abrangência" value={plano.abrangencia?.nome} />
                        <DetailItem label="Status" value={<Pill text={plano.ativo ? 'Ativo' : 'Inativo'} color={colors.white} backgroundColor={plano.ativo ? colors.success : colors.danger} />} />
                    </div>
                </div>

                {renderList("Exames Inclusos", plano.dataExames, (ex) => (
                    <span><strong>{ex.dataExame.nome}</strong> | Limite: {ex.limiteExames} | Desconto: {ex.desconto}%</span>
                ))}
                {renderList("Especialidades Inclusas", plano.dataEspecialidades, (esp) => (
                    <span><strong>{esp.especialidade.nome}</strong> | Limite: {esp.limiteConsultas} | Desconto: {esp.descontoPercentual}%</span>
                ))}
                {renderList("Aulas Inclusas", plano.dataAulas, (aula) => (
                    <span><strong>{aula.aula.nome}</strong> | {aula.incluso ? <span style={{ color: colors.success }}>Inclusa</span> : 'Não Inclusa'}</span>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${colors.border}` }}>
                <button onClick={onClose} style={{ ...styles.app.button, backgroundColor: colors.secondary }}>Fechar</button>
            </div>
        </Modal>
    );
};

// =================================================================
// MODAL DE CRIAÇÃO/EDIÇÃO DO PLANO (UI Completamente Refeita)
// =================================================================
const PlanoModal = ({ onClose, onSave, plano, categorias, abrangencias, exames, especialidades, aulas, styles }) => {
    const { colors } = styles;
    const [formData, setFormData] = useState({
        nome: plano?.nome || '',
        descricao: plano?.descricao || '',
        valorMensalidade: plano?.valorMensalidade || '',
        observacoes: plano?.observacoes || '',
        idCategoria: plano?.categoria?.id || '',
        idAbrangencia: plano?.abrangencia?.id || '',
        ativo: plano?.ativo !== undefined ? plano.ativo : true,
        exames: plano?.dataExames?.map(e => ({ exameId: e.dataExame.id, limiteExames: e.limiteExames, desconto: e.desconto })) || [],
        especialidades: plano?.dataEspecialidades?.map(e => ({ idEspecialidade: e.especialidade.id, descontoPercentual: e.descontoPercentual, limiteConsultas: e.limiteConsultas })) || [],
        aulas: plano?.dataAulas?.map(a => ({ idAula: a.aula.id, incluso: a.incluso })) || []
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleItemChange = (type, index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev[type]];
            newItems[index][field] = value;
            return { ...prev, [type]: newItems };
        });
    };

    const handleAddItem = (type, id, defaultItem) => {
        if (!id) return;
        const keyField = Object.keys(defaultItem)[0];
        if (formData[type].find(item => item[keyField] === Number(id))) return;
        setFormData(prev => ({ ...prev, [type]: [...prev[type], { ...defaultItem, [keyField]: Number(id) }] }));
    };

    const handleRemoveItem = (type, index) => {
        setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderItemManager = (title, type, items, options, defaultItem, fields) => (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <h4 style={{ ...styles.app.subtitle, fontSize: '16px', marginTop: 0 }}>{title}</h4>
            <SelectField styles={styles} options={options} onChange={(e) => handleAddItem(type, e.target.value, defaultItem)} />
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '15px' }}>
                {formData[type].map((item, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: colors.background_secondary || colors.lightGray, padding: '10px', borderRadius: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ flex: '1 1 150px', fontWeight: '500' }}>{options.find(opt => opt.id === item[Object.keys(defaultItem)[0]])?.nome}</span>
                        {fields.map(field => (
                            <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <label style={{ fontSize: '12px' }}>{field.label}:</label>
                                <input
                                    type={field.type}
                                    value={item[field.name]}
                                    min={field.min} max={field.max} step={field.step}
                                    onChange={(e) => handleItemChange(type, index, field.name, Number(e.target.value))}
                                    style={{ ...styles.app.input, width: '70px', padding: '6px 8px', fontSize: '13px' }}
                                />
                            </div>
                        ))}
                        <IconButton styles={styles} onClick={() => handleRemoveItem(type, index)}>🗑️</IconButton>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <Modal title={plano ? 'Editar Plano' : 'Adicionar Novo Plano'} onCancel={onClose} styles={styles} maxWidth="800px">
            <form onSubmit={handleSubmit} style={styles.app.form}>
                <InputField styles={styles} label="Nome do Plano *" name="nome" value={formData.nome} onChange={handleChange} required />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <InputField styles={styles} label="Valor da Mensalidade *" name="valorMensalidade" type="number" step="0.01" value={formData.valorMensalidade} onChange={handleChange} required />
                    <SelectField styles={styles} label="Categoria *" name="idCategoria" value={formData.idCategoria} onChange={handleChange} options={categorias} required />
                    <SelectField styles={styles} label="Abrangência *" name="idAbrangencia" value={formData.idAbrangencia} onChange={handleChange} options={abrangencias} required />
                </div>
                <TextareaField styles={styles} label="Descrição" name="descricao" value={formData.descricao} onChange={handleChange} />
                <TextareaField styles={styles} label="Observações" name="observacoes" value={formData.observacoes} onChange={handleChange} />

                {renderItemManager("Exames", "exames", formData.exames, exames, { exameId: null, limiteExames: 1, desconto: 0 },
                    [{ label: 'Limite', name: 'limiteExames', type: 'number', min: 1 }, { label: 'Desconto (%)', name: 'desconto', type: 'number', min: 0, max: 100 }])}

                {renderItemManager("Especialidades", "especialidades", formData.especialidades, especialidades, { idEspecialidade: null, descontoPercentual: 0, limiteConsultas: 1 },
                    [{ label: 'Limite', name: 'limiteConsultas', type: 'number', min: 1 }, { label: 'Desconto (%)', name: 'descontoPercentual', type: 'number', min: 0, max: 100 }])}

                {renderItemManager("Aulas", "aulas", formData.aulas, aulas, { idAula: null, incluso: true }, [])}

                <div style={{ margin: '20px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', ...styles.app.text }}>
                        <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: colors.primary }} /> Plano Ativo
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', flexWrap: 'wrap', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                    <button type="button" onClick={onClose} style={{ ...styles.app.button, backgroundColor: colors.secondary }}>Cancelar</button>
                    <button type="submit" style={{ ...styles.app.button, backgroundColor: colors.success }}>Salvar Plano</button>
                </div>
            </form>
        </Modal>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL (Layout Responsivo e Tabela Melhorada)
// =================================================================
const GerenciarPlanos = () => {
    const { isDarkMode } = useTheme();
    // Adicionando novos estilos para a tabela diretamente aqui para não depender do globalStyles
    const customStyles = {
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
        },
        trHover: { // Este estilo precisaria de um manipulador de estado (onMouseEnter/onMouseLeave) para funcionar puramente com inline-style
            transition: 'background-color 0.2s ease',
            cursor: 'default',
        },
    };
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 820px)'); // Ajustado breakpoint para melhor responsividade da tabela

    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [planoEmEdicao, setPlanoEmEdicao] = useState(null);
    const [planoEmDetalhe, setPlanoEmDetalhe] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [abrangencias, setAbrangencias] = useState([]);
    const [exames, setExames] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const mostrarToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => { setToast({ show: false, message: '' }); }, 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [planosRes, catAbrRes, examesRes, espRes, aulasRes] = await Promise.all([
                api.get('/plano/all'),
                api.get('/plano/categorias-abrangencias'),
                api.get('/admin/exame/all'),
                api.get('/admin/medico/especialidade'),
                api.get('/admin/aula/all')
            ]);
            setPlanos(planosRes.data || []);
            setCategorias(catAbrRes.data.categorias || []);
            setAbrangencias(catAbrRes.data.abrangencias || []);
            setExames(examesRes.data || []);
            setEspecialidades(espRes.data || []);
            setAulas(aulasRes.data || []);
        } catch (err) {
            console.error(err);
            mostrarToast("Erro ao carregar dados.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (formData) => {
        const isEditing = !!planoEmEdicao;
        const endpoint = isEditing ? `/admin/plano/atualizar/${planoEmEdicao.id}` : '/admin/plano/cadastroPlano';
        const method = isEditing ? 'put' : 'post';
        try {
            await api[method](endpoint, formData);
            mostrarToast(`Plano ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            handleCloseModals();
            fetchData();
        } catch (error) {
            console.error(error);
            mostrarToast(error.response?.data?.message || "Erro ao salvar plano.", "error");
        }
    };

    const handleOpenEditModal = (plano) => { setPlanoEmEdicao(plano); setShowFormModal(true); };
    const handleOpenDetailsModal = (plano) => { setPlanoEmDetalhe(plano); setShowDetailsModal(true); };
    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDetailsModal(false);
        setPlanoEmEdicao(null);
        setPlanoEmDetalhe(null);
    }

    const PlanosTable = () => (
        <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: '8px', backgroundColor: colors.white }}>
            <table style={customStyles.table}>
                <thead>
                    <tr>
                        <th style={customStyles.th}>Nome</th>
                        <th style={customStyles.th}>Valor</th>
                        <th style={{...customStyles.th, textAlign: 'center'}}>Categoria</th>
                        <th style={{...customStyles.th, textAlign: 'center'}}>Abrangência</th>
                        <th style={{...customStyles.th, textAlign: 'center'}}>Status</th>
                        <th style={{...customStyles.th, textAlign: 'right'}}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {planos.map(p => (
                        <tr key={p.id}>
                            <td style={{...customStyles.td, fontWeight: '500', color: colors.text_primary}}>{p.nome}</td>
                            <td style={customStyles.td}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorMensalidade)}</td>
                            <td style={{...customStyles.td, textAlign: 'center'}}>{p.categoria?.nome}</td>
                            <td style={{...customStyles.td, textAlign: 'center'}}>{p.abrangencia?.nome}</td>
                            <td style={{...customStyles.td, textAlign: 'center'}}><Pill text={p.ativo ? 'Ativo' : 'Inativo'} color={colors.white} backgroundColor={p.ativo ? colors.success : colors.danger} /></td>
                            <td style={{...customStyles.td, textAlign: 'right'}}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleOpenDetailsModal(p)} style={{ ...styles.app.button, backgroundColor: colors.info, padding: '6px 12px', margin: 0 }}>👁️ Ver</button>
                                    <button onClick={() => handleOpenEditModal(p)} style={{ ...styles.app.button, backgroundColor: colors.warning || '#f39c12', padding: '6px 12px', margin: 0 }}>✏️ Editar</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const PlanosGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {planos.map(p => (
                <div key={p.id} style={{ ...styles.app.card, padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: colors.primary }}>{p.nome}</h4>
                        <Pill text={p.ativo ? 'Ativo' : 'Inativo'} color={colors.white} backgroundColor={p.ativo ? colors.success : colors.danger} />
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorMensalidade)}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Categoria:</strong> {p.categoria?.nome}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Abrangência:</strong> {p.abrangencia?.nome}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', borderTop: `1px solid ${colors.border}`, paddingTop: '15px' }}>
                        <button onClick={() => handleOpenDetailsModal(p)} style={{ ...styles.app.button, backgroundColor: colors.info, flex: 1, margin: 0 }}>👁️ Ver Detalhes</button>
                        <button onClick={() => handleOpenEditModal(p)} style={{ ...styles.app.button, backgroundColor: colors.warning || '#f39c12', flex: 1, margin: 0 }}>✏️ Editar</button>
                    </div>
                </div>
            ))}
        </div>
    );


    return (
        <div style={{ ...styles.app.card, backgroundColor: colors.background_secondary || colors.lightGray, padding: isMobile ? '15px' : '30px' }}>
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '' })} colors={colors} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ ...styles.app.title, margin: 0, border: 'none', padding: 0 }}>Gerenciar Planos da Clínica</h2>
                    <p style={{ margin: '4px 0 0', color: colors.text_secondary, fontSize: '15px' }}>Crie, edite e visualize os planos oferecidos pela clínica.</p>
                </div>
                <button onClick={() => { setPlanoEmEdicao(null); setShowFormModal(true); }} style={{ ...styles.app.button, backgroundColor: colors.success, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', fontSize: '15px' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Novo Plano
                </button>
            </div>

            {loading ? <p style={styles.app.text}>Carregando planos...</p> : (
                planos.length > 0 ? (isMobile ? <PlanosGrid /> : <PlanosTable />) : <p style={{textAlign: 'center', color: colors.text_secondary, padding: '20px'}}>Nenhum plano cadastrado ainda.</p>
            )}

            {showFormModal && (
                <PlanoModal
                    styles={styles} onClose={handleCloseModals} onSave={handleSave} plano={planoEmEdicao}
                    categorias={categorias} abrangencias={abrangencias} exames={exames} especialidades={especialidades} aulas={aulas}
                />
            )}

            {showDetailsModal && planoEmDetalhe && (
                <DetalhesPlanoModal plano={planoEmDetalhe} onClose={handleCloseModals} styles={styles} />
            )}
        </div>
    );
};

export default GerenciarPlanos;