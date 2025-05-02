import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext"; // Importe o AuthProvider
import PrivateRoute from "./auth/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import DashboardMedico from "./pages/DashboardMedico";
import DashboardPaciente from "./pages/DashboardPaciente";
import DashboardAdmin from "./pages/DashboardAdmin";

function App() {
  
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/about" element={<About />} />

          {/* Rota do médico */}
          <Route element={<PrivateRoute allowedRoles={["MEDICO"]} />}>
            <Route path="/medico/dashboard" element={<DashboardMedico />} />
          </Route>

          {/* Rota do paciente */}
          <Route element={<PrivateRoute allowedRoles={["PACIENTE"]} />}>
            <Route path="/paciente/dashboard" element={<DashboardPaciente />} />
          </Route>

          {/* Rota do ADMIN */}
          <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
