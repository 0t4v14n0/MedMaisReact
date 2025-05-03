import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Estilos globais
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#2c3e50",
    color: "#ecf0f1",
    padding: "20px 0",
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
  },
  sidebarList: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  sidebarItem: {
    padding: "12px 20px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    borderLeft: "4px solid transparent"
  },
  sidebarItemHover: {
    backgroundColor: "#34495e",
    borderLeft: "4px solid #3498db"
  },
  sidebarIcon: {
    marginRight: "10px",
    fontSize: "18px"
  },
  content: {
    flex: 1,
    padding: "30px",
    backgroundColor: "#f5f7fa"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    padding: "25px",
    marginBottom: "30px"
  },
  title: {
    color: "#2c3e50",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "600",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px"
  },
  button: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    marginRight: "10px",
    marginBottom: "10px",
    '&:hover': {
      backgroundColor: "#2980b9"
    },
    '&:disabled': {
      backgroundColor: "#bdc3c7",
      cursor: "not-allowed"
    }
  },
  buttonDanger: {
    backgroundColor: "#e74c3c",
    '&:hover': {
      backgroundColor: "#c0392b"
    }
  },
  buttonSuccess: {
    backgroundColor: "#2ecc71",
    '&:hover': {
      backgroundColor: "#27ae60"
    }
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#34495e"
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
    transition: "all 0.3s ease",
    '&:focus': {
      borderColor: "#3498db",
      outline: "none",
      boxShadow: "0 0 0 2px rgba(52,152,219,0.2)"
    }
  },
  doctorCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    '&:hover': {
      borderColor: "#3498db",
      boxShadow: "0 2px 8px rgba(52,152,219,0.1)"
    }
  },
  doctorCardSelected: {
    borderColor: "#3498db",
    backgroundColor: "#e8f4fc"
  },
  timeSlot: {
    display: "inline-block",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "8px 15px",
    margin: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    '&:hover': {
      borderColor: "#3498db",
      backgroundColor: "#f0f7fd"
    }
  },
  timeSlotSelected: {
    borderColor: "#3498db",
    backgroundColor: "#3498db",
    color: "white"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
  },
  tableHeader: {
    backgroundColor: "#2c3e50",
    color: "white",
    textAlign: "left",
    padding: "12px"
  },
  tableRow: {
    borderBottom: "1px solid #eee",
    '&:nth-child(even)': {
      backgroundColor: "#f9f9f9"
    },
    '&:hover': {
      backgroundColor: "#f5f5f5"
    }
  },
  tableCell: {
    padding: "12px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    width: "80%",
    maxWidth: "600px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
    gap: "10px"
  },
  statusIndicator: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: "500",
    fontSize: "12px"
  },
  statusOpen: {
    backgroundColor: "#d4edff",
    color: "#004085"
  },
  statusCanceled: {
    backgroundColor: "#f8d7da",
    color: "#721c24"
  },
  statusCompleted: {
    backgroundColor: "#d4edda",
    color: "#155724"
  },
  statusNoShow: {
    backgroundColor: "#fff3cd",
    color: "#856404"
  }
};

const Consulta = ({ setOpcaoSelecionada }) => {
  const [opcaoConsulta, setOpcaoConsulta] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [selectedHorarioId, setSelectedHorarioId] = useState(null);
  
  
  const datasStrings = horariosDisponiveis.map(h => {
    return new Date(h.horario).toLocaleDateString('pt-BR');
  });
  const datasDisponiveis = [...new Set(datasStrings)];
  
  const datasDisponiveisObj = datasDisponiveis.map(dataStr => {
    const [dia, mes, ano] = dataStr.split('/');
    return new Date(ano, mes - 1, dia);
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/consulta/agendar", {
        crm: selectedMedico,
        id: selectedHorarioId,
      });
      alert("Consulta marcada com sucesso!");
      navigate("/home");
    } catch (err) {
      alert("Erro ao marcar consulta");
      console.error(err);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (opcaoConsulta === "Dashboard") {
      navigate("/paciente/dashboard");
    }
  }, [opcaoConsulta, navigate]);

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await api.get("/medico/especialidade");
        if (Array.isArray(response.data.body)) {
          setEspecialidades(response.data.body);
        } else {
          setEspecialidades([]);
        }
      } catch (error) {
        console.error("Erro ao buscar especialidades:", error);
      }
    };
    fetchEspecialidades();
  }, []);

  useEffect(() => {
    const fetchMedicosPorEspecialidade = async () => {
      if (!selectedEspecialidade) return;
      try {
        const response = await api.get(`/medico/all/${selectedEspecialidade}`);
        const content = response.data.body?.content || [];
        setMedicos(content);
      } catch (error) {
        console.error("Erro ao buscar médicos:", error);
        setMedicos([]);
      }
    };
    fetchMedicosPorEspecialidade();
  }, [selectedEspecialidade]);

  useEffect(() => {
    const fetchHorariosDiponivel = async () => {
      try {
        const response = await api.get(`/medico/${selectedMedico}/horarioDisponivel`);
        const horarios = response.data.body || [];
        setHorariosDisponiveis(horarios);
      } catch (error) {
        console.error("Erro ao buscar horários de médico:", error);
        setHorariosDisponiveis([]);
      }
    };
    if (selectedMedico) {
      fetchHorariosDiponivel();
    }
  }, [selectedMedico]);

  const FormularioConsulta = ({ onSubmit }) => {
    const renderizarSelectEspecialidade = () => {
      return (
        <form onSubmit={onSubmit} style={styles.card}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Escolha uma Especialidade:</label>
            <select
              style={styles.select}
              value={selectedEspecialidade}
              onChange={(e) => {
                const novaEspecialidade = e.target.value;
                setSelectedEspecialidade(novaEspecialidade);
                setSelectedMedico("");
                setHorariosDisponiveis([]);
                setSelectedHorarioId(null);
              }}
            >
              <option value="">Selecione uma especialidade</option>
              {especialidades.length > 0 ? (
                especialidades.map((especialidade, index) => (
                  <option key={index} value={especialidade}>
                    {especialidade}
                  </option>
                ))
              ) : (
                <option disabled>Carregando especialidades...</option>
              )}
            </select>
          </div>

          {selectedEspecialidade && (
            <div style={{ marginTop: '30px' }}>
              <label style={styles.label}>Escolha um Médico:</label>
              <div className="lista-medicos">
                {medicos.length > 0 ? (
                  medicos.map((medico, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.doctorCard,
                        ...(selectedMedico === medico.crm.toString() ? styles.doctorCardSelected : {})
                      }}
                      onClick={() => setSelectedMedico(medico.crm.toString())}
                    >
                      <strong style={{ fontSize: '16px', color: '#2c3e50' }}>{medico.dataDetalhesPessoa.nome}</strong>
                      <div style={{ marginTop: '5px', color: '#7f8c8d' }}>CRM: {medico.crm}</div>
                      <div style={{ marginTop: '5px', color: '#27ae60', fontWeight: '500' }}>
                        Valor da Consulta: R$ {medico.valorConsulta.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#7f8c8d' }}>Nenhum médico encontrado para esta especialidade.</p>
                )}
              </div>
            </div>
          )}

          {selectedMedico && (
            <div style={{ marginTop: '30px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Selecione uma data disponível:</label>
                <div style={{ maxWidth: '300px' }}>
                  <DatePicker
                    selected={dataSelecionada}
                    onChange={(date) => setDataSelecionada(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Selecione uma data"
                    includeDates={datasDisponiveisObj}
                    className="date-picker"
                    style={styles.select}
                  />
                </div>
              </div>
            </div>
          )}

          {dataSelecionada && (
            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>Horários disponíveis:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {horariosFiltrados.length > 0 ? (
                  horariosFiltrados.map((horario) => {
                    const hora = new Date(horario.horario).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={horario.id}
                        onClick={() => setSelectedHorarioId(horario.id)}
                        style={{
                          ...styles.timeSlot,
                          ...(selectedHorarioId === horario.id ? styles.timeSlotSelected : {})
                        }}
                      >
                        {hora}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: '#7f8c8d' }}>Nenhum horário disponível para esta data.</p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedEspecialidade || !selectedMedico || !selectedHorarioId}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              marginTop: '30px',
              opacity: (!selectedEspecialidade || !selectedMedico || !selectedHorarioId) ? 0.6 : 1
            }}
          >
            Marcar Consulta
          </button>
        </form>
      );
    };

    return renderizarSelectEspecialidade();
  };

  // PARTE LISTAGEM DE CONSULTAS
  const [statusDisponiveis, setStatusDisponiveis] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("TODAS");
  const [consultas, setConsultas] = useState([]);
  const [consultaParaAtualizar, setConsultaParaAtualizar] = useState(null);
  const [horariosDisponiveisAtualizacao, setHorariosDisponiveisAtualizacao] = useState([]);
  const [dataSelecionadaAtualizacao, setDataSelecionadaAtualizacao] = useState(null);
  const [selectedHorarioIdAtualizacao, setSelectedHorarioIdAtualizacao] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  useEffect(() => {
    fetchConsultas(selectedStatus, paginaAtual);
  }, [selectedStatus, paginaAtual]);

  useEffect(() => {
    const fetchStatusConsulta = async () => {
      try {
        const response = await api.get("/consulta/status");
        setStatusDisponiveis(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar status:", error);
      }
    };
    
    if (opcaoConsulta === "ListarConsulta") {
      fetchStatusConsulta();
    }
  }, [opcaoConsulta]);

  const fetchConsultas = async (selectedStatus, page = 0) => {
    try {
      const response = await api.get(`/consulta/${selectedStatus}`, {
        params: { page: page, size: 10 }
      });
      const consultasData = response.data.content || [];
      setConsultas(consultasData);
      setTotalPaginas(response.data.totalPages);
      setPaginaAtual(response.data.number);
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
      setConsultas([]);
    }
  };

  const cancelarConsulta = async (id) => {
    if (window.confirm("Tem certeza que deseja cancelar esta consulta?")) {
      try {
        await api.delete(`/consulta/cancelar/${id}`);
        alert("Consulta cancelada com sucesso!");
        fetchConsultas(selectedStatus);
      } catch (error) {
        console.error("Erro ao cancelar consulta:", error);
        alert("Erro ao cancelar consulta.");
      }
    }
  };

  const abrirModalAtualizacao = async (consulta) => {
    setConsultaParaAtualizar(consulta);
    try {
      const response = await api.get(`/medico/${consulta.dataDetalhesMedico.crm}/horarioDisponivel`);
      setHorariosDisponiveisAtualizacao(response.data.body || []);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      alert("Erro ao buscar horários disponíveis");
    }
  };
  
  const atualizarConsultaConfirmada = async () => {
    if (!selectedHorarioIdAtualizacao || !consultaParaAtualizar) return;
  
    try {
      const horarioSelecionado = horariosDisponiveisAtualizacao
        .find(h => h.id === selectedHorarioIdAtualizacao);
      
      if (!horarioSelecionado) {
        throw new Error("Horário selecionado não encontrado");
      }
  
      const dadosAtualizacao = {
        idConsulta: consultaParaAtualizar.id,
        idHorario: selectedHorarioIdAtualizacao,
        novoHorarioConsulta: new Date(horarioSelecionado.horario).toISOString()
      };
  
      await api.put(`/consulta/atualizar`, dadosAtualizacao);
      alert("Consulta atualizada com sucesso!");
      setConsultaParaAtualizar(null);
      fetchConsultas(selectedStatus);
    } catch (error) {
      console.error("Erro ao atualizar consulta:", error);
      alert(error.response?.data?.message || "Erro ao atualizar consulta.");
    }
  };

  const datasDisponiveisAtualizacao = [
    ...new Set(horariosDisponiveisAtualizacao.map(h =>
      new Date(h.horario)
    ))
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ABERTA': return { ...styles.statusIndicator, ...styles.statusOpen };
      case 'CANCELADA': return { ...styles.statusIndicator, ...styles.statusCanceled };
      case 'CONCLUIDA': return { ...styles.statusIndicator, ...styles.statusCompleted };
      case 'NAO_COMPARECIDA': return { ...styles.statusIndicator, ...styles.statusNoShow };
      default: return styles.statusIndicator;
    }
  };

  const ListarConsultas = () => {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Minhas Consultas</h2>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Filtrar por Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPaginaAtual(0);
            }}
            style={styles.select}
          >
            <option value="TODAS">TODAS</option>
            {statusDisponiveis.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
  
        {consultas.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Data</th>
                  <th style={styles.tableHeader}>Horário</th>
                  <th style={styles.tableHeader}>Médico</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => (
                  <tr key={consulta.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      {new Date(consulta.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(consulta.data).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td style={styles.tableCell}>
                      {consulta.dataDetalhesMedico.dataDetalhesPessoa.nome} 
                      <div style={{ color: '#7f8c8d', fontSize: '13px' }}>CRM: {consulta.dataDetalhesMedico.crm}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={getStatusStyle(consulta.statusConsula)}>
                        {consulta.statusConsula}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {consulta.statusConsula === 'ABERTA' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => abrirModalAtualizacao(consulta)}
                            style={{ ...styles.button, padding: '6px 12px', fontSize: '13px' }}
                          >
                            Atualizar
                          </button>
                          <button 
                            onClick={() => cancelarConsulta(consulta.id)}
                            style={{ ...styles.button, ...styles.buttonDanger, padding: '6px 12px', fontSize: '13px' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#7f8c8d', textAlign: 'center', margin: '20px 0' }}>
            Nenhuma consulta encontrada para o filtro selecionado.
          </p>
        )}

        {consultaParaAtualizar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={{ ...styles.title, borderBottom: 'none', marginBottom: '15px' }}>
                Atualizar Consulta
              </h3>
              <p style={{ marginBottom: '20px' }}>
                <strong>Médico:</strong> {consultaParaAtualizar.dataDetalhesMedico.dataDetalhesPessoa.nome}
              </p>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Selecione uma nova data:</label>
                <DatePicker
                  selected={dataSelecionadaAtualizacao}
                  onChange={(date) => {
                    setDataSelecionadaAtualizacao(date);
                    setSelectedHorarioIdAtualizacao(null);
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione uma data"
                  includeDates={datasDisponiveisAtualizacao}
                  style={styles.select}
                />
              </div>

              {dataSelecionadaAtualizacao && (
                <div style={{ marginTop: '15px' }}>
                  <label style={styles.label}>Horários disponíveis:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    {horariosDisponiveisAtualizacao
                      .filter(h => 
                        new Date(h.horario).toLocaleDateString('pt-BR') === 
                        dataSelecionadaAtualizacao.toLocaleDateString('pt-BR')
                      )
                      .map(horario => {
                        const hora = new Date(horario.horario).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div
                            key={horario.id}
                            onClick={() => setSelectedHorarioIdAtualizacao(horario.id)}
                            style={{
                              ...styles.timeSlot,
                              ...(selectedHorarioIdAtualizacao === horario.id ? styles.timeSlotSelected : {})
                            }}
                          >
                            {hora}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
                <button 
                  onClick={() => setConsultaParaAtualizar(null)}
                  style={{ ...styles.button, backgroundColor: '#95a5a6' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={atualizarConsultaConfirmada}
                  disabled={!selectedHorarioIdAtualizacao}
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess,
                    opacity: !selectedHorarioIdAtualizacao ? 0.6 : 1
                  }}
                >
                  Confirmar Atualização
                </button>
              </div>
            </div>
          </div>
        )}

        {totalPaginas > 1 && (
          <div style={styles.pagination}>
            <button 
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 0))}
              disabled={paginaAtual === 0}
              style={styles.button}
            >
              Anterior
            </button>

            <span style={{ color: '#7f8c8d' }}>
              Página {paginaAtual + 1} de {totalPaginas}
            </span>

            <button 
              onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas - 1))}
              disabled={paginaAtual + 1 >= totalPaginas}
              style={styles.button}
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderizarConteudoConsulta = () => {
    switch (opcaoConsulta) {
      case "MarcaConsulta":
        return <FormularioConsulta onSubmit={onSubmit} />;
      case "ListarConsulta":
        return <ListarConsultas />;
      default:
        return (
          <div style={styles.card}>
            <h2 style={styles.title}>Área de Consultas</h2>
            <p style={{ color: '#7f8c8d' }}>
              Selecione uma opção no menu para gerenciar suas consultas.
            </p>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <nav style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
      }}>
        <button 
          onClick={() => setOpcaoConsulta("MarcaConsulta")}
          style={{
            ...styles.button,
            backgroundColor: opcaoConsulta === "MarcaConsulta" ? "#2980b9" : "#3498db"
          }}
        >
          Marcar Consulta
        </button>
        <button 
          onClick={() => setOpcaoConsulta("ListarConsulta")}
          style={{
            ...styles.button,
            backgroundColor: opcaoConsulta === "ListarConsulta" ? "#2980b9" : "#3498db"
          }}
        >
          Listar Consultas
        </button>
        <button 
          onClick={() => setOpcaoSelecionada("Dashboard")}
          style={{
            ...styles.button,
            backgroundColor: "#95a5a6"
          }}
        >
          Voltar
        </button>
      </nav>

      {renderizarConteudoConsulta()}
    </div>
  );
};

const AtualizarDados = () => (
  <div style={styles.card}>
    <h2 style={styles.title}>Atualizar Dados</h2>
    <p style={{ color: '#7f8c8d' }}>Formulário para atualização de dados pessoais.</p>
    {/* Adicione aqui o formulário de atualização de dados */}
  </div>
);

const CreditarSaldo = () => (
  <div style={styles.card}>
    <h2 style={styles.title}>Creditar Saldo</h2>
    <p style={{ color: '#7f8c8d' }}>Formulário para adicionar saldo à conta.</p>
    {/* Adicione aqui o formulário de crédito de saldo */}
  </div>
);

const HistoricoDoencas = () => (
  <div style={styles.card}>
    <h2 style={styles.title}>Histórico de Doenças</h2>
    <p style={{ color: '#7f8c8d' }}>Lista de doenças registradas no sistema.</p>
    {/* Adicione aqui a lista de histórico de doenças */}
  </div>
);

const HistoricoTransacoes = () => (
  <div style={styles.card}>
    <h2 style={styles.title}>Histórico de Transações</h2>
    <p style={{ color: '#7f8c8d' }}>Todas as transações financeiras realizadas.</p>
    {/* Adicione aqui a lista de transações */}
  </div>
);

const DashboardPaciente = () => {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState("Consulta");

  const renderizarConteudo = () => {
    switch (opcaoSelecionada) {
      case "AtualizarDados":
        return <AtualizarDados />;
      case "CreditarSaldo":
        return <CreditarSaldo />;
      case "Consulta":
        return <Consulta setOpcaoSelecionada={setOpcaoSelecionada} />;
      case "HistoricoDoencas":
        return <HistoricoDoencas />;
      case "HistoricoTransacoes":
        return <HistoricoTransacoes />;
      default:
        return (
          <div style={styles.card}>
            <h2 style={styles.title}>Bem-vindo ao Painel do Paciente</h2>
            <p style={{ color: '#7f8c8d' }}>Selecione uma das opções no menu ao lado para começar.</p>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Menu lateral */}
      <nav style={styles.sidebar}>
        <ul style={styles.sidebarList}>
          <li 
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "Consulta" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("Consulta")}
          >
            <span style={styles.sidebarIcon}>📅</span>
            Consultas
          </li>
          <li 
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "AtualizarDados" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("AtualizarDados")}
          >
            <span style={styles.sidebarIcon}>✏️</span>
            Atualizar Dados
          </li>
          <li 
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "CreditarSaldo" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("CreditarSaldo")}
          >
            <span style={styles.sidebarIcon}>💵</span>
            Creditar Saldo
          </li>
          <li 
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "HistoricoDoencas" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("HistoricoDoencas")}
          >
            <span style={styles.sidebarIcon}>🏥</span>
            Histórico de Doenças
          </li>
          <li 
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "HistoricoTransacoes" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("HistoricoTransacoes")}
          >
            <span style={styles.sidebarIcon}>📊</span>
            Histórico Financeiro
          </li>
        </ul>
      </nav>

      {/* Conteúdo dinâmico */}
      <div style={styles.content}>
        {renderizarConteudo()}
      </div>
    </div>
  );
};

export default DashboardPaciente;