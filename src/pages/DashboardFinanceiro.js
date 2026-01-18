import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { generateStyles } from '../styles/globalStyles';
import { FiMenu, FiX, FiDollarSign, FiTrendingUp, FiPieChart, FiCreditCard, FiBarChart2, FiUsers, FiCalendar } from 'react-icons/fi';

const DashboardFinanceiro = () => {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('ResumoFinanceiro');
  const [menuAberto, setMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Desestrutura os estilos e cores corretamente
  const { colors, app } = generateStyles(isDarkMode) || {};
  
  // Fallback seguro para cores
  const safeColors = colors || {
    textMuted: '#6c757d',
    primary: '#00C7B4',
    textLight: '#ffffff',
    primaryDark: '#009688',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107'
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuAberto(true);
      } else {
        setMenuAberto(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderizarConteudo = () => {
    switch (opcaoSelecionada) {
      case "ResumoFinanceiro":
        return <ResumoFinanceiro colors={safeColors} app={app} />;
      case "FluxoCaixa":
        return <FluxoCaixa colors={safeColors} app={app} />;
      case "Faturamento":
        return <Faturamento colors={safeColors} app={app} />;
      case "Despesas":
        return <Despesas colors={safeColors} app={app} />;
      case "Relatorios":
        return <Relatorios colors={safeColors} app={app} />;
      case "Pagamentos":
        return <Pagamentos colors={safeColors} app={app} />;
      default:
        return (
          <div style={app?.card || {}}>
            <h2 style={app?.title || {}}>Bem-vindo ao Painel Financeiro</h2>
            <p style={{ color: safeColors.textMuted }}>
              Selecione uma das opções no menu para acessar as ferramentas financeiras.
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    { key: "ResumoFinanceiro", label: "Resumo Financeiro", icon: <FiBarChart2 /> },
    { key: "FluxoCaixa", label: "Fluxo de Caixa", icon: <FiTrendingUp /> },
    { key: "Faturamento", label: "Faturamento", icon: <FiDollarSign /> },
    { key: "Despesas", label: "Controle de Despesas", icon: <FiCreditCard /> },
    { key: "Relatorios", label: "Relatórios", icon: <FiPieChart /> },
    { key: "Pagamentos", label: "Pagamentos", icon: <FiUsers /> },
  ];

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <div style={app?.container || {}}>
      {/* Botão do menu hambúrguer */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: '180px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={toggleMenu}
            style={{
              background: safeColors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          >
            {menuAberto ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      )}

      {/* Barra lateral */}
      <nav style={{
        ...app?.sidebar,
        width: isMobile ? (menuAberto ? '250px' : '0') : '250px',
        transform: isMobile ? (menuAberto ? 'translateX(0)' : 'translateX(-250px)') : 'none',
        transition: 'all 0.3s ease',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 999,
        height: isMobile ? '100vh' : 'auto',
        top: isMobile ? '0' : 'auto',
        paddingTop: isMobile ? '70px' : '0'
      }}>

        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          borderBottom: `1px solid ${safeColors.primaryDark}`,
          display: menuAberto ? 'block' : 'none'
        }}>
          <h2 style={{ margin: 0, color: safeColors.textLight }}>MedMais</h2>
          <span style={{ fontSize: '14px', color: safeColors.textLight, opacity: 0.8 }}>Portal Financeiro</span>
        </div>

        <ul style={app?.sidebarList || {}}>
          {menuItems.map(item => (
            <li 
              key={item.key}
              style={{
                ...app?.sidebarItem,
                ...(opcaoSelecionada === item.key ? app?.sidebarItemHover : {}),
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px'
              }}
              onClick={() => {
                setOpcaoSelecionada(item.key);
                if (isMobile) setMenuAberto(false);
              }}
            >
              <span style={{ ...app?.sidebarIcon, marginRight: '10px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Conteúdo principal */}
      <div style={{
        ...app?.content,
        marginLeft: isMobile ? '0' : '0px',
        paddingTop: isMobile ? '5%' : '1%',
        transition: 'margin-left 0.3s ease',
        padding: '20px'
      }}>
        {renderizarConteudo()}
      </div>
    </div>
  );
};

// Componentes para cada seção do dashboard
const ResumoFinanceiro = ({ colors, app }) => {
  return (
    <div>
      <h2 style={app?.title || {}}>Resumo Financeiro</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div style={{...app?.card, flex: '1', minWidth: '250px'}}>
          <h3 style={{color: colors.primary, marginBottom: '10px'}}>Faturamento Mensal</h3>
          <p style={{fontSize: '24px', fontWeight: 'bold', color: colors.success}}>R$ 187.650,00</p>
          <p style={{color: colors.textMuted, fontSize: '14px'}}>+12% em relação ao mês anterior</p>
        </div>
        
        <div style={{...app?.card, flex: '1', minWidth: '250px'}}>
          <h3 style={{color: colors.primary, marginBottom: '10px'}}>Despesas</h3>
          <p style={{fontSize: '24px', fontWeight: 'bold', color: colors.danger}}>R$ 92.340,00</p>
          <p style={{color: colors.textMuted, fontSize: '14px'}}>-5% em relação ao mês anterior</p>
        </div>
        
        <div style={{...app?.card, flex: '1', minWidth: '250px'}}>
          <h3 style={{color: colors.primary, marginBottom: '10px'}}>Lucro Líquido</h3>
          <p style={{fontSize: '24px', fontWeight: 'bold', color: colors.success}}>R$ 95.310,00</p>
          <p style={{color: colors.textMuted, fontSize: '14px'}}>Margem de 50.8%</p>
        </div>
      </div>
      
      <div style={app?.card}>
        <h3 style={{color: colors.primary, marginBottom: '15px'}}>Metas do Mês</h3>
        <div style={{marginBottom: '15px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
            <span>Faturamento</span>
            <span>85%</span>
          </div>
          <div style={{height: '10px', backgroundColor: '#e9ecef', borderRadius: '5px'}}>
            <div style={{height: '100%', width: '85%', backgroundColor: colors.success, borderRadius: '5px'}}></div>
          </div>
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
            <span>Redução de Despesas</span>
            <span>70%</span>
          </div>
          <div style={{height: '10px', backgroundColor: '#e9ecef', borderRadius: '5px'}}>
            <div style={{height: '100%', width: '70%', backgroundColor: colors.primary, borderRadius: '5px'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FluxoCaixa = ({ colors, app }) => {
  return (
    <div>
      <h2 style={app?.title || {}}>Fluxo de Caixa</h2>
      
      <div style={{...app?.card, marginBottom: '20px'}}>
        <h3 style={{color: colors.primary, marginBottom: '15px'}}>Previsão para os Próximos 30 Dias</h3>
        
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
          <div style={{flex: '1', minWidth: '200px'}}>
            <h4 style={{marginBottom: '10px'}}>Entradas Previstas</h4>
            <p style={{fontSize: '20px', fontWeight: 'bold', color: colors.success}}>R$ 210.450,00</p>
          </div>
          
          <div style={{flex: '1', minWidth: '200px'}}>
            <h4 style={{marginBottom: '10px'}}>Saídas Previstas</h4>
            <p style={{fontSize: '20px', fontWeight: 'bold', color: colors.danger}}>R$ 125.780,00</p>
          </div>
          
          <div style={{flex: '1', minWidth: '200px'}}>
            <h4 style={{marginBottom: '10px'}}>Saldo Projetado</h4>
            <p style={{fontSize: '20px', fontWeight: 'bold', color: colors.success}}>R$ 84.670,00</p>
          </div>
        </div>
      </div>
      
      <div style={app?.card}>
        <h3 style={{color: colors.primary, marginBottom: '15px'}}>Histórico de Fluxo de Caixa</h3>
        <div style={{height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px', padding: '10px'}}>
          {[60, 45, 75, 50, 80, 65, 90].map((height, index) => (
            <div key={index} style={{flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: '100%', height: `${height}%`, backgroundColor: colors.primary, borderRadius: '5px 5px 0 0'}}></div>
              <span style={{fontSize: '12px', marginTop: '5px'}}>Mês {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Faturamento = ({ colors, app }) => {
  return (
    <div>
      <h2 style={app?.title || {}}>Faturamento</h2>
      
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px'}}>
        <div style={{...app?.card, flex: '2', minWidth: '300px'}}>
          <h3 style={{color: colors.primary, marginBottom: '15px'}}>Faturamento por Especialidade</h3>
          <ul style={{listStyle: 'none', padding: 0}}>
            {[
              { especialidade: 'Cardiologia', valor: 'R$ 42.500,00', percentual: '22.6%' },
              { especialidade: 'Ortopedia', valor: 'R$ 38.750,00', percentual: '20.6%' },
              { especialidade: 'Pediatria', valor: 'R$ 35.200,00', percentual: '18.7%' },
              { especialidade: 'Dermatologia', valor: 'R$ 28.900,00', percentual: '15.4%' },
              { especialidade: 'Outras', valor: 'R$ 42.300,00', percentual: '22.5%' },
            ].map((item, index) => (
              <li key={index} style={{padding: '10px 0', borderBottom: '1px solid #eee'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>{item.especialidade}</span>
                  <span style={{fontWeight: 'bold'}}>{item.valor}</span>
                </div>
                <div style={{height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', marginTop: '5px'}}>
                  <div style={{height: '100%', width: item.percentual, backgroundColor: colors.primary, borderRadius: '4px'}}></div>
                </div>
                <div style={{textAlign: 'right', fontSize: '12px', color: colors.textMuted, marginTop: '3px'}}>
                  {item.percentual}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div style={{...app?.card, flex: '1', minWidth: '250px'}}>
          <h3 style={{color: colors.primary, marginBottom: '15px'}}>Faturamento por Forma de Pagamento</h3>
          <div style={{width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>
            Gráfico de Pizza
          </div>
          <div style={{marginTop: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
              <div style={{width: '15px', height: '15px', backgroundColor: colors.success, marginRight: '10px'}}></div>
              <span>Cartão de Crédito (45%)</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
              <div style={{width: '15px', height: '15px', backgroundColor: colors.primary, marginRight: '10px'}}></div>
              <span>Convênios (30%)</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
              <div style={{width: '15px', height: '15px', backgroundColor: colors.warning, marginRight: '10px'}}></div>
              <span>Dinheiro/PIX (25%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Despesas = ({ colors, app }) => {
  return (
    <div>
      <h2 style={app?.title || {}}>Controle de Despesas</h2>
      
      <div style={{...app?.card, marginBottom: '20px'}}>
        <h3 style={{color: colors.primary, marginBottom: '15px'}}>Despesas por Categoria</h3>
        
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
          {[
            { categoria: 'Folha de Pagamento', valor: 'R$ 52.340,00', percentual: '56.7%' },
            { categoria: 'Fornecedores', valor: 'R$ 18.650,00', percentual: '20.2%' },
            { categoria: 'Aluguel e Utilidades', valor: 'R$ 12.500,00', percentual: '13.5%' },
            { categoria: 'Equipamentos', valor: 'R$ 5.850,00', percentual: '6.3%' },
            { categoria: 'Outros', valor: 'R$ 3.000,00', percentual: '3.3%' },
          ].map((item, index) => (
            <div key={index} style={{flex: '1', minWidth: '180px', padding: '15px', border: `1px solid ${colors.primary}`, borderRadius: '8px'}}>
              <h4 style={{margin: '0 0 10px 0', color: colors.primary}}>{item.categoria}</h4>
              <p style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0'}}>{item.valor}</p>
              <p style={{color: colors.textMuted, margin: 0}}>{item.percentual}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div style={app?.card}>
        <h3 style={{color: colors.primary, marginBottom: '15px'}}>Evolução das Despesas</h3>
        <div style={{height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px', padding: '10px'}}>
          {[80, 75, 85, 70, 65, 90, 75].map((height, index) => (
            <div key={index} style={{flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: '100%', height: `${height}%`, backgroundColor: colors.danger, borderRadius: '5px 5px 0 0'}}></div>
              <span style={{fontSize: '12px', marginTop: '5px'}}>Mês {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Relatorios = ({ colors, app }) => {
  return (
    <div>
      <h2 style={app?.title || {}}>Relatórios Financeiros</h2>
      
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px'}}>
        <div style={{...app?.card, flex: '1', minWidth: '250px'}}>
          <h3 style={{color: colors.primary, marginBottom: '15px'}}>Relatórios Disponíveis</h3>
          <ul style={{listStyle: 'none', padding: 0}}>
            {[
              'Demonstrativo de Resultados',
              'Balanço Patrimonial',
              'Fluxo de Caixa Detalhado',
              'Relatório de Contas a Receber',
              'Relatório de Contas a Pagar',
              'Análise de Rentabilidade'
            ].map((item, index) => (
              <li key={index} style={{padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>{item}</span>
                <button style={{padding: '5px 10px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Gerar
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div style={{...app?.card, flex: '1', minWidth: '250px'}}>
          <h3 style={{color: colors.primary, marginBottom: '15px'}}>Exportar Dados</h3>
          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px'}}>Selecionar Período</label>
            <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
              <input type="date" style={{flex: '1', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}} />
              <span>até</span>
              <input type="date" style={{flex: '1', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}} />
            </div>
          </div>
          
          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px'}}>Formato</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <button style={{flex: '1', padding: '8px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}}>Excel</button>
              <button style={{flex: '1', padding: '8px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}}>PDF</button>
              <button style={{flex: '1', padding: '8px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}}>CSV</button>
            </div>
          </div>
          
          <button style={{width: '100%', padding: '10px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            Exportar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

const Pagamentos = ({ colors, app }) => {
  return (
    <div>
      <h2 style={app?.title || {}}>Controle de Pagamentos</h2>
      
      <div style={{...app?.card, marginBottom: '20px'}}>
        <h3 style={{color: colors.primary, marginBottom: '15px'}}>Pagamentos Pendentes</h3>
        
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: `2px solid ${colors.primary}`}}>
                <th style={{textAlign: 'left', padding: '10px'}}>Fornecedor</th>
                <th style={{textAlign: 'left', padding: '10px'}}>Valor</th>
                <th style={{textAlign: 'left', padding: '10px'}}>Vencimento</th>
                <th style={{textAlign: 'left', padding: '10px'}}>Status</th>
                <th style={{textAlign: 'left', padding: '10px'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                { fornecedor: 'Lab. Diagnóstico Avançado', valor: 'R$ 8.520,00', vencimento: '15/08/2023', status: 'Pendente' },
                { fornecedor: 'Farmacia Central', valor: 'R$ 3.450,00', vencimento: '18/08/2023', status: 'Pendente' },
                { fornecedor: 'Mega Equipamentos Médicos', valor: 'R$ 12.800,00', vencimento: '20/08/2023', status: 'Agendado' },
                { fornecedor: 'Limpeza Profissional', valor: 'R$ 2.300,00', vencimento: '22/08/2023', status: 'Pendente' },
              ].map((item, index) => (
                <tr key={index} style={{borderBottom: '1px solid #eee'}}>
                  <td style={{padding: '10px'}}>{item.fornecedor}</td>
                  <td style={{padding: '10px', fontWeight: 'bold'}}>{item.valor}</td>
                  <td style={{padding: '10px'}}>{item.vencimento}</td>
                  <td style={{padding: '10px'}}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: item.status === 'Pendente' ? '#fff3cd' : '#d4edda',
                      color: item.status === 'Pendente' ? '#856404' : '#155724'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{padding: '10px'}}>
                    <button style={{
                      padding: '5px 10px',
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}>
                      Pagar
                    </button>
                    <button style={{
                      padding: '5px 10px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={app?.card}>
        <h3 style={{color: colors.primary, marginBottom: '15px'}}>Agendar Pagamento</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <div>
            <label style={{display: 'block', marginBottom: '5px'}}>Fornecedor</label>
            <select style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}>
              <option>Selecione um fornecedor</option>
              <option>Lab. Diagnóstico Avançado</option>
              <option>Farmacia Central</option>
              <option>Mega Equipamentos Médicos</option>
            </select>
          </div>
          
          <div>
            <label style={{display: 'block', marginBottom: '5px'}}>Valor</label>
            <input type="text" placeholder="R$ 0,00" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}} />
          </div>
          
          <div>
            <label style={{display: 'block', marginBottom: '5px'}}>Data de Vencimento</label>
            <input type="date" style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}} />
          </div>
        </div>
        
        <button style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Agendar Pagamento
        </button>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;