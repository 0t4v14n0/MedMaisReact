import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import { FiDownload, FiEye, FiCalendar, FiArrowLeft } from 'react-icons/fi';

const MeusContracheques = () => {
  const [contracheques, setContracheques] = useState([]);
  const [contrachequeSelecionado, setContrachequeSelecionado] = useState(null);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { isDarkMode } = useTheme();
  
  const { colors, app } = generateStyles(isDarkMode) || {};
  
  const safeColors = colors || {
    textMuted: '#6c757d',
    primary: '#00C7B4',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };

  // Buscar contracheques da API
  useEffect(() => {
    const fetchContracheques = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        // Obter token de autenticação (ajuste conforme sua implementação)
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const response = await fetch(`/api/funcionario/contracheque/${anoFiltro}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const dados = await response.json();
        setContracheques(dados.contracheques || []);
        setCarregando(false);
      } catch (error) {
        console.error('Erro ao buscar contracheques:', error);
        setErro(error.message);
        setCarregando(false);
      }
    };

    fetchContracheques();
  }, [anoFiltro]); // Recarregar quando o ano do filtro mudar

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const getNomeMes = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { month: 'long' });
  };

  const handleVisualizarContracheque = (contracheque) => {
    setContrachequeSelecionado(contracheque);
  };

  const handleFecharDetalhes = () => {
    setContrachequeSelecionado(null);
  };

  const handleDownload = async (contracheque) => {
    try {
      // Obter token de autenticação
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      const response = await fetch(`/api/funcionario/contracheque/download/${contracheque.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      // Criar blob do PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `contracheque-${getNomeMes(contracheque.mes_ano_referencia)}-${new Date(contracheque.mes_ano_referencia).getFullYear()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erro ao baixar contracheque:', error);
      alert('Erro ao baixar o contracheque. Tente novamente.');
    }
  };

  // Gerar opções de anos (dos últimos 5 anos até o ano atual)
  const gerarOpcoesAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    
    for (let i = 0; i < 5; i++) {
      anos.push(anoAtual - i);
    }
    
    return anos;
  };

  if (carregando && contracheques.length === 0) {
    return (
      <div style={app?.card || {}}>
        <p>Carregando contracheques...</p>
      </div>
    );
  }

  if (erro && contracheques.length === 0) {
    return (
      <div style={app?.card || {}}>
        <div style={{ color: safeColors.danger, padding: '20px', textAlign: 'center' }}>
          <h3>Erro ao carregar contracheques</h3>
          <p>{erro}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: safeColors.primary,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (contrachequeSelecionado) {
    return (
      <div style={app?.card || {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={app?.title || {}}>
            Contracheque - {getNomeMes(contrachequeSelecionado.mes_ano_referencia)}/{new Date(contrachequeSelecionado.mes_ano_referencia).getFullYear()}
          </h2>
          <button 
            onClick={handleFecharDetalhes}
            style={{
              background: 'transparent',
              color: safeColors.primary,
              border: `1px solid ${safeColors.primary}`,
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiArrowLeft /> Voltar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ ...app?.card, padding: '15px', margin: 0 }}>
            <h3 style={{ marginTop: 0, color: safeColors.primary }}>Proventos</h3>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Salário Bruto:</span>
                <strong>{formatarMoeda(contrachequeSelecionado.salario_bruto)}</strong>
              </div>
            </div>
            
            {contrachequeSelecionado.proventos_adicionais && contrachequeSelecionado.proventos_adicionais.map((provento, index) => (
              <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{provento.descricao}:</span>
                  <strong style={{ color: safeColors.success }}>{formatarMoeda(provento.valor)}</strong>
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '2px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total de Proventos:</span>
                <strong>
                  {formatarMoeda(
                    contrachequeSelecionado.salario_bruto + 
                    (contrachequeSelecionado.proventos_adicionais ? 
                      contrachequeSelecionado.proventos_adicionais.reduce((total, provento) => total + provento.valor, 0) : 0)
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ ...app?.card, padding: '15px', margin: 0 }}>
            <h3 style={{ marginTop: 0, color: safeColors.primary }}>Descontos</h3>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>INSS:</span>
                <strong style={{ color: safeColors.danger }}>{formatarMoeda(contrachequeSelecionado.inss)}</strong>
              </div>
            </div>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IRRF:</span>
                <strong style={{ color: safeColors.danger }}>{formatarMoeda(contrachequeSelecionado.irrf)}</strong>
              </div>
            </div>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vale Transporte:</span>
                <strong style={{ color: safeColors.danger }}>{formatarMoeda(contrachequeSelecionado.vale_transporte)}</strong>
              </div>
            </div>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Plano de Saúde:</span>
                <strong style={{ color: safeColors.danger }}>{formatarMoeda(contrachequeSelecionado.plano_saude)}</strong>
              </div>
            </div>
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Outros Descontos:</span>
                <strong style={{ color: safeColors.danger }}>{formatarMoeda(contrachequeSelecionado.outros_descontos)}</strong>
              </div>
            </div>
            
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '2px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total de Descontos:</span>
                <strong style={{ color: safeColors.danger }}>
                  {formatarMoeda(
                    contrachequeSelecionado.inss +
                    contrachequeSelecionado.irrf +
                    contrachequeSelecionado.vale_transporte +
                    contrachequeSelecionado.plano_saude +
                    contrachequeSelecionado.outros_descontos
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...app?.card, padding: '15px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: safeColors.primary }}>Benefícios</h3>
          {contrachequeSelecionado.beneficios && contrachequeSelecionado.beneficios.length > 0 ? (
            contrachequeSelecionado.beneficios.map((beneficio, index) => (
              <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{beneficio.descricao}:</span>
                  <strong style={{ color: safeColors.success }}>{formatarMoeda(beneficio.valor)}</strong>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: safeColors.textMuted }}>Nenhum benefício registrado.</p>
          )}
        </div>

        <div style={{ ...app?.card, padding: '15px', background: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: safeColors.primary }}>Salário Líquido</h3>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: safeColors.success }}>
              {formatarMoeda(contrachequeSelecionado.salario_liquido)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button 
            onClick={() => handleDownload(contrachequeSelecionado)}
            style={{
              background: safeColors.success,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiDownload /> Baixar PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={app?.container || {}}>
      <div style={app?.card || {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={app?.title || {}}>Meus Contracheques</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCalendar style={{ color: safeColors.primary }} />
            <select 
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(parseInt(e.target.value))}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${safeColors.primary}`,
                background: isDarkMode ? '#333' : 'white',
                color: isDarkMode ? 'white' : 'black'
              }}
            >
              {gerarOpcoesAnos().map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
        </div>

        {erro && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            backgroundColor: '#ffebee', 
            color: safeColors.danger,
            borderRadius: '4px'
          }}>
            {erro}
          </div>
        )}

        {contracheques.length === 0 ? (
          <p>Nenhum contracheque disponível para {anoFiltro}.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${safeColors.primary}` }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Mês/Ano</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Salário Bruto</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Descontos</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Salário Líquido</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contracheques.map((contracheque) => (
                  <tr key={contracheque.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      {getNomeMes(contracheque.mes_ano_referencia)}/{new Date(contracheque.mes_ano_referencia).getFullYear()}
                    </td>
                    <td style={{ padding: '12px' }}>{formatarMoeda(contracheque.salario_bruto)}</td>
                    <td style={{ padding: '12px' }}>
                      {formatarMoeda(
                        contracheque.inss +
                        contracheque.irrf +
                        contracheque.vale_transporte +
                        contracheque.plano_saude +
                        contracheque.outros_descontos
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{formatarMoeda(contracheque.salario_liquido)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        backgroundColor: contracheque.status === 'disponivel' ? '#d4edda' : '#fff3cd',
                        color: contracheque.status === 'disponivel' ? '#155724' : '#856404'
                      }}>
                        {contracheque.status === 'disponivel' ? 'Disponível' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleVisualizarContracheque(contracheque)}
                          style={{
                            background: safeColors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FiEye /> Visualizar
                        </button>
                        <button
                          onClick={() => handleDownload(contracheque)}
                          disabled={contracheque.status !== 'disponivel'}
                          style={{
                            background: contracheque.status === 'disponivel' ? safeColors.success : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: contracheque.status === 'disponivel' ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FiDownload /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {carregando && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Carregando...</p>
          </div>
        )}

        <div style={{ marginTop: '30px', ...app?.card, padding: '15px' }}>
          <h3 style={{ marginTop: 0, color: safeColors.primary }}>Resumo Anual - {anoFiltro}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', border: `1px solid ${safeColors.primary}`, borderRadius: '4px' }}>
              <div style={{ fontSize: '0.9rem', color: safeColors.textMuted }}>Total Bruto</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: safeColors.primary }}>
                {formatarMoeda(contracheques.reduce((total, c) => total + c.salario_bruto, 0))}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', border: `1px solid ${safeColors.primary}`, borderRadius: '4px' }}>
              <div style={{ fontSize: '0.9rem', color: safeColors.textMuted }}>Total Líquido</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: safeColors.success }}>
                {formatarMoeda(contracheques.reduce((total, c) => total + c.salario_liquido, 0))}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', border: `1px solid ${safeColors.primary}`, borderRadius: '4px' }}>
              <div style={{ fontSize: '0.9rem', color: safeColors.textMuted }}>Média Mensal</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: safeColors.info }}>
                {formatarMoeda(contracheques.reduce((total, c) => total + c.salario_liquido, 0) / contracheques.length)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeusContracheques;