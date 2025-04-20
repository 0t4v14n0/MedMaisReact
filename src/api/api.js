import axios from "axios";

// Cria a instância do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
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

export default api;
