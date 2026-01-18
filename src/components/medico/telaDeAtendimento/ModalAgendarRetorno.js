import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Ícones SVG para evitar dependências externas
const FiCalendar = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
const FiClock = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const FiCheck = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
const FiX = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const FiAlertCircle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const ModalAgendarRetorno = ({ consulta, onCancel, styles, colors, mostrarToast, isMobile }) => {
    const [unidades, setUnidades] = useState([]);
    const [selectedUnidade, setSelectedUnidade] = useState('');
    const [agendaDisponivel, setAgendaDisponivel] = useState([]);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [loading, setLoading] = useState({ unidades: true, agenda: false });
    const [error, setError] = useState(null);

    // Efeito para buscar as unidades disponíveis
    useEffect(() => {
        const fetchUnidades = async () => {
            setLoading(prev => ({ ...prev, unidades: true }));
            try {
                const response = await api.get("/unidade/todas");
                setUnidades(response.data.content || response.data || []);
            } catch (err) {
                setError("Não foi possível carregar as unidades.");
                console.error("Erro ao buscar unidades:", err);
            } finally {
                setLoading(prev => ({ ...prev, unidades: false }));
            }
        };
        fetchUnidades();
    }, []);

    // Efeito para buscar a agenda QUANDO UMA UNIDADE É SELECIONADA
    useEffect(() => {
        const medicoId = consulta?.dataDetalhesMedico.dataDetalhesPessoa?.id;
        
        if (!selectedUnidade) {
            setAgendaDisponivel([]);
            setError(null); 
            return;
        }

        if (!medicoId) {
            setError("Dados do médico incompletos. Não é possível buscar horários.");
            console.error("Objeto 'consulta' recebido pelo modal não contém 'dataDetalhesMedico.id':", consulta);
            setAgendaDisponivel([]);
            return;
        }

        const fetchAgenda = async () => {
            setLoading(prev => ({ ...prev, agenda: true }));
            setError(null);
            setAgendaDisponivel([]);
            setDataSelecionada(null);
            setSelectedHorario(null);

            console.log(`Buscando agenda para médico ID: ${medicoId} na unidade ID: ${selectedUnidade}`);

            try {
                const params = new URLSearchParams({
                    idUnidade: selectedUnidade,
                    idMedico: medicoId,
                    periodoEmDias: 60
                }).toString();

                const response = await api.get(`/agenda/medico/datas-horarios-disponiveis?${params}`);
                const agenda = response.data || [];
                setAgendaDisponivel(agenda);
                if (agenda.length === 0) {
                    setError("Nenhum horário disponível para o médico nesta unidade.");
                }
            } catch (err) {
                setError("Não foi possível carregar os horários disponíveis.");
                console.error("Erro ao buscar agenda:", err);
            } finally {
                setLoading(prev => ({ ...prev, agenda: false }));
            }
        };

        fetchAgenda();
    }, [consulta, selectedUnidade]);

    const handleAgendar = async () => {
        if (!dataSelecionada || !selectedHorario) {
            mostrarToast("Por favor, selecione uma data e um horário.", "error");
            return;
        }
        try {
            const dataISO = dataSelecionada.toISOString().split('T')[0];
            const horarioCompleto = `${dataISO}T${selectedHorario}`;

            const payload = {
                pacienteId: consulta.dataDetalhesPaciente.dataDetalhesPessoa.id,
                medicoId: consulta.dataDetalhesMedico.id,
                unidadeId: selectedUnidade,
                horario: horarioCompleto
            };
            
            await api.post('medico/consulta/marcar/retorno', payload);
            mostrarToast("Retorno agendado com sucesso!");
            onCancel();
        } catch (err) {
            console.error("Erro ao agendar retorno:", err);
            mostrarToast(err.response?.data?.message || "Erro ao agendar retorno.", "error");
        }
    };

    const datasDisponiveis = agendaDisponivel.map(item => {
        const [year, month, day] = item.data.split('-');
        return new Date(year, month - 1, day);
    });

    const horariosDoDiaSelecionado = dataSelecionada
        ? (agendaDisponivel.find(item => item.data === dataSelecionada.toISOString().split('T')[0])?.horarios || [])
        : [];
        
    const nomePaciente = consulta?.dataDetalhesPaciente?.dataDetalhesPessoa?.nome || "Paciente";
    const nomeMedico = consulta?.dataDetalhesMedico?.dataDetalhesPessoa?.nome || "Médico";

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: colors.white, borderRadius: '10px',
                width: '90%', maxWidth: '600px', maxHeight: '90vh',
                overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px', borderBottom: `1px solid ${colors.border}`
                }}>
                    <h3 style={{
                        margin: 0, color: colors.textPrimary, fontSize: '18px',
                        fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <FiCalendar size={20} /> Agendar Retorno
                    </h3>
                    <button onClick={onCancel} style={{
                        background: 'none', border: 'none', color: colors.textSecondary,
                        fontSize: '20px', cursor: 'pointer'
                    }}>
                        <FiX size={24} />
                    </button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    <p style={{ color: colors.textSecondary, marginBottom: '20px', lineHeight: '1.5' }}>
                        Agende o retorno para <strong style={{color: colors.textPrimary}}>{nomePaciente}</strong> com o(a) Dr(a). <strong style={{color: colors.textPrimary}}>{nomeMedico}</strong>.
                    </p>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', color: colors.textPrimary, fontWeight: '500' }}>
                            1. Selecione a Unidade
                        </label>
                        <select
                            value={selectedUnidade}
                            onChange={e => setSelectedUnidade(e.target.value)}
                            disabled={loading.unidades}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`}}
                        >
                            <option value="">Selecione uma unidade...</option>
                            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                        </select>
                    </div>

                    {loading.agenda && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', color: colors.textSecondary, gap: '10px' }}>
                            <FiClock size={18} /> Carregando horários...
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '12px', backgroundColor: `${colors.danger}15`, color: colors.danger, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiAlertCircle size={18} /> {error}
                        </div>
                    )}
                    
                    {selectedUnidade && !loading.agenda && !error && (
                         <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: colors.textPrimary, fontWeight: '500' }}>
                                    2. Escolha a Data
                                </label>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <DatePicker
                                        selected={dataSelecionada}
                                        onChange={(date) => {
                                            setDataSelecionada(date);
                                            setSelectedHorario(null);
                                        }}
                                        minDate={new Date()}
                                        includeDates={datasDisponiveis}
                                        placeholderText="Selecione uma data"
                                        dateFormat="dd/MM/yyyy"
                                        inline
                                        calendarClassName="react-datepicker-custom"
                                    />
                                </div>
                            </div>
                            {dataSelecionada && (
                                <div style={{ marginBottom: '20px' }}>
                                     <label style={{ display: 'block', marginBottom: '10px', color: colors.textPrimary, fontWeight: '500' }}>
                                        3. Escolha o Horário
                                    </label>
                                    {horariosDoDiaSelecionado.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                            {horariosDoDiaSelecionado.map(horario => (
                                                <button 
                                                    key={horario} 
                                                    onClick={() => setSelectedHorario(horario)}
                                                    style={{
                                                        padding: '10px', borderRadius: '6px',
                                                        border: `1px solid ${selectedHorario === horario ? colors.primary : colors.border}`,
                                                        backgroundColor: selectedHorario === horario ? colors.primary : 'transparent',
                                                        color: selectedHorario === horario ? colors.white : colors.textPrimary,
                                                        cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px'
                                                    }}
                                                >
                                                    {horario}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '15px', backgroundColor: `${colors.border}15`, borderRadius: '6px', textAlign: 'center', color: colors.textSecondary }}>
                                            Nenhum horário disponível para esta data
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'flex-end',
                    padding: '15px 20px', borderTop: `1px solid ${colors.border}`, gap: '10px'
                }}>
                    <button onClick={onCancel} style={{
                        padding: '10px 20px', borderRadius: '6px',
                        border: `1px solid ${colors.border}`, background: 'transparent',
                        color: colors.textSecondary, cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleAgendar}
                        disabled={!selectedHorario || !dataSelecionada}
                        style={{
                            padding: '10px 20px', borderRadius: '6px', border: 'none',
                            background: !selectedHorario || !dataSelecionada ? `${colors.success}80` : colors.success,
                            color: 'white', cursor: !selectedHorario || !dataSelecionada ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <FiCheck size={16} /> Confirmar Agendamento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAgendarRetorno;