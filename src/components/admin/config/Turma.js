import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';
import api from '../../../api/api';

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

const Modal = ({ title, children, onCancel, styles, maxWidth = '700px' }) => (
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

const SelectField = ({ label, options, styles, isProfessor = false, ...props }) => (
    <div style={styles.app.formGroup}>
        {label && <label style={styles.app.label}>{label}</label>}
        <select style={{ ...styles.app.select, width: '100%', boxSizing: 'border-box' }} {...props}>
            <option value="">Selecione...</option>
            {options.map(opt => {
                // Se for professor, usa o nome diretamente do DTO simplificado
                if (isProfessor) {
                    const nome = opt.nome || 'Professor sem nome';
                    return <option key={opt.id} value={opt.id}>{nome}</option>;
                }
                // Para aulas
                return <option key={opt.id} value={opt.id}>{opt.nome}</option>;
            })}
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

// =================================================================
// MODAL DE HORÁRIOS
// =================================================================
const HorarioModal = ({ horarios, onHorariosChange, styles, unidades }) => {
    const { colors } = styles;
    const [localHorarios, setLocalHorarios] = useState(horarios || []);

    const diasDaSemana = [
        { value: 'MONDAY', label: 'Segunda-feira' },
        { value: 'TUESDAY', label: 'Terça-feira' },
        { value: 'WEDNESDAY', label: 'Quarta-feira' },
        { value: 'THURSDAY', label: 'Quinta-feira' },
        { value: 'FRIDAY', label: 'Sexta-feira' },
        { value: 'SATURDAY', label: 'Sábado' },
        { value: 'SUNDAY', label: 'Domingo' }
    ];

    const tiposConsulta = [
        { value: 'PRESENCIAL', label: 'Presencial' },
        { value: 'ONLINE', label: 'Online' },
        { value: 'AMBAS', label: 'Presencial e Online' }
    ];

    const adicionarHorario = () => {
        const novoHorario = {
            tipoConsulta: 'PRESENCIAL',
            diaDaSemana: 'MONDAY',
            horaInicio: '08:00',
            horaFim: '09:00',
            idUnidade: unidades[0]?.id || ''
        };
        setLocalHorarios(prev => [...prev, novoHorario]);
    };

    const removerHorario = (index) => {
        setLocalHorarios(prev => prev.filter((_, i) => i !== index));
    };

    const atualizarHorario = (index, campo, valor) => {
        setLocalHorarios(prev => prev.map((horario, i) => 
            i === index ? { ...horario, [campo]: valor } : horario
        ));
    };

    const salvarHorarios = () => {
        onHorariosChange(localHorarios);
    };

    return (
        <Modal title="Gerenciar Horários da Turma" onCancel={() => onHorariosChange(horarios)} styles={styles} maxWidth="800px">
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, color: colors.text_primary }}>Horários de Aula</h4>
                    <button 
                        type="button" 
                        onClick={adicionarHorario}
                        style={{ ...styles.app.button, backgroundColor: colors.success, padding: '8px 12px' }}
                    >
                        + Adicionar Horário
                    </button>
                </div>

                {localHorarios.map((horario, index) => (
                    <div key={index} style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '15px',
                        backgroundColor: colors.background_secondary
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h5 style={{ margin: 0, color: colors.text_primary }}>Horário {index + 1}</h5>
                            <button 
                                type="button"
                                onClick={() => removerHorario(index)}
                                style={{ ...styles.app.button, backgroundColor: colors.danger, padding: '5px 10px', fontSize: '12px' }}
                            >
                                Remover
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <div>
                                <label style={styles.app.label}>Tipo de Consulta</label>
                                <select
                                    value={horario.tipoConsulta}
                                    onChange={(e) => atualizarHorario(index, 'tipoConsulta', e.target.value)}
                                    style={{ ...styles.app.select, width: '100%' }}
                                >
                                    {tiposConsulta.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={styles.app.label}>Dia da Semana</label>
                                <select
                                    value={horario.diaDaSemana}
                                    onChange={(e) => atualizarHorario(index, 'diaDaSemana', e.target.value)}
                                    style={{ ...styles.app.select, width: '100%' }}
                                >
                                    {diasDaSemana.map(dia => (
                                        <option key={dia.value} value={dia.value}>{dia.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={styles.app.label}>Hora Início</label>
                                <input
                                    type="time"
                                    value={horario.horaInicio}
                                    onChange={(e) => atualizarHorario(index, 'horaInicio', e.target.value)}
                                    style={{ ...styles.app.input, width: '100%' }}
                                />
                            </div>

                            <div>
                                <label style={styles.app.label}>Hora Fim</label>
                                <input
                                    type="time"
                                    value={horario.horaFim}
                                    onChange={(e) => atualizarHorario(index, 'horaFim', e.target.value)}
                                    style={{ ...styles.app.input, width: '100%' }}
                                />
                            </div>

                            <div>
                                <label style={styles.app.label}>Unidade</label>
                                <select
                                    value={horario.idUnidade}
                                    onChange={(e) => atualizarHorario(index, 'idUnidade', e.target.value)}
                                    style={{ ...styles.app.select, width: '100%' }}
                                >
                                    <option value="">Selecione a unidade</option>
                                    {unidades.map(unidade => (
                                        <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                {localHorarios.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: colors.text_secondary }}>
                        <p>Nenhum horário cadastrado. Clique em "Adicionar Horário" para começar.</p>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                    <button 
                        type="button" 
                        onClick={() => onHorariosChange(horarios)}
                        style={{ ...styles.app.button, backgroundColor: colors.secondary }}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={salvarHorarios}
                        style={{ ...styles.app.button, backgroundColor: colors.success }}
                    >
                        Salvar Horários
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// =================================================================
// MODAL DE DETALHES DA TURMA
// =================================================================
const DetalhesTurmaModal = ({ turma, onClose, styles }) => {
    const { colors } = styles;

    const DetailItem = ({ label, value }) => (
        <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: colors.text_primary, display: 'block', fontSize: '14px', marginBottom: '5px' }}>{label}</strong>
            <span style={{ color: colors.text_secondary, fontSize: '15px' }}>{value || 'N/A'}</span>
        </div>
    );

    const formatarHorarios = (horarios) => {
        if (!horarios || horarios.length === 0) return 'Nenhum horário cadastrado';
        
        const dias = {
            'MONDAY': 'Segunda',
            'TUESDAY': 'Terça',
            'WEDNESDAY': 'Quarta',
            'THURSDAY': 'Quinta',
            'FRIDAY': 'Sexta',
            'SATURDAY': 'Sábado',
            'SUNDAY': 'Domingo'
        };

        return horarios.map(horario => {
            const diaSemana = horario.diaDaSemana || horario.dia;
            const horaInicio = horario.horaInicio || horario.inicio;
            const horaFim = horario.horaFim || horario.fim;
            
            return (
                <div key={`${diaSemana}-${horaInicio}`} style={{ 
                    marginBottom: '8px', 
                    padding: '8px', 
                    backgroundColor: colors.background_secondary,
                    borderRadius: '4px'
                }}>
                    <strong>{dias[diaSemana] || diaSemana}</strong>: {horaInicio} - {horaFim} 
                    <br />
                    <small>Tipo: {horario.tipoConsulta || 'Presencial'} | Unidade: {horario.unidade?.nome || 'N/A'}</small>
                </div>
            );
        });
    };

    return (
        <Modal title={`Detalhes da Turma: ${turma.nome}`} onCancel={onClose} styles={styles} maxWidth="600px">
            <div style={{ lineHeight: '1.6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                        <DetailItem label="Nome da Turma" value={turma.nome} />
                        <DetailItem label="Aula" value={turma.nomeAula} />
                        <DetailItem label="Professor" value={turma.nomeProfessor} />
                    </div>
                    <div>
                        <DetailItem label="Máximo de Alunos" value={turma.maxAlunos} />
                        <DetailItem label="Valor Mensal" value={
                            turma.valorMensal ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.valorMensal) : 'N/A'
                        } />
                        <DetailItem label="Status" value={
                            <Pill 
                                text={turma.status || 'ATIVA'} 
                                color={colors.white} 
                                backgroundColor={colors.success} 
                            />
                        } />
                    </div>
                </div>

                <DetailItem label="Horários de Aula" value={formatarHorarios(turma.horarios || turma.horariosAula)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${colors.border}` }}>
                <button onClick={onClose} style={{ ...styles.app.button, backgroundColor: colors.secondary }}>Fechar</button>
            </div>
        </Modal>
    );
};

// =================================================================
// MODAL DE CRIAÇÃO/EDIÇÃO DA TURMA
// =================================================================
const TurmaModal = ({ onClose, onSave, turma, aulas, professores, unidades, styles }) => {
    const { colors } = styles;
    
    // Para debug - veja a estrutura da turma recebida
    console.log('Turma recebida para edição:', turma);
    console.log('Nome do professor na turma:', turma?.nomeProfessor);
    
    const [formData, setFormData] = useState({
        idAula: turma?.idAula || '', // Note: seu novo DTO não tem dataAula, apenas nomeAula
        idProfessor: turma?.idProfessor || '', // Note: seu novo DTO não tem idProfessor, apenas nomeProfessor
        nome: turma?.nome || '',
        maxAlunos: turma?.maxAlunos || 20,
        valorMensal: turma?.valorMensal || '',
        status: turma?.status || 'ATIVA',
        horariosDeTrabalho: turma?.horarios || []
    });

    const [showHorariosModal, setShowHorariosModal] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleHorariosChange = (novosHorarios) => {
        setFormData(prev => ({ ...prev, horariosDeTrabalho: novosHorarios }));
        setShowHorariosModal(false);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.idAula) newErrors.idAula = 'Aula é obrigatória';
        if (!formData.idProfessor) newErrors.idProfessor = 'Professor é obrigatório';
        if (!formData.nome.trim()) newErrors.nome = 'Nome da turma é obrigatório';
        if (!formData.maxAlunos || formData.maxAlunos < 1) newErrors.maxAlunos = 'Número máximo de alunos deve ser maior que 0';
        if (!formData.valorMensal || formData.valorMensal < 0) newErrors.valorMensal = 'Valor mensal deve ser maior ou igual a 0';
        if (!formData.horariosDeTrabalho || formData.horariosDeTrabalho.length === 0) newErrors.horarios = 'Pelo menos um horário deve ser cadastrado';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Dados a serem enviados:', formData);
            onSave(formData);
        }
    };

    return (
        <>
            <Modal title={turma ? 'Editar Turma' : 'Adicionar Nova Turma'} onCancel={onClose} styles={styles} maxWidth="800px">
                <form onSubmit={handleSubmit} style={styles.app.form}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        <SelectField 
                            styles={styles} 
                            label="Aula *" 
                            name="idAula" 
                            value={formData.idAula} 
                            onChange={handleChange} 
                            options={aulas}
                        />
                        {errors.idAula && <span style={{ color: colors.danger, fontSize: '12px' }}>{errors.idAula}</span>}

                        <SelectField 
                            styles={styles} 
                            label="Professor *" 
                            name="idProfessor"
                            value={formData.idProfessor} 
                            onChange={handleChange} 
                            options={professores}
                            isProfessor={true}
                        />
                        {errors.idProfessor && <span style={{ color: colors.danger, fontSize: '12px' }}>{errors.idProfessor}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                        <InputField 
                            styles={styles} 
                            label="Nome da Turma *" 
                            name="nome" 
                            value={formData.nome} 
                            onChange={handleChange} 
                            placeholder="Ex: Turma A de Yoga"
                        />
                        {errors.nome && <span style={{ color: colors.danger, fontSize: '12px' }}>{errors.nome}</span>}

                        <InputField 
                            styles={styles} 
                            label="Máximo de Alunos *" 
                            name="maxAlunos" 
                            type="number" 
                            min="1"
                            value={formData.maxAlunos} 
                            onChange={handleChange} 
                        />
                        {errors.maxAlunos && <span style={{ color: colors.danger, fontSize: '12px' }}>{errors.maxAlunos}</span>}

                        <InputField 
                            styles={styles} 
                            label="Valor Mensal (R$) *" 
                            name="valorMensal" 
                            type="number" 
                            step="0.01"
                            min="0"
                            value={formData.valorMensal} 
                            onChange={handleChange} 
                        />
                        {errors.valorMensal && <span style={{ color: colors.danger, fontSize: '12px' }}>{errors.valorMensal}</span>}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={styles.app.label}>Horários de Aula *</label>
                            <button 
                                type="button"
                                onClick={() => setShowHorariosModal(true)}
                                style={{ ...styles.app.button, backgroundColor: colors.info, padding: '8px 12px' }}
                            >
                                {formData.horariosDeTrabalho.length > 0 ? 'Editar Horários' : 'Adicionar Horários'}
                            </button>
                        </div>
                        {formData.horariosDeTrabalho.length > 0 ? (
                            <div style={{ 
                                border: `1px solid ${colors.border}`, 
                                borderRadius: '8px', 
                                padding: '15px',
                                backgroundColor: colors.background_secondary
                            }}>
                                <p style={{ margin: '0 0 10px 0', color: colors.text_secondary }}>
                                    {formData.horariosDeTrabalho.length} horário(s) cadastrado(s)
                                </p>
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {formData.horariosDeTrabalho.map((horario, index) => (
                                        <li key={index} style={{ color: colors.text_secondary, fontSize: '14px' }}>
                                            {horario.diaDaSemana} - {horario.horaInicio} às {horario.horaFim} ({horario.tipoConsulta})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p style={{ color: colors.danger, fontSize: '14px' }}>Nenhum horário cadastrado</p>
                        )}
                        {errors.horarios && <span style={{ color: colors.danger, fontSize: '12px' }}>{errors.horarios}</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{ ...styles.app.button, backgroundColor: colors.secondary }}>Cancelar</button>
                        <button type="submit" style={{ ...styles.app.button, backgroundColor: colors.success }}>
                            {turma ? 'Atualizar Turma' : 'Criar Turma'}
                        </button>
                    </div>
                </form>
            </Modal>

            {showHorariosModal && (
                <HorarioModal
                    horarios={formData.horariosDeTrabalho}
                    onHorariosChange={handleHorariosChange}
                    styles={styles}
                    unidades={unidades}
                />
            )}
        </>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL DE TURMAS
// =================================================================
const Turma = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;
    const isMobile = useMediaQuery('(max-width: 820px)');

    const [turmas, setTurmas] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [turmaEmEdicao, setTurmaEmEdicao] = useState(null);
    const [turmaEmDetalhe, setTurmaEmDetalhe] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const mostrarToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => { setToast({ show: false, message: '' }); }, 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [turmasRes, aulasRes, professoresRes, unidadesRes] = await Promise.all([
                api.get('/admin/turma/all'),
                api.get('/admin/aula/all'),
                api.get('/admin/turma/professor/all'),
                api.get('/unidade/todas')
            ]);
            
            console.log('Turmas (novo DTO):', turmasRes.data);
            console.log('Professores:', professoresRes.data);
            console.log('Aulas:', aulasRes.data);
            
            setTurmas(turmasRes.data || []);
            setAulas(aulasRes.data || []);
            setProfessores(professoresRes.data || []);
            setUnidades(unidadesRes.data || []);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            mostrarToast("Erro ao carregar dados.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleSave = async (formData) => {
        const isEditing = !!turmaEmEdicao;
        const endpoint = isEditing ? `/admin/turma/atualizar/${turmaEmEdicao.id}` : '/admin/turma/criar';
        const method = isEditing ? 'post' : 'post';
        
        try {
            console.log('Enviando dados para API:', formData);
            const response = await api[method](endpoint, formData);
            console.log('Resposta da API:', response.data);
            mostrarToast(`Turma ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
            handleCloseModals();
            fetchData();
        } catch (error) {
            console.error('Erro ao salvar turma:', error);
            console.error('Detalhes do erro:', error.response?.data);
            mostrarToast(error.response?.data?.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} turma.`, "error");
        }
    };

    const handleDeletarTurma = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir permanentemente esta turma? Esta ação não pode ser desfeita.')) return;
        
        try {
            await api.get(`/admin/turma/deletar/${id}`);
            mostrarToast('Turma excluída com sucesso!');
            fetchData();
        } catch (error) {
            console.error('Erro ao excluir turma:', error);
            mostrarToast('Erro ao excluir turma.', "error");
        }
    };

    const handleOpenEditModal = (turma) => { 
        console.log('Abrindo edição da turma:', turma);
        // IMPORTANTE: Seu novo DTO não tem os IDs, apenas nomes
        // Você precisa buscar os IDs correspondentes ou ajustar o backend
        setTurmaEmEdicao(turma); 
        setShowFormModal(true); 
    };

    const handleOpenDetailsModal = (turma) => { 
        setTurmaEmDetalhe(turma); 
        setShowDetailsModal(true); 
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDetailsModal(false);
        setTurmaEmEdicao(null);
        setTurmaEmDetalhe(null);
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

    const TurmasTable = () => (
        <div style={{ overflowX: 'auto', border: `1px solid ${colors.border}`, borderRadius: '8px', backgroundColor: colors.white }}>
            <table style={tableStyles.table}>
                <thead>
                    <tr>
                        <th style={tableStyles.th}>Nome da Turma</th>
                        <th style={tableStyles.th}>Aula</th>
                        <th style={tableStyles.th}>Professor</th>
                        <th style={{...tableStyles.th, textAlign: 'center'}}>Max. Alunos</th>
                        <th style={{...tableStyles.th, textAlign: 'center'}}>Valor Mensal</th>
                        <th style={{...tableStyles.th, textAlign: 'center'}}>Status</th>
                        <th style={{...tableStyles.th, textAlign: 'right'}}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {turmas.map(turma => (
                        <tr key={turma.id}>
                            <td style={{...tableStyles.td, fontWeight: '500', color: colors.text_primary}}>{turma.nome}</td>
                            <td style={tableStyles.td}>{turma.nomeAula}</td>
                            <td style={tableStyles.td}>{turma.nomeProfessor}</td>
                            <td style={{...tableStyles.td, textAlign: 'center'}}>{turma.maxAlunos}</td>
                            <td style={{...tableStyles.td, textAlign: 'center'}}>
                                {turma.valorMensal ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.valorMensal) : 'N/A'}
                            </td>
                            <td style={{...tableStyles.td, textAlign: 'center'}}>
                                <Pill 
                                    text={turma.status || 'ATIVA'} 
                                    color={colors.white} 
                                    backgroundColor={colors.success} 
                                />
                            </td>
                            <td style={{...tableStyles.td, textAlign: 'right'}}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <button 
                                        onClick={() => handleOpenDetailsModal(turma)} 
                                        style={{ ...styles.app.button, backgroundColor: colors.info, padding: '6px 12px', margin: 0, fontSize: '12px' }}
                                    >
                                        👁️ Ver
                                    </button>
                                    <button 
                                        onClick={() => handleOpenEditModal(turma)} 
                                        style={{ ...styles.app.button, backgroundColor: colors.warning || '#f39c12', padding: '6px 12px', margin: 0, fontSize: '12px' }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeletarTurma(turma.id)} 
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

    const TurmasGrid = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {turmas.map(turma => (
                <div key={turma.id} style={{ ...styles.app.card, padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: colors.primary, flex: 1 }}>{turma.nome}</h4>
                        <Pill 
                            text={turma.status || 'ATIVA'} 
                            color={colors.white} 
                            backgroundColor={colors.success} 
                        />
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Aula:</strong> {turma.nomeAula}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Professor:</strong> {turma.nomeProfessor}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Max. Alunos:</strong> {turma.maxAlunos}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Valor Mensal:</strong> {turma.valorMensal ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.valorMensal) : 'N/A'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', borderTop: `1px solid ${colors.border}`, paddingTop: '15px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => handleOpenDetailsModal(turma)} 
                            style={{ ...styles.app.button, backgroundColor: colors.info, flex: '1 1 80px', margin: 0, fontSize: '12px' }}
                        >
                            👁️ Ver
                        </button>
                        <button 
                            onClick={() => handleOpenEditModal(turma)} 
                            style={{ ...styles.app.button, backgroundColor: colors.warning || '#f39c12', flex: '1 1 80px', margin: 0, fontSize: '12px' }}
                        >
                            ✏️ Editar
                        </button>
                        <button 
                            onClick={() => handleDeletarTurma(turma.id)} 
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
                    <h3 style={{ ...styles.app.subtitle, margin: 0, color: colors.text_primary }}>Gerenciar Turmas</h3>
                    <p style={{ margin: '4px 0 0', color: colors.text_secondary, fontSize: '14px' }}>
                        Crie, edite e gerencie as turmas de aula da clínica.
                    </p>
                </div>
                <button 
                    onClick={() => { setTurmaEmEdicao(null); setShowFormModal(true); }} 
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
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Nova Turma
                </button>
            </div>

            {loading ? (
                <p style={styles.app.text}>Carregando turmas...</p>
            ) : turmas.length > 0 ? (
                isMobile ? <TurmasGrid /> : <TurmasTable />
            ) : (
                <div style={{ textAlign: 'center', color: colors.text_secondary, padding: '40px 20px' }}>
                    <p style={{ fontSize: '16px', marginBottom: '20px' }}>Nenhuma turma cadastrada ainda.</p>
                    <button 
                        onClick={() => { setTurmaEmEdicao(null); setShowFormModal(true); }} 
                        style={{ ...styles.app.button, backgroundColor: colors.success }}
                    >
                        Criar Primeira Turma
                    </button>
                </div>
            )}

            {showFormModal && (
                <TurmaModal
                    styles={styles}
                    onClose={handleCloseModals}
                    onSave={handleSave}
                    turma={turmaEmEdicao}
                    aulas={aulas}
                    professores={professores}
                    unidades={unidades}
                />
            )}

            {showDetailsModal && turmaEmDetalhe && (
                <DetalhesTurmaModal 
                    turma={turmaEmDetalhe} 
                    onClose={handleCloseModals} 
                    styles={styles} 
                />
            )}
        </div>
    );
};

export default Turma;