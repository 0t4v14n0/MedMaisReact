import axios from "axios";

// Cria a instância do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

const publicRoutes = ["/pessoa/login", "/pessoa/registro", "/medico/especialidade"];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !publicRoutes.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
