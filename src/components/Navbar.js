import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // Importe o hook de autenticação

const Navbar = () => {
  const { user, roles, logout } = useAuth(); // Pegando o estado do usuário e a função de logout

  const role = roles.length > 0 ? roles[0] : null; // Pega a primeira role

  return (
    <nav>
      <Link to="/">Home</Link>
      {!user && (
        <>
          {" | "}
          <Link to="/login">Login</Link>
          {" | "}
          <Link to="/cadastro">Cadastro</Link>
        </>
      )}

      {" | "}
      <Link to="/about">About</Link>

      {user && role === "ADMIN" && (
        <>
          {" | "}
          <Link to="/admin/dashboard">Admin</Link>
        </>
      )}

      {user && role === "PACIENTE" && (
        <>
          {" | "}
          <Link to="/paciente/dashboard">Paciente</Link>
        </>
      )}

      {user && role === "MEDICO" && (
        <>
          {" | "}
          <Link to="/medico/dashboard">Médico</Link>
        </>
      )}

      {user && (
        <>
          {" | "}
          <button onClick={logout}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
