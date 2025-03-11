import { Link } from "react-router-dom";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles")) || []; // Recupera o array de roles
  const role = roles.length > 0 ? roles[0] : null; // Pega a primeira role

  return (
    <nav>
      <Link to="/">Home</Link>
      {!token && (
        <>
          {" | "}
          <Link to="/login">Login</Link>
          {" | "}
          <Link to="/cadastro">Cadastro</Link>
        </>
      )}

      {" | "}
      <Link to="/about">About</Link>

      {token && role === "ADMIN" && (
        <>
          {" | "}
          <Link to="/admin/dashboard">Admin</Link>
        </>
      )}

      {token && role === "PACIENTE" && (
        <>
          {" | "}
          <Link to="/paciente/dashboard">Paciente</Link>
        </>
      )}

      {token && role === "MEDICO" && (
        <>
          {" | "}
          <Link to="/medico/dashboard">Médico</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
