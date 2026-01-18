import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext"; // Importe o ThemeProvider
import PrivateRoute from "./auth/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Recuperarsenha from "./pages/Recuperarsenha";
import ConfirmarEmail from "./pages/ConfirmarEmail";
import DashboardMedico from "./pages/DashboardMedico";
import DashboardPaciente from "./pages/DashboardPaciente";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardRecepcao from "./pages/DashboardRecepcao";
import DashboardLaboratorio from "./pages/DashboardLaboratorio";
import DashboardFuncionario from "./pages/DashboardFuncionario";
import ThemeToggle from "./components/ThemeToggle"; // Componente de alternância de tema
import { RoleProvider } from './contexts/RoleContext';
import DashboardFinanceiro from "./pages/DashboardFinanceiro";
import DashboardColeta from "./pages/DashboardColeta";
import DashboardProfessor from "./pages/DashboardProfessor";


function App() {
  return (
    <ThemeProvider> {/* Envolva tudo com o ThemeProvider */}
      <AuthProvider>
        <RoleProvider>
          <Router>
            <div className="app-container"> {/* Adicione esta div wrapper */}
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/recuperar-senha" element={<Recuperarsenha />} />
                <Route path="/recuperar-senha/:token" element={<Recuperarsenha />} />
                <Route path="/verificar-email" element={<ConfirmarEmail />} />

                {/* Rota do médico */}
                <Route element={<PrivateRoute allowedRoles={["MEDICO"]} />}>
                  <Route path="/medico/dashboard" element={<DashboardMedico />} />
                </Route>

                {/* Rota do paciente */}
                <Route element={<PrivateRoute allowedRoles={["PACIENTE"]} />}>
                  <Route path="/paciente/dashboard" element={<DashboardPaciente />} />
                </Route>

                {/* Rota do RECEPCAO */}
                <Route element={<PrivateRoute allowedRoles={["RECEPCAO"]} />}>
                  <Route path="/recepcao/dashboard" element={<DashboardRecepcao />} />
                </Route>

                {/* Rota do LABORATORIO */}
                <Route element={<PrivateRoute allowedRoles={["LABORATORIO"]} />}>
                  <Route path="/laboratorio/dashboard" element={<DashboardLaboratorio />} />
                </Route>

                {/* Rota do FINANCEIRO */}
                <Route element={<PrivateRoute allowedRoles={["FINANCEIRO"]} />}>
                  <Route path="/financeiro/dashboard" element={<DashboardFinanceiro />} />
                </Route>

                {/* Rota do ADMIN */}
                <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
                  <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                </Route>

                {/* Rota do FUNCIONARIO */}
                <Route element={<PrivateRoute allowedRoles={["FUNCIONARIO"]} />}>
                  <Route path="/funcionario/dashboard" element={<DashboardFuncionario />} />
                </Route>

                {/* Rota do COLETA */}
                <Route element={<PrivateRoute allowedRoles={["COLETA"]} />}>
                  <Route path="/coleta/dashboard" element={<DashboardColeta />} />
                </Route>

                {/* Rota do COLETA */}
                <Route element={<PrivateRoute allowedRoles={["PROFESSOR"]} />}>
                  <Route path="/professor/dashboard" element={<DashboardProfessor />} />
                </Route>


              </Routes>
              <ThemeToggle /> {/* Adicione o botão de alternância */}
            </div>
          </Router>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;