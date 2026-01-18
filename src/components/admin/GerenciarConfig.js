import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';

// Importe os componentes
import Cargo from './config/Cargo';
import Especialidade from './config/Especialidade';
import Role from './config/GerenciarRoles';
import Unidade from './config/Unidade';
import Sala from './config/Sala';
import RegrasCalculo from './config/RegrasCalculo';
import Aula from './config/Aula';
import Turma from './config/Turma';

const GerenciarConfig = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;

    const [activeTab, setActiveTab] = useState('cargos');

    const tabs = {
        cargos: { nome: 'Cargos', Componente: Cargo },
        especialidades: { nome: 'Especialidades', Componente: Especialidade },
        roles: { nome: 'Permissões', Componente: Role },
        unidade: { nome: 'Unidades', Componente: Unidade },
        sala: { nome: 'Salas', Componente: Sala },
        regrasCalculo: { nome: 'Cálculos', Componente: RegrasCalculo },
        aulas: { nome: 'Aulas', Componente: Aula },
        turmas: { nome: 'Turmas', Componente: Turma }
    };

    const ActiveComponent = tabs[activeTab]?.Componente;

    return (
        <div style={styles.app.card}>
            <header>
                <h2 style={styles.app.title}>Configurações do Sistema</h2>
                <p style={{ color: colors.text_secondary }}>
                    Gerencie as configurações do sistema
                </p>
            </header>

            <nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {Object.keys(tabs).map(key => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            background: activeTab === key ? colors.primary : colors.background_secondary,
                            color: activeTab === key ? 'white' : colors.text_secondary,
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        {tabs[key].nome}
                    </button>
                ))}
            </nav>

            <main>
                {ActiveComponent && React.createElement(ActiveComponent)}
            </main>
        </div>
    );
};

export default GerenciarConfig;