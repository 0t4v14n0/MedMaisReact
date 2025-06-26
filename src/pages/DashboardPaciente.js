import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Consulta = () => {

  const [opcaoConsulta, setOpcaoConsulta] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [selectedHorarioId, setSelectedHorarioId] = useState(null);

  const horariosFiltrados = horariosDisponiveis.filter(h =>
    new Date(h.horario).toLocaleDateString('pt-BR') ===
    (dataSelecionada ? dataSelecionada.toLocaleDateString('pt-BR') : '')
  );
  
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
      navigate("/");
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
      </nav>

      {renderizarConteudoConsulta()}
    </div>
  );
};

const AtualizarDados = () => {

  const [dados, setDados] = useState(null);
  const [editando, setEditando] = useState({
    dadosPessoais: false,
    endereco: false,
    saude: false,
    senha: false
  });
  const [formData, setFormData] = useState({});
  const [dadosOriginais, setDadosOriginais] = useState(null);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const response = await api.get("/pessoa/dados");
        setDados(response.data);
        setFormData({
          ...response.data.dataDetalhesPessoa,
          ...response.data.dataDetalhesPessoa.dataDetalhesEndereco,
          tipoSanguineo: response.data.tipoSanguineo,
          contatoEmergencia: response.data.contatoEmergencia,
          altura: response.data.altura,
          peso: response.data.peso
        });
        setDadosOriginais(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Erro ao carregar dados do usuário");
      }
    };
    fetchDados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleEdicao = (section) => {
    setEditando(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (section) => {
  try {

    if (section === 'senha') {
      if (!formData.senha) {
        alert("Por favor, digite uma nova senha!");
        return;
      }
      if (formData.senha !== formData.confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
      }
      if (formData.senha.length < 8) {
        alert("A senha deve ter no mínimo 8 caracteres!");
        return;
      }
    }

    const jsonFinal = construirJsonPaciente(section, formData, dadosOriginais);
    
    // Verifica se há algo para enviar
    if (Object.keys(jsonFinal).length === 0 || 
        (section === 'dadosPessoais' && 
         !jsonFinal.dataAtualizarPessoa?.nome &&
         !jsonFinal.dataAtualizarPessoa?.telefone &&
         !jsonFinal.dataAtualizarPessoa?.dataNascimento &&
         !jsonFinal.dataAtualizarPessoa?.senha)) {
      alert("Nenhuma alteração foi feita");
      return;
    }

    await api.put("/paciente/atualizar", jsonFinal);
    alert("Dados atualizados com sucesso!");
    
    // Limpa a senha após atualização
    if (section === 'dadosPessoais') {
      setFormData(prev => ({ ...prev, senha: '', confirmarSenha: '' }));
    }
    
    setEditando(prev => ({ ...prev, [section]: false }));
    
  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
    alert("Erro ao atualizar dados");
  }
};

  function construirJsonPaciente(section, formData, dadosOriginais) {
    const original = dadosOriginais?.dataDetalhesPessoa || {};
    const originalEndereco = original?.dataDetalhesEndereco || {};

    // Objeto base com todos os campos possíveis inicializados como null
    const payload = {
      dataAtualizarPessoa: {
        login: null,
        senha: null,
        nome: null,
        cpf: null,
        email: null,
        telefone: null,
        dataNascimento: null,
        dataRegistroEndereco: {
          endereco: null,
          cidade: null,
          estado: null,
          cep: null,
          pais: null,
          referencia: null
        }
      },
      tipoSanguineo: null,
      contatoEmergencia: null,
      peso: null,
      altura: null
    };

    // Dados Pessoais
    if (section === 'dadosPessoais' || section === 'senha') {
      if (formData.senha) payload.dataAtualizarPessoa.senha = formData.senha;
      if (formData.nome !== original.nome) payload.dataAtualizarPessoa.nome = formData.nome;
      if (formData.telefone !== original.telefone) payload.dataAtualizarPessoa.telefone = formData.telefone;
      if (formData.dataNascimento !== original.dataNascimento) {
        payload.dataAtualizarPessoa.dataNascimento = formData.dataNascimento;
      }
    }

    // Endereço
    if (section === 'endereco') {
      if (formData.endereco !== originalEndereco.endereco) {
        payload.dataAtualizarPessoa.dataRegistroEndereco.endereco = formData.endereco;
      }
      if (formData.cidade !== originalEndereco.cidade) {
        payload.dataAtualizarPessoa.dataRegistroEndereco.cidade = formData.cidade;
      }
      if (formData.estado !== originalEndereco.estado) {
        payload.dataAtualizarPessoa.dataRegistroEndereco.estado = formData.estado;
      }
      if (formData.cep !== originalEndereco.cep) {
        payload.dataAtualizarPessoa.dataRegistroEndereco.cep = formData.cep;
      }
      if (formData.pais !== originalEndereco.pais) {
        payload.dataAtualizarPessoa.dataRegistroEndereco.pais = formData.pais;
      }
      if (formData.referencia !== originalEndereco.referencia) {
        payload.dataAtualizarPessoa.dataRegistroEndereco.referencia = formData.referencia;
      }
    }

    // Saúde
    if (section === 'saude') {
      if (formData.tipoSanguineo !== dadosOriginais.tipoSanguineo) {
        payload.tipoSanguineo = formData.tipoSanguineo;
      }
      if (formData.contatoEmergencia !== dadosOriginais.contatoEmergencia) {
        payload.contatoEmergencia = formData.contatoEmergencia;
      }
      if (formData.peso !== undefined && parseFloat(formData.peso) !== parseFloat(dadosOriginais?.peso || 0)) {
        payload.peso = parseFloat(formData.peso);
      }
      if (formData.altura !== undefined && parseFloat(formData.altura) !== parseFloat(dadosOriginais?.altura || 0)) {
        payload.altura = parseFloat(formData.altura);
      }
    }

    // Remove objetos vazios (opcional, dependendo do backend)
    const cleanObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === null) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          cleanObject(obj[key]);
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      });
      return obj;
    };

    return cleanObject(payload);
  }



  if (!dados) return <div style={styles.card}>Carregando dados...</div>;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Atualizar Dados</h2>
      
      {/* Seção Dados Pessoais */}
      <div style={{ marginBottom: '30px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ ...styles.subtitle, marginBottom: '15px' }}>Dados Pessoais</h3>
          <button 
            onClick={() => toggleEdicao('dadosPessoais')}
            style={styles.smallButton}
          >
            {editando.dadosPessoais ? 'Cancelar' : 'Editar'}
          </button>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Nome Completo</label>
          <input
            type="text"
            name="nome"
            value={formData.nome || ''}
            onChange={handleChange}
            disabled={!editando.dadosPessoais}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>CPF</label>
          <input
            type="text"
            value={dados.dataDetalhesPessoa.cpf}
            disabled
            style={styles.inputDisabled}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Telefone</label>
          <input
            type="text"
            name="telefone"
            value={formData.telefone || ''}
            onChange={handleChange}
            disabled={!editando.dadosPessoais}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Nascimento</label>
          <input
            type="date"
            name="dataNascimento"
            value={formData.dataNascimento || ''}
            onChange={handleChange}
            disabled={!editando.dadosPessoais}
            style={styles.input}
          />
        </div>
        
        {editando.dadosPessoais && (
          <button 
            onClick={() => handleSubmit('dadosPessoais')}
            style={{ ...styles.button, ...styles.buttonSuccess, marginTop: '10px' }}
          >
            Salvar Alterações
          </button>
        )}
      </div>

      {/* Seção Segurança - Sempre visível */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ ...styles.subtitle, marginBottom: '10px', fontSize: '16px' }}>Segurança da Conta</h4>
          <button 
            onClick={() => setEditando(prev => ({ ...prev, senha: !prev.senha }))}
            style={styles.smallButton}
          >
            {editando.senha ? 'Cancelar' : 'Alterar Senha'}
          </button>
        </div>

        {editando.senha && (
          <div style={{ marginTop: '10px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nova Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha || ''}
                onChange={handleChange}
                style={styles.input}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmar Senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha || ''}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            
            <button 
              onClick={() => handleSubmit('senha')}
              style={{ ...styles.button, ...styles.buttonSuccess, marginTop: '10px' }}
            >
              Salvar Nova Senha
            </button>
            
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <p>• Mínimo 8 caracteres</p>
              <p>• Use letras, números e caracteres especiais</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Seção Endereço */}
      <div style={{ marginBottom: '30px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ ...styles.subtitle, marginBottom: '15px' }}>Endereço</h3>
          <button 
            onClick={() => toggleEdicao('endereco')}
            style={styles.smallButton}
          >
            {editando.endereco ? 'Cancelar' : 'Editar'}
          </button>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Endereço</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco || ''}
            onChange={handleChange}
            disabled={!editando.endereco}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Cidade</label>
          <input
            type="text"
            name="cidade"
            value={formData.cidade || ''}
            onChange={handleChange}
            disabled={!editando.endereco}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Estado</label>
          <input
            type="text"
            name="estado"
            value={formData.estado || ''}
            onChange={handleChange}
            disabled={!editando.endereco}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>CEP</label>
          <input
            type="text"
            name="cep"
            value={formData.cep || ''}
            onChange={handleChange}
            disabled={!editando.endereco}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>País</label>
          <input
            type="text"
            name="pais"
            value={formData.pais || ''}
            onChange={handleChange}
            disabled={!editando.endereco}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Referência</label>
          <input
            type="text"
            name="referencia"
            value={formData.referencia || ''}
            onChange={handleChange}
            disabled={!editando.endereco}
            style={styles.input}
          />
        </div>
        
        {editando.endereco && (
          <button 
            onClick={() => handleSubmit('endereco')}
            style={{ ...styles.button, ...styles.buttonSuccess, marginTop: '10px' }}
          >
            Salvar Alterações
          </button>
        )}
      </div>
      
      {/* Seção Saúde */}
      <div style={{ marginBottom: '30px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ ...styles.subtitle, marginBottom: '15px' }}>Dados de Saúde</h3>
          <button 
            onClick={() => toggleEdicao('saude')}
            style={styles.smallButton}
          >
            {editando.saude ? 'Cancelar' : 'Editar'}
          </button>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Tipo Sanguíneo</label>
          <select
            name="tipoSanguineo"
            value={formData.tipoSanguineo || ''}
            onChange={handleChange}
            disabled={!editando.saude}
            style={styles.input}
          >
            <option value="A_POSITIVO">A+</option>
            <option value="A_NEGATIVO">A-</option>
            <option value="B_POSITIVO">B+</option>
            <option value="B_NEGATIVO">B-</option>
            <option value="AB_POSITIVO">AB+</option>
            <option value="AB_NEGATIVO">AB-</option>
            <option value="O_POSITIVO">O+</option>
            <option value="O_NEGATIVO">O-</option>
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Contato de Emergência</label>
          <input
            type="text"
            name="contatoEmergencia"
            value={formData.contatoEmergencia || ''}
            onChange={handleChange}
            disabled={!editando.saude}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Altura (cm)</label>
          <input
            type="number"
            name="altura"
            value={formData.altura || ''}
            onChange={handleChange}
            disabled={!editando.saude}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Peso (kg)</label>
          <input
            type="number"
            name="peso"
            value={formData.peso || ''}
            onChange={handleChange}
            disabled={!editando.saude}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>IMC</label>
          <input
            type="text"
            value={dados.imc}
            disabled
            style={styles.inputDisabled}
          />
        </div>
        
        {editando.saude && (
          <button 
            onClick={() => handleSubmit('saude')}
            style={{ ...styles.button, ...styles.buttonSuccess, marginTop: '10px' }}
          >
            Salvar Alterações
          </button>
        )}
      </div>
      
      {/* Seção Informações não editáveis */}
      <div>
        <h3 style={{ ...styles.subtitle, marginBottom: '15px' }}>Informações do Plano</h3>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Número da Carteira</label>
          <input
            type="text"
            value={dados.numeroCarteiraPlano}
            disabled
            style={styles.inputDisabled}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Plano</label>
          <input
            type="text"
            value={dados.plano}
            disabled
            style={styles.inputDisabled}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Saldo</label>
          <input
            type="text"
            value={`R$ ${dados.dataDetalhesPessoa.saldo.toFixed(2)}`}
            disabled
            style={styles.inputDisabled}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>E-mail</label>
          <input
            type="text"
            value={dados.dataDetalhesPessoa.email}
            disabled
            style={styles.inputDisabled}
          />
        </div>
      </div>
    </div>
  );
};

const HistoricoDoencas = () => {

  const [doencas, setDoencas] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nomeDoenca: '',
    descricao: '',
    dataDiagnostico: '',
    dataRecuperacao: '',
    estadoAtual: 'ATIVA',
    tratamento: '',
    medicamentos: '',
    observacoesMedicas: '',
    gravidade: 'LEVE'
  });
  const [errors, setErrors] = useState({});

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'ATIVA': return '#e74c3c'; // vermelho
      case 'CURADA': return '#2ecc71'; // verde
      case 'CRONICA': return '#f39c12'; // laranja
      case 'CONTROLADA': return '#3498db'; // azul
      default: return '#7f8c8d'; // cinza
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await api.delete(`/historicodoenca/${id}`);
        // Atualiza a lista após exclusão
        const updatedDoencas = doencas.filter(doenca => doenca.id !== id);
        setDoencas(updatedDoencas);
        alert('Registro excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir doença:', error);
        alert('Erro ao excluir registro');
      }
    }
  };

  // Estados possíveis
  const estadosDoenca = ['ATIVA', 'CURADA', 'CRONICA', 'CONTROLADA'];
  const niveisGravidade = ['LEVE', 'MODERADA', 'GRAVE', 'INVESTIGACAO'];

  // Carrega as doenças do backend
  useEffect(() => {
    const carregarDoencas = async () => {
      try {
        const response = await api.get('/historicodoenca/all');
        
        // DEBUG IMPORTANTE - Verifique a estrutura completa
        console.log("Resposta completa:", response);
        console.log("Data:", response.data);
        console.log("Body:", response.data.body);
        console.log("Content:", response.data.body.content);
        
        // Acessa os dados corretamente: data -> body -> content
        const dados = response.data.body.content || [];
        
        setDoencas(dados);
      } catch (error) {
        console.error('Erro ao carregar doenças:', error);
        alert('Erro ao carregar dados: ' + error.message);
      }
    };
    
    carregarDoencas();
  }, []);

  // Manipula mudanças no formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Valida o formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nomeDoenca.trim()) newErrors.nomeDoenca = 'Nome da doença é obrigatório';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.dataDiagnostico) newErrors.dataDiagnostico = 'Data de diagnóstico é obrigatória';
    if (!formData.estadoAtual) newErrors.estadoAtual = 'Estado atual é obrigatório';
    if (!formData.tratamento.trim()) newErrors.tratamento = 'Tratamento é obrigatório';
    if (!formData.gravidade) newErrors.gravidade = 'Gravidade é obrigatória';
    
    // Validação condicional para data de recuperação
    if (!formData.dataDiagnostico) {
      newErrors.dataDiagnostico = 'Data de diagnóstico é obrigatória';
    } else if (new Date(formData.dataDiagnostico) > new Date()) {
      newErrors.dataDiagnostico = 'Data de diagnóstico não pode ser futura';
    }

    // Validação condicional para data de recuperação
    if (formData.estadoAtual === 'CURADA') {
      if (!formData.dataRecuperacao) {
        newErrors.dataRecuperacao = 'Data de recuperação é obrigatória para doenças curadas';
      } else if (new Date(formData.dataRecuperacao) < new Date(formData.dataDiagnostico)) {
        newErrors.dataRecuperacao = 'Data de recuperação deve ser após o diagnóstico';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envia o formulário
  const handleEdit = (doenca) => {
    // Preenche o formulário modal com os dados da doença
    setFormData({
      nomeDoenca: doenca.nomeDoenca,
      descricao: doenca.descricao,
      dataDiagnostico: doenca.dataDiagnostico,
      dataRecuperacao: doenca.dataRecuperacao,
      estadoAtual: doenca.estadoAtual,
      tratamento: doenca.tratamento,
      medicamentos: doenca.medicamentos,
      observacoesMedicas: doenca.observacoesMedicas,
      gravidade: doenca.gravidade,
      id: doenca.id // Adicione o ID para a atualização
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (formData.id) {
        // Atualização existente
        await api.put(`/historicodoenca/${formData.id}`, formData);
        alert('Doença atualizada com sucesso!');
      } else {
        // Novo registro
        await api.post('/historicodoenca/cadastro', formData);
        alert('Doença registrada com sucesso!');
      }
      
      setShowModal(false);
      // Recarrega a lista
      const response = await api.get('/historicodoenca/all');
      setDoencas(response.data.content || response.data);
    } catch (error) {
      console.error('Erro ao salvar doença:', error);
      alert('Erro ao salvar doença');
    }
  };

  // Formata a data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={styles.title}>Histórico de Doenças</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={styles.addButton}
        >
          + Adicionar Doença
        </button>
      </div>


      {/* Lista de doenças - VERSÃO ATUALIZADA COM AÇÕES */}
      <div style={styles.doencasContainer}>
        {doencas && doencas.length > 0 ? (
          doencas.map((doenca) => (
            <div key={doenca.id} style={styles.doencaCard}>
              <div style={styles.doencaHeader}>
                <h3>{doenca.nomeDoenca}</h3>
                <span style={{ 
                  backgroundColor: getStatusColor(doenca.estadoAtual),
                  padding: '3px 10px',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.8rem'
                }}>
                  {doenca.estadoAtual}
                </span>
              </div>

              <div style={styles.doencaInfo}>
                <p><strong>Diagnóstico:</strong> {formatDate(doenca.dataDiagnostico)}</p>
                {doenca.dataRecuperacao && (
                  <p><strong>Recuperação:</strong> {formatDate(doenca.dataRecuperacao)}</p>
                )}
                <p><strong>Gravidade:</strong> {doenca.gravidade}</p>
              </div>

              <div style={styles.doencaDetails}>
                <p><strong>Tratamento:</strong> {doenca.tratamento}</p>
                <p><strong>Medicamentos:</strong> {doenca.medicamentos}</p>
              </div>

              {/* Botões de Ação */}
              <div style={styles.actionsContainer}>
                <button 
                  onClick={() => handleEdit(doenca)}
                  style={styles.editButton}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(doenca.id)}
                  style={styles.deleteButton}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.noResults}>
            <p>Nenhum registro encontrado</p>
          </div>
        )}
      </div>



{showModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>{formData.id ? 'Editar Doença' : 'Registrar Nova Doença'}</h3>
        <button onClick={() => setShowModal(false)} style={styles.closeButton}>
          &times;
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Informações Básicas</h4>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome da Doença*</label>
              <input
                type="text"
                name="nomeDoenca"
                value={formData.nomeDoenca || ''}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.nomeDoenca && <span style={styles.error}>{errors.nomeDoenca}</span>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Descrição*</label>
              <textarea
                name="descricao"
                value={formData.descricao || ''}
                onChange={handleChange}
                style={styles.textarea}
                rows={3}
              />
              {errors.descricao && <span style={styles.error}>{errors.descricao}</span>}
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: DATAS */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Período</h4>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Diagnóstico*</label>
              <input
                type="date"
                name="dataDiagnostico"
                value={formData.dataDiagnostico || ''}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.dataDiagnostico && <span style={styles.error}>{errors.dataDiagnostico}</span>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Recuperação</label>
              <input
                type="date"
                name="dataRecuperacao"
                value={formData.dataRecuperacao || ''}
                onChange={handleChange}
                style={styles.input}
                disabled={formData.estadoAtual !== 'CURADA'}
              />
              {errors.dataRecuperacao && <span style={styles.error}>{errors.dataRecuperacao}</span>}
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: CLASSIFICAÇÃO */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Classificação</h4>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Estado Atual*</label>
              <select
                name="estadoAtual"
                value={formData.estadoAtual || ''}
                onChange={handleChange}
                style={styles.input}
              >
                {estadosDoenca.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              {errors.estadoAtual && <span style={styles.error}>{errors.estadoAtual}</span>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Gravidade*</label>
              <select
                name="gravidade"
                value={formData.gravidade || ''}
                onChange={handleChange}
                style={styles.input}
              >
                {niveisGravidade.map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
              {errors.gravidade && <span style={styles.error}>{errors.gravidade}</span>}
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: TRATAMENTO */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Tratamento</h4>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tratamento Prescrito*</label>
            <textarea
              name="tratamento"
              value={formData.tratamento || ''}
              onChange={handleChange}
              style={styles.textarea}
              rows={3}
            />
            {errors.tratamento && <span style={styles.error}>{errors.tratamento}</span>}
          </div>
        </div>

        {/* SEÇÃO 5: MEDICAMENTOS E OBSERVAÇÕES */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Medicação e Observações</h4>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Medicamentos*</label>
              <textarea
                name="medicamentos"
                value={formData.medicamentos || ''}
                onChange={handleChange}
                style={styles.textarea}
                rows={2}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Observações Médicas</label>
              <textarea
                name="observacoesMedicas"
                value={formData.observacoesMedicas || ''}
                onChange={handleChange}
                style={styles.textarea}
                rows={2}
              />
            </div>
          </div>
        </div>

        <div style={styles.formActions}>
          <button type="button" onClick={() => setShowModal(false)} style={styles.cancelButton}>
            Cancelar
          </button>
          <button type="submit" style={styles.submitButton}>
            {formData.id ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

const HistoricoTransacoes = () => {
  
  const [statusDisponiveis, setStatusDisponiveis] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("TODAS");
  const [transacoes, setTransacoes] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(false);

    const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    };

    switch(status) {
      case 'CONCLUIDA':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'PENDENTE':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'CANCELADA':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'ESTORNADA':
        return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#383d41' };
      default:
        return baseStyle;
    }
  };

  // Busca os status disponíveis ao montar o componente
  useEffect(() => {
    const fetchStatusHistoricoTransacoes = async () => {
      try {
        const response = await api.get("/historicotransacoes/status");
        if (Array.isArray(response.data)) {
          setStatusDisponiveis(response.data);
        } else {
          setStatusDisponiveis([]);
        }
      } catch (error) {
        console.error("Erro ao buscar status das transações:", error);
      }
    };

    fetchStatusHistoricoTransacoes();
  }, []);

  // Busca as transações quando o status ou página muda
  useEffect(() => {
    fetchTransacoes(selectedStatus, paginaAtual);
  }, [selectedStatus, paginaAtual]);

  const fetchTransacoes = async (status, page = 0) => {
    try {
      const endpoint = `/historicotransacoes/${status}`;
      const { data } = await api.get(endpoint, { params: { page, size: 10 } });
      setTransacoes(data.content);
      setTotalPaginas(data.totalPages);
    } catch {
      setTransacoes([]);
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Histórico de Transações</h2>

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

      {carregando ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Carregando transações...</p>
      ) : transacoes.length > 0 ? (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Data</th>
              <th style={styles.tableHeader}>Valor</th>
              <th style={styles.tableHeader}>Médico</th>
              <th style={styles.tableHeader}>Especialidade</th>
              <th style={styles.tableHeader}>Paciente</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Remetente</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((transacao) => {
              // Determina o nome do remetente
              const remetenteNome = transacao.remetente === transacao.dataDetalhesPaciente.dataDetalhesPessoa.id 
                ? transacao.dataDetalhesPaciente.dataDetalhesPessoa.nome 
                : transacao.dataDetalhesMedico.dataDetalhesPessoa.nome;
              
              return (
                <tr key={transacao.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    {formatarData(transacao.dataTransacao)}
                  </td>
                  <td style={{
                    ...styles.tableCell,
                    color: transacao.valor >= 0 ? '#27ae60' : '#e74c3c',
                    fontWeight: '500'
                  }}>
                    {formatarValor(transacao.valor)}
                  </td>
                  <td style={styles.tableCell}>
                    {transacao.dataDetalhesMedico.dataDetalhesPessoa.nome}
                    <div style={{ fontSize: '0.8em', color: '#7f8c8d' }}>
                      CRM: {transacao.dataDetalhesMedico.crm}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {transacao.dataDetalhesMedico.especialidadeMedica}
                  </td>
                  <td style={styles.tableCell}>
                    {transacao.dataDetalhesPaciente.dataDetalhesPessoa.nome}
                    <div style={{ fontSize: '0.8em', color: '#7f8c8d' }}>
                      Carteira: {transacao.dataDetalhesPaciente.numeroCarteiraPlano}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={getStatusStyle(transacao.status)}>
                      {transacao.status}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {remetenteNome}
                    <div style={{ fontSize: '0.8em', color: '#7f8c8d' }}>
                      (ID: {transacao.remetente})
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '20px' }}>
          Nenhuma transação encontrada para o filtro selecionado.
        </p>
      )}

      {totalPaginas > 1 && (
        <div style={styles.pagination}>
          <button 
            onClick={() => setPaginaAtual(p => Math.max(p - 1, 0))}
            disabled={paginaAtual === 0}
            style={styles.button}
          >
            Anterior
          </button>
          
          <span style={{ color: '#7f8c8d' }}>
            Página {paginaAtual + 1} de {totalPaginas}
          </span>
          
          <button 
            onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas - 1))}
            disabled={paginaAtual >= totalPaginas - 1}
            style={styles.button}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

const CreditarSaldo = () => (
  <div style={styles.card}>
    <h2 style={styles.title}>Creditar Saldo</h2>
    <p style={{ color: '#7f8c8d' }}>Formulário para adicionar saldo à conta.</p>
    {/* Adicione aqui o formulário de crédito de saldo */}
  </div>
);

const PlanosClinica = () =>(
  <div style={styles.card}>
    <h2 style={styles.title}>Creditar Saldo</h2>
    <p style={{ color: '#7f8c8d' }}>Formulário para adicionar saldo à conta.</p>
    {/* Adicione aqui o formulário de crédito de saldo */}
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
        return <Consulta />;
      case "HistoricoDoencas":
        return <HistoricoDoencas />;
      case "HistoricoTransacoes":
        return <HistoricoTransacoes />;
      case "Planos Clinica":
        return <PlanosClinica />;
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
              ...(opcaoSelecionada === "Planos" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("Planos")}
          >
            <span style={styles.sidebarIcon}>📋</span>
            Planos Clinica
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


        </ul>
      </nav>

      {/* Conteúdo dinâmico */}
      <div style={styles.content}>
        {renderizarConteudo()}
      </div>
    </div>
  );
};

// Estilos globais
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#E5FFFD",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#00C7B4",
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
    backgroundColor: "#233975",
    borderLeft: "4px solid #3498db"
  },
  sidebarIcon: {
    marginRight: "10px",
    fontSize: "18px"
  },
  content: {
    flex: 1,
    padding: "30px",
    backgroundColor: "#E5FFFD"
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
  subtitle: {
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '500',
    marginTop: '20px'
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
  smallButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#2980b9'
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
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    '&:disabled': {
      backgroundColor: '#f5f5f5',
      borderColor: '#eee'
    }
  },
  inputDisabled: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #eee',
    fontSize: '14px',
    backgroundColor: '#f5f5f5',
    color: '#7f8c8d'
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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    overflowY: 'auto'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '800px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '25px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative'
  },
  modalTitle: {
    color: '#2c3e50',
    margin: 0,
    fontSize: '20px',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#7f8c8d',
    padding: '5px',
    '&:hover': {
      color: '#e74c3c'
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '15px'
    }
  },
  formGroup: {
    marginBottom: '0'
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    '&:focus': {
      borderColor: '#00C7B4',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(0,199,180,0.2)'
    }
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
    '&:focus': {
      borderColor: '#00C7B4',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(0,199,180,0.2)'
    }
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px'
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    color: '#2c3e50',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#d0d0d0'
    }
  },
  submitButton: {
    backgroundColor: '#00C7B4',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#00a896'
    }
  },
  error: {
    color: '#e74c3c',
    fontSize: '0.8rem',
    marginTop: '5px',
    display: 'block'
  }
};

export default DashboardPaciente;