import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const DashboardAdmin = () => {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState("Consultas");

  const renderizarConteudo = () => {
    switch (opcaoSelecionada) {
      case "GerenciarPacientes":
        return <div>Componente GerenciarPacientes</div>; // Substitua pelo componente real
      case "GerenciarMedicos":
        return <div>Componente GerenciarMedicos</div>;
      case "GerenciarPlanos":
        return <div>Componente Configuracoes</div>;
      case "Consultas":
        return <div>Componente Consultas</div>;
      case "Relatorios":
        return <div>Componente Relatorios</div>;
      case "Configuracoes":
        return <div>Componente Configuracoes</div>;
      default:
        return (
          <div style={styles.card}>
            <h2 style={styles.title}>Bem-vindo ao Painel do Administrador</h2>
            <p style={{ color: '#7f8c8d' }}>
              Selecione uma das opções no menu ao lado para começar.
            </p>
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
              ...(opcaoSelecionada === "Consultas" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("Consultas")}
          >
            <span style={styles.sidebarIcon}>📅</span>
            Consultas
          </li>
          <li
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "GerenciarPacientes" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("GerenciarPacientes")}
          >
            <span style={styles.sidebarIcon}>👨‍⚕️</span>
            Gerenciar Pacientes
          </li>
          <li
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "GerenciarMedicos" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("GerenciarMedicos")}
          >
            <span style={styles.sidebarIcon}>🩺</span>
            Gerenciar Médicos
          </li>

          <li
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "GerenciarPlanos" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("GerenciarPlanos")}
          >
            <span style={styles.sidebarIcon}>📋</span>
            Gerenciar Planos
          </li>

          <li
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "Relatorios" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("Relatorios")}
          >
            <span style={styles.sidebarIcon}>📊</span>
            Relatórios
          </li>
          <li
            style={{
              ...styles.sidebarItem,
              ...(opcaoSelecionada === "Configuracoes" ? styles.sidebarItemHover : {})
            }}
            onClick={() => setOpcaoSelecionada("Configuracoes")}
          >
            <span style={styles.sidebarIcon}>⚙️</span>
            Configurações
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

export default DashboardAdmin;
