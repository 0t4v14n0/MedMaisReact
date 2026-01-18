// src/contexts/RoleContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { roles } = useAuth();
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    if (roles && roles.length > 0) {
      // A lógica de prioridade para definir a role ativa está ótima.
      if (roles.includes('ADMIN')) {
        setActiveRole('ADMIN');
      } else if (roles.includes('MEDICO')) { // Adicionei prioridades, se desejar
        setActiveRole('MEDICO');
      } else if (roles.includes('FUNCIONARIO')) {
        setActiveRole('FUNCIONARIO');
      } else {
        setActiveRole(roles[0]); // Como último recurso, pega a primeira
      }
    } else {
      setActiveRole(null);
    }
  // ✨ A MUDANÇA CRÍTICA ESTÁ AQUI ✨
  // O useEffect agora só vai rodar quando o CONTEÚDO de 'roles' mudar,
  // quebrando o loop infinito.
  }, [JSON.stringify(roles)]);

  const value = { activeRole, setActiveRole };

return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => useContext(RoleContext);