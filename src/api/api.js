import axios from "axios";

// Cria a instância do axios
const urlBase = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: urlBase,
});

const publicRoutes = ["/pessoa/login", "/pessoa/registro", "/medico/especialidade"];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const url = new URL(config.url, config.baseURL);
  const path = url.pathname;

  const isPublic = publicRoutes.some((route) => path.startsWith(route));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de resposta para erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    
    // Verifica se a resposta de erro existe e se o status é 401 ou 403
    if (response && (response.status === 401 || response.status === 403)) {
        
        // CONDIÇÃO IMPORTANTE: Só redireciona se o erro NÃO veio da página de login.
        if (config.url !== '/pessoa/login') {
            
            // Lógica correta para quando a sessão expira noutra página
            console.log("Sessão expirada ou acesso negado. A redirecionar...");
            localStorage.removeItem("token"); 
            // O seu useAuth() deve cuidar de limpar o estado
            window.location.href = "/login"; 
        }
    }

    // Passa o erro para a frente para que o 'catch' do componente original (Login) o possa tratar.
    return Promise.reject(error);
  }
);

export default api;
