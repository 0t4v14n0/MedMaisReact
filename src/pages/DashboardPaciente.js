import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/api";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Consulta = ({ setOpcaoSelecionada }) => {

  const [opcaoConsulta, setOpcaoConsulta] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [selectedHorarioId, setSelectedHorarioId] = useState(null);
  
  const datasDisponiveis = [
    ...new Set(horariosDisponiveis.map(h =>
      new Date(h.horario).toLocaleDateString('pt-BR')
    ))
  ];
  
  const datasDisponiveisObj = datasDisponiveis.map(dataStr => {
    const [dia, mes, ano] = dataStr.split('/');
    return new Date(ano, mes - 1, dia); // cuidado com mês
  });

  const horariosFiltrados = horariosDisponiveis.filter(h =>
    new Date(h.horario).toLocaleDateString('pt-BR') ===
    (dataSelecionada ? dataSelecionada.toLocaleDateString('pt-BR') : '')
  );

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

  useEffect(() => {// voltar a pagina pardao
    if (opcaoConsulta === "Dashboard") {
      navigate("/paciente/dashboard");
    }
  }, [opcaoConsulta, navigate]);

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await api.get("/medico/especialidade");
        console.log(response.data);

        // Ajustando para pegar a lista correta do corpo da resposta
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
        console.log("selectedMedico:", selectedMedico);
        const response = await api.get(`/medico/${selectedMedico}/horarioDisponivel`);
        console.log(response.data.body);
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

        <form onSubmit={onSubmit}>
          <label>Escolha uma Especialidade:</label>
          <select
              value={selectedEspecialidade}
              onChange={(e) => {
                const novaEspecialidade = e.target.value;
                setSelectedEspecialidade(novaEspecialidade);
                setSelectedMedico(""); // limpa médico
                setHorariosDisponiveis([]); // limpa horários
                setSelectedHorarioId(null); // limpa horário selecionado
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

          {selectedEspecialidade && (
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Escolha um Médico:
              </label>

              <div className="lista-medicos">

                {medicos.length > 0 ? (
                  medicos.map((medico, index) => (
                    <div
                      key={index}
                      className={`medico-card ${selectedMedico === medico.crm.toString() ? 'selecionado' : ''}`}
                      onClick={() => setSelectedMedico(medico.crm.toString())}
                      style={{
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        backgroundColor: selectedMedico === medico.crm ? '#e0f7fa' : '#fff',
                      }}
                >
                      <strong>{medico.dataDetalhesPessoa.nome}</strong> <br />
                      CRM: {medico.crm}
                      Valor da Consulta: {medico.valorConsulta}
                    </div>
                  ))
                ) : (
                  <p>Carregando médicos...</p>
                )}
              </div>
            </div>
          )}

          <div className="lista-horarios" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
            {/* Passo 1: Só mostra o DatePicker se um médico estiver selecionado */}
            {selectedMedico && (
              <DatePicker
                selected={dataSelecionada}
                onChange={(date) => setDataSelecionada(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione uma data"
                includeDates={datasDisponiveisObj}
              />
            )}

            {/* Passo 2: Só mostra os horários se uma data estiver selecionada */}
            {dataSelecionada && horariosFiltrados.map((horario) => {
              const hora = new Date(horario.horario).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={horario.id}
                  onClick={() => setSelectedHorarioId(horario.id)}
                  className={`horario-card ${selectedHorarioId === horario.id ? 'selecionado' : ''}`}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedHorarioId === horario.id ? '#e0f7fa' : '#fff',
                    minWidth: '80px',
                    textAlign: 'center',
                  }}
                >
                  {hora}
                </div>
              );
            })}
          </div>


          <button
            type="submit"
            disabled={!selectedEspecialidade || !selectedMedico || !selectedHorarioId}
            style={{
              marginTop: '20px',
              backgroundColor: (!selectedEspecialidade || !selectedMedico || !selectedHorarioId) ? '#ccc' : '#4caf50',
              color: '#fff',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: (!selectedEspecialidade || !selectedMedico || !selectedHorarioId) ? 'not-allowed' : 'pointer'
            }}
          >
            Marcar Consulta
          </button>
          
        </form>

      );
    };

    return (
        renderizarSelectEspecialidade()
    );
  };

  //
  // PARTE LISTAGEM DE CONSULTAS
  //

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
  

    // Buscar os status disponíveis
  useEffect(() => {
    const fetchStatusConsulta = async () => {
      try {
        const response = await api.get("/consulta/status");
        console.log(response);
        setStatusDisponiveis(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar status:", error);
      }
    };
    
    if (opcaoConsulta === "ListarConsulta") {
      fetchStatusConsulta();
    }
  }, [opcaoConsulta]);

  // Buscar consultas com paginação e filtro
  const fetchConsultas = async (selectedStatus, page = 0) => {
    try {
      const response = await api.get(`/consulta/${selectedStatus}`, {
        params: { page: page, size: 10 } // aqui você define o tamanho da página
      });
  
      console.log("Resposta da API:", response.data);
  
      const consultasData = response.data.content || [];
      setConsultas(consultasData);
      setTotalPaginas(response.data.totalPages);
      setPaginaAtual(response.data.number); // mantém sincronizado com a API
  
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
      setConsultas([]);
    }
  };
  

  // Chamada inicial quando seleciona um status
  useEffect(() => {
    if (selectedStatus && opcaoConsulta === "ListarConsulta") {
      fetchConsultas(selectedStatus);
    }
  }, [selectedStatus, opcaoConsulta]);

  const cancelarConsulta = async (id) => {
    try {
      await api.delete(`/consulta/cancelar/${id}`);
      alert("Consulta cancelada com sucesso!");
      fetchConsultas(selectedStatus); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      alert("Erro ao cancelar consulta.");
    }
  };

  const abrirModalAtualizacao = async (consulta) => {
    setConsultaParaAtualizar(consulta);
    
    try {
      // Busca horários disponíveis para o médico da consulta
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
      // Encontra o horário selecionado
      const horarioSelecionado = horariosDisponiveisAtualizacao
        .find(h => h.id === selectedHorarioIdAtualizacao);
      
      if (!horarioSelecionado) {
        throw new Error("Horário selecionado não encontrado");
      }
  
      // Prepara os dados para a API
      const dadosAtualizacao = {
        idConsulta: consultaParaAtualizar.id,
        idHorario: selectedHorarioIdAtualizacao, // Envia o ID do horário, não a data
        novoHorarioConsulta: new Date(horarioSelecionado.horario).toISOString()
      };
  
      console.log("Dados sendo enviados:", dadosAtualizacao);
  
      await api.put(`/consulta/atualizar`, dadosAtualizacao);
      
      alert("Consulta atualizada com sucesso!");
      setConsultaParaAtualizar(null);
      fetchConsultas(selectedStatus);
    } catch (error) {
      console.error("Erro ao atualizar consulta:", error);
      alert(error.response?.data?.message || "Erro ao atualizar consulta.");
    }
  };


  // Processa as datas disponíveis para o DatePicker
  const datasDisponiveisAtualizacao = [
    ...new Set(horariosDisponiveisAtualizacao.map(h =>
      new Date(h.horario)
    ))
  ];

  const ListarConsultas = () => {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label>Filtrar por Status: </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px' }}
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
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Data</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Horário</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Médico</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => (
                  <tr key={consulta.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>
                      {new Date(consulta.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {new Date(consulta.data).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {consulta.dataDetalhesMedico.dataDetalhesPessoa.nome} (CRM: {consulta.dataDetalhesMedico.crm})
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        color: consulta.statusConsula === 'CANCELADA' ? 'red' : 
                               consulta.statusConsula === 'ABERTA' ? 'blue' : 
                               consulta.statusConsula === 'NAO_COMPARECIDA' ? 'yellow' :
                               consulta.statusConsula === 'CONCLUIDA' ? 'green' : 'inherit'
                      }}>
                        {consulta.statusConsula}
                      </span>
                      
                      {consulta.statusConsula === 'ABERTA' && (
                        <div style={{ marginTop: '8px' }}>
                          {/* Alterado para abrirModalAtualizacao */}
                          <button 
                            onClick={() => abrirModalAtualizacao(consulta)} 
                            style={{ marginRight: '8px' }}
                          >
                            Atualizar
                          </button>
                          <button onClick={() => cancelarConsulta(consulta.id)}>
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
          <p>Nenhuma consulta encontrada para o filtro selecionado.</p>
        )}

        {/* Modal de Atualização */}
        {consultaParaAtualizar && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '80%',
              maxWidth: '600px'
            }}>
              <h3>Atualizar Consulta</h3>
              <p>Médico: {consultaParaAtualizar.dataDetalhesMedico.dataDetalhesPessoa.nome}</p>
              
              <div style={{ marginTop: '20px' }}>
                <DatePicker
                  selected={dataSelecionadaAtualizacao}
                  onChange={(date) => {
                    setDataSelecionadaAtualizacao(date);
                    setSelectedHorarioIdAtualizacao(null);
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione uma data"
                  includeDates={datasDisponiveisAtualizacao}
                />
              </div>
  
              {dataSelecionadaAtualizacao && (
                <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
                            border: '1px solid',
                            borderColor: selectedHorarioIdAtualizacao === horario.id ? '#4CAF50' : '#ddd',
                            borderRadius: '4px',
                            padding: '8px',
                            cursor: 'pointer',
                            backgroundColor: selectedHorarioIdAtualizacao === horario.id ? '#e8f5e9' : 'white'
                          }}
                        >
                          {hora}
                        </div>
                      );
                    })}
                </div>
              )}
  
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => setConsultaParaAtualizar(null)}>
                  Cancelar
                </button>
                <button 
                  onClick={atualizarConsultaConfirmada}
                  disabled={!selectedHorarioIdAtualizacao}
                  style={{
                    backgroundColor: !selectedHorarioIdAtualizacao ? '#ccc' : '#4CAF50',
                    color: 'white'
                  }}
                >
                  Confirmar Atualização
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botoes pajinacao */}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 0))}
            disabled={paginaAtual === 0}
          >
            Anterior
          </button>

          <span>Página {paginaAtual + 1} de {totalPaginas}</span>

          <button 
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas - 1))}
            disabled={paginaAtual + 1 >= totalPaginas}
          >
            Próximo
          </button>
        </div>



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
        return <p>Selecione uma opção no menu para gerenciar suas consultas.</p>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Botoes no topo */}
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setOpcaoConsulta("MarcaConsulta")}>Marcar Consulta</button>
        <button onClick={() => setOpcaoConsulta("ListarConsulta")}>Listar Consultas</button>
        <button onClick={() => setOpcaoSelecionada("Dashboard")}>Voltar</button>
      </nav>

      {/* Conteudo dinamico da consulta */}
      <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Área de Consultas</h2>
        {renderizarConteudoConsulta()}
      </div>
    </div>
  );
};

const AtualizarDados = () => (
  <div>
    <h2>Atualizar Dados</h2>
    <p>Opção para atualizar os seus dados.</p>
  </div>
);

const CreditarSaldo = () => (
  <div>
    <h2>Creditar Saldo</h2>
    <p>Opção para adicionar saldo na conta.</p>
  </div>
);

const HistoricoDoencas = () => (
  <div>
    <h2>Histórico de Doenças</h2>
    <p>Lista de doenças registradas no sistema.</p>
  </div>
);

const HistoricoTransacoes = () => (
  <div>
    <h2>Histórico de Transações</h2>
    <p>Todas as transações realizadas.</p>
  </div>
);

const PadraoInicio = () => (
  <div>
    <h2>Opções</h2>
    <p>Escolha uma das opções ao lado.</p>
  </div>
);

const DashboardPaciente = () => {

  const [opcaoSelecionada, setOpcaoSelecionada] = useState("AtualizarDados");

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
        return <PadraoInicio />;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Menu lateral */}
      <nav style={{ width: "200px", borderRight: "1px solid #ccc", padding: "10px" }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><button onClick={() => setOpcaoSelecionada("Consulta")}>Consulta</button></li>
          <li><button onClick={() => setOpcaoSelecionada("AtualizarDados")}>Atualizar Dados</button></li>
          <li><button onClick={() => setOpcaoSelecionada("CreditarSaldo")}>Creditar Saldo</button></li>
          <li><button onClick={() => setOpcaoSelecionada("HistoricoDoencas")}>Histórico de Doenças</button></li>
          <li><button onClick={() => setOpcaoSelecionada("HistoricoTransacoes")}>Histórico de Transações</button></li>
        </ul>
      </nav>

      {/* Conteúdo dinâmico */}
      <div style={{ padding: "20px", flex: 1 }}>
        {renderizarConteudo()}
      </div>
    </div>
  );
};

export default DashboardPaciente;
