import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/api";

const Consulta = ({ setOpcaoSelecionada }) => {

  const [opcaoConsulta, setOpcaoConsulta] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState("");
  
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

  const FormularioConsulta = ({ onSubmit }) => {

    const renderizarSelectEspecialidade = () => {
      return (

        <form onSubmit={onSubmit}>
          <label>Escolha uma Especialidade:</label>
          <select
            value={selectedEspecialidade}
            onChange={(e) => setSelectedEspecialidade(e.target.value)}
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
                      className={`medico-card ${selectedMedico === medico.crm ? 'selecionado' : ''}`}
                      onClick={() => setSelectedMedico(medico.crm)}
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
                    </div>
                  ))
                ) : (
                  <p>Carregando médicos...</p>
                )}
              </div>
            </div>
          )}

          <button type="submit">Marcar Consulta</button>
        </form>

      );
    };

    return (
        renderizarSelectEspecialidade()
    );
  };

  const renderizarConteudoConsulta = () => {
    switch (opcaoConsulta) {
      case "MarcaConsulta":
        return <FormularioConsulta onSubmit={() => alert("Consulta marcada!")} />;
      case "AtualizarConsulta":
        return <p>Opção para atualizar consultas já marcadas.</p>;
      case "CancelarConsulta":
        return <p>Opção para cancelar uma consulta existente.</p>;
      case "ListarConsulta":
        return <p>Lista com todas as consultas agendadas.</p>;
      default:
        return <p>Selecione uma opção no menu para gerenciar suas consultas.</p>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Botões no topo */}
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setOpcaoConsulta("MarcaConsulta")}>Marcar Consulta</button>
        <button onClick={() => setOpcaoConsulta("AtualizarConsulta")}>Atualizar Consulta</button>
        <button onClick={() => setOpcaoConsulta("CancelarConsulta")}>Cancelar Consulta</button>
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
