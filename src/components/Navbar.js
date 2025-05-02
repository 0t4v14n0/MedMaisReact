import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import UserProfile from "./UserProfile";

const Navbar = () => {
  const { user, roles } = useAuth();
  const role = roles.length > 0 ? roles[0] : null;

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.5rem 2rem",
      background: "#2c3e50",
      color: "white",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
    }}>
      {/* Parte esquerda - Logo e Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {/* Logo clicavel */}
        <Link to="/" style={{ 
          display: "flex", 
          alignItems: "center", 
          textDecoration: "none"
        }}>
          <img 
            src="/logo192.png" 
            alt="Logo MedMais" 
            style={{
              height: "40px",
              width: "40px",
              objectFit: "contain",
              marginRight: "10px"
            }}
          />
          <span style={{
            color: "white",
            fontWeight: "600",
            fontSize: "1.2rem",
            letterSpacing: "1px",
            fontFamily: "'Segoe UI', sans-serif",
            cursor: "pointer"
          }}>
            MED MAIS
          </span>
        </Link>
        
        {/* Links de navegacao */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          
          {user && role === "ADMIN" && (
            <Link to="/admin/dashboard" style={{ ...navLinkStyle, color: "#f39c12" }}>Admin</Link>
          )}

          {user && role === "PACIENTE" && (
            <Link to="/paciente/dashboard" style={{ ...navLinkStyle, color: "#2ecc71" }}>Paciente</Link>
          )}

          {user && role === "MEDICO" && (
            <Link to="/medico/dashboard" style={{ ...navLinkStyle, color: "#3498db" }}>Médico</Link>
          )}
        </div>
      </div>

      {/* Parte direita - Login/Cadastro ou Perfil */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {!user ? (
          <>
            <Link to="/login" style={buttonStyle}>Login</Link>
            <Link to="/cadastro" style={{ ...buttonStyle, background: "#28a745" }}>Cadastro</Link>
          </>
        ) : (
          <UserProfile />
        )}
      </div>
    </nav>
  );
};

// Estilos reutilizáveis
const navLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500",
  transition: "color 0.3s",
  ":hover": {
    color: "#ecf0f1"
  }
};

const buttonStyle = {
  color: "white",
  textDecoration: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  background: "#007bff",
  transition: "all 0.3s",
  fontWeight: "500",
  ":hover": {
    opacity: "0.9"
  }
};

export default Navbar;