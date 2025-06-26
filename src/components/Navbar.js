import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import UserProfile from "./UserProfile";

const Navbar = () => {
  const { user, roles } = useAuth();
  const role = roles.length > 0 ? roles[0] : null;

  return (
    <nav style={{
      background: "#fff",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      padding: "0.5rem 1rem"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap"
      }}>
        {/* ESQUERDA */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img 
              src="/MEDMAIS-PNG-1.png" 
              alt="Logo MedMais" 
              style={{ height: "75px", objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* MEIO */}
        <div style={{ 
          flex: 1,
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          flexWrap: "wrap"
        }}>
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

        {/* DIREITA */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {!user ? (
            <>
              <Link to="/login" style={{ ...buttonStyle, background: "rgb(35, 57, 117)" }}>Login</Link>
              <Link to="/cadastro" style={{ ...buttonStyle, background: "#00C7B4" }}>Cadastro</Link>
            </>
          ) : (
            <UserProfile />
          )}
        </div>
      </div>
    </nav>
  );
};

// Estilos reutilizáveis
const navLinkStyle = {
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "1rem",
  color: "#333"
};

const buttonStyle = {
  color: "white",
  textDecoration: "none",
  padding: "0.4rem 0.8rem",
  borderRadius: "4px",
  fontWeight: "500",
  whiteSpace: "nowrap"
};

export default Navbar;