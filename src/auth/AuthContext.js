import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRoles = JSON.parse(localStorage.getItem("roles")) || [];

    if (token) {
      setUser({ token });
      setRoles(storedRoles);
    }
  }, []);

  const login = (token, userRoles) => {
    localStorage.setItem("token", token);
    localStorage.setItem("roles", JSON.stringify(userRoles));
    setUser({ token });
    setRoles(userRoles);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
