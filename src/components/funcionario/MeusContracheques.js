import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import { FiDownload, FiEye, FiCalendar, FiRefreshCw, FiAlertTriangle, FiPlus, FiMinus } from 'react-icons/fi';
import api from '../../api/api';

const MeusContracheques = () => {
  const [contracheques, setContracheques] = useState([]);
  const [resumoAnual, setResumoAnual] = useState(null);
  const [contrachequeSelecionado, setContrachequeSelecionado] = useState(null);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [detalhesExpandidos, setDetalhesExpandidos] = useState({});
  const { isDarkMode } = useTheme();

  // ✅ PROTEÇÃO: Garante que `styles` e `colors` nunca sejam nulos
  const styles = generateStyles(isDarkMode) || { colors: {}, app: {} };
  const { colors, app } = styles;

  const safeColors = {
    textMuted: colors.textMuted || '#6c757d',
    primary: colors.primary || '#00C7B4',
    success: colors.success || '#28a745',
    danger: colors.danger || '#dc3545',
    warning: colors.warning || '#ffc107',
    info: colors.info || '#17a2b8',
    border: colors.border || '#dee2e6'
  };

  // ✅ LÓGICA DA API: Agora mais robusta
  const fetchContracheques = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      console.log(`Chamando API para o ano: ${anoFiltro}`);
      const response = await api.get(`/funcionario/contracheque/${anoFiltro}`);
      const data = response.data;

      console.log(data);
      
      setContracheques(data.contracheques || []);
      setResumoAnual(data.resumo_anual || null);

    } catch (error) {
      console.error('Erro detalhado ao buscar contracheques:', error);
      
      let errorMessage;
      if (error.response) {
        errorMessage = `Erro do servidor: ${error.response.status} - ${error.response.data?.message || 'Verifique o log do backend.'}`;
      } else if (error.request) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique a sua conexão e a URL da API.';
      } else {
        errorMessage = `Ocorreu um erro ao preparar a requisição: ${error.message}`;
      }
      
      setErro(errorMessage);
      setContracheques([]);
      setResumoAnual(null);
    } finally {
      setCarregando(false);
    }
  }, [anoFiltro]);

  useEffect(() => {
    fetchContracheques();
  }, [fetchContracheques]);

  // ✅ FUNÇÕES DE FORMATAÇÃO SEGURAS
  const formatarMoeda = (valor) => {
    if (typeof valor !== 'number' && !valor) return 'R$ 0,00';
    const valorNumerico = typeof valor === 'number' ? valor : parseFloat(valor);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorNumerico);
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'N/D';
    return new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getNomeMes = (dataString) => {
    if (!dataString) return 'Mês Inválido';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' }).replace(/^\w/, c => c.toUpperCase());
  };

  const toggleDetalhes = (id) => {
    setDetalhesExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleVisualizarContracheque = (contracheque) => setContrachequeSelecionado(contracheque);
  const handleFecharDetalhes = () => setContrachequeSelecionado(null);

  const handleDownload = async (contracheque) => {
    try {
      const response = await api.get(`/funcionario/contracheque/download/${contracheque.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contracheque-${getNomeMes(contracheque.mes_ano_referencia)}-${new Date(contracheque.mes_ano_referencia).getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar contracheque:', error);
      setErro('Não foi possível baixar o PDF. Tente novamente.');
    }
  };

  const DetalheLinha = ({ label, valor, corValor = isDarkMode ? '#fff' : '#333' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${safeColors.border}` }}>
        <span style={{ color: safeColors.textMuted }}>{label}:</span>
        <strong style={{ color: corValor }}>{formatarMoeda(valor)}</strong>
    </div>
  );

  if (carregando) {
    return (
      <div style={{...app?.card, padding: '40px', textAlign: 'center', color: safeColors.textMuted}}>
        <FiRefreshCw size={30} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '15px' }} />
        <p>A carregar contracheques de {anoFiltro}...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{...app?.card, padding: '40px', textAlign: 'center', color: safeColors.danger}}>
        <FiAlertTriangle size={40} style={{ marginBottom: '15px' }} />
        <h3>Ocorreu um Erro</h3>
        <p style={{ maxWidth: '600px', margin: '0 auto 15px' }}>{erro}</p>
        <button onClick={fetchContracheques} style={{
          background: safeColors.primary,
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (contrachequeSelecionado) {
    // ✅ CÁLCULOS SEGUROS: Usam `|| 0` para evitar erros com valores nulos
    const totalProventos = (contrachequeSelecionado.salario_bruto || 0) + 
      (contrachequeSelecionado.proventos_adicionais?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0);
      
    const totalDescontos = (contrachequeSelecionado.inss || 0) + 
      (contrachequeSelecionado.irrf || 0) + 
      (contrachequeSelecionado.vale_transporte || 0) + 
      (contrachequeSelecionado.plano_saude || 0) + 
      (contrachequeSelecionado.outros_descontos || 0);

    return (
      <div style={{...app?.card, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${safeColors.border}`, paddingBottom: '1rem' }}>
            <div>
              <h2 style={{...app?.title, margin: 0, fontSize: '1.5rem' }}>
                Contracheque - {getNomeMes(contrachequeSelecionado.mes_ano_referencia)} de {new Date(contrachequeSelecionado.mes_ano_referencia).getFullYear()}
              </h2>
              <p style={{ margin: '5px 0 0', color: safeColors.textMuted, fontSize: '0.9rem' }}>
                Emitido em: {formatarData(contrachequeSelecionado.data_emissao)}
              </p>
            </div>
            <button onClick={handleFecharDetalhes} style={{
              background: safeColors.primary,
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
                &larr; Voltar
            </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
                <h3 style={{ marginTop: 0, color: safeColors.primary }}>Proventos</h3>
                <DetalheLinha label="Salário Base" valor={contrachequeSelecionado.salario_bruto} />
                
                {contrachequeSelecionado.proventos_adicionais?.length > 0 && (
                  <>
                    <div style={{ margin: '10px 0 5px', fontWeight: 'bold', color: safeColors.textMuted }}>
                      Proventos Adicionais:
                    </div>
                    {contrachequeSelecionado.proventos_adicionais.map((provento, index) => (
                        <DetalheLinha key={index} label={provento.descricao} valor={provento.valor} corValor={safeColors.success} />
                    ))}
                  </>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '10px', borderTop: `2px solid ${safeColors.primary}` }}>
                    <span>Total de Proventos:</span>
                    <strong style={{ fontSize: '1.1rem' }}>{formatarMoeda(totalProventos)}</strong>
                </div>
            </div>

            <div>
                <h3 style={{ marginTop: 0, color: safeColors.primary }}>Descontos</h3>
                <DetalheLinha label="INSS" valor={contrachequeSelecionado.inss} corValor={safeColors.danger} />
                <DetalheLinha label="IRRF" valor={contrachequeSelecionado.irrf} corValor={safeColors.danger} />
                <DetalheLinha label="Vale Transporte" valor={contrachequeSelecionado.vale_transporte} corValor={safeColors.danger} />
                <DetalheLinha label="Plano de Saúde" valor={contrachequeSelecionado.plano_saude} corValor={safeColors.danger} />
                
                {contrachequeSelecionado.outros_descontos > 0 && (
                  <DetalheLinha label="Outros Descontos" valor={contrachequeSelecionado.outros_descontos} corValor={safeColors.danger} />
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '10px', borderTop: `2px solid ${safeColors.danger}` }}>
                    <span>Total de Descontos:</span>
                    <strong style={{ fontSize: '1.1rem', color: safeColors.danger }}>{formatarMoeda(totalDescontos)}</strong>
                </div>
            </div>
        </div>

        {contrachequeSelecionado.beneficios?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, color: safeColors.primary }}>Benefícios (Informativo)</h3>
                {contrachequeSelecionado.beneficios.map((beneficio, index) => (
                    <DetalheLinha key={index} label={beneficio.descricao} valor={beneficio.valor} corValor={safeColors.success} />
                ))}
            </div>
        )}
       
        <div style={{ padding: '20px', background: isDarkMode ? '#2a2a2a' : '#e8f5e8', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: safeColors.success, fontSize: '1.2rem' }}>SALÁRIO LÍQUIDO</h3>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: safeColors.success }}>
                    {formatarMoeda(contrachequeSelecionado.salario_liquido)}
                </span>
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={() => handleDownload(contrachequeSelecionado)} style={{
              background: safeColors.success,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
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
                border: `1px solid ${safeColors.primary}`
              }}
            >
              {[...Array(5)].map((_, i) => { 
                const ano = new Date().getFullYear() - i; 
                return <option key={ano} value={ano}>{ano}</option> 
              })}
            </select>
          </div>
        </div>

        {contracheques.length === 0 ? (
          <p style={{ color: safeColors.textMuted, textAlign: 'center', padding: '2rem' }}>Nenhum contracheque encontrado para o ano de {anoFiltro}.</p>
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
                {contracheques.map((contracheque) => {
                  const totalDescontos = (contracheque.inss || 0) + 
                    (contracheque.irrf || 0) + 
                    (contracheque.vale_transporte || 0) + 
                    (contracheque.plano_saude || 0) + 
                    (contracheque.outros_descontos || 0);
                  
                  const temDetalhes = (contracheque.proventos_adicionais?.length > 0 || contracheque.beneficios?.length > 0);
                  
                  return (
                    <React.Fragment key={contracheque.id}>
                      <tr style={{ borderBottom: `1px solid ${safeColors.border}` }}>
                        <td style={{ padding: '12px' }}>
                          {getNomeMes(contracheque.mes_ano_referencia)}/{new Date(contracheque.mes_ano_referencia).getFullYear()}
                        </td>
                        <td style={{ padding: '12px' }}>{formatarMoeda(contracheque.salario_bruto)}</td>
                        <td style={{ padding: '12px' }}>{formatarMoeda(totalDescontos)}</td>
                        <td style={{ padding: '12px' }}>{formatarMoeda(contracheque.salario_liquido)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem', 
                            backgroundColor: contracheque.status === 'disponivel' ? '#d4edda' : '#fff3cd', 
                            color: contracheque.status === 'disponivel' ? '#155724' : '#856404' 
                          }}>
                            {contracheque.status?.charAt(0).toUpperCase() + contracheque.status?.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {temDetalhes && (
                              <button onClick={() => toggleDetalhes(contracheque.id)} style={{
                                background: safeColors.warning,
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {detalhesExpandidos[contracheque.id] ? <FiMinus /> : <FiPlus />}
                                Detalhes
                              </button>
                            )}
                            <button onClick={() => handleVisualizarContracheque(contracheque)} style={{
                              background: safeColors.info,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FiEye /> Visualizar
                            </button>
                            <button onClick={() => handleDownload(contracheque)} style={{
                              background: safeColors.success,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FiDownload /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {detalhesExpandidos[contracheque.id] && temDetalhes && (
                        <tr>
                          <td colSpan="6" style={{ padding: '0', borderBottom: `1px solid ${safeColors.border}` }}>
                            <div style={{ padding: '15px', background: isDarkMode ? '#2a2a2a' : '#f8f9fa' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                {contracheque.proventos_adicionais?.length > 0 && (
                                  <div>
                                    <h4 style={{ margin: '0 0 10px', color: safeColors.primary }}>Proventos Adicionais</h4>
                                    {contracheque.proventos_adicionais.map((provento, index) => (
                                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>{provento.descricao}:</span>
                                        <strong style={{ color: safeColors.success }}>{formatarMoeda(provento.valor)}</strong>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {contracheque.beneficios?.length > 0 && (
                                  <div>
                                    <h4 style={{ margin: '0 0 10px', color: safeColors.primary }}>Benefícios</h4>
                                    {contracheque.beneficios.map((beneficio, index) => (
                                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>{beneficio.descricao}:</span>
                                        <strong style={{ color: safeColors.success }}>{formatarMoeda(beneficio.valor)}</strong>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {resumoAnual && (
          <div style={{ marginTop: '30px', ...app?.card, padding: '15px' }}>
            <h3 style={{ marginTop: 0, color: safeColors.primary }}>Resumo Anual ({anoFiltro})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', border: `1px solid ${safeColors.primary}`, borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: safeColors.textMuted }}>Total Bruto</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: safeColors.primary }}>
                  {formatarMoeda(resumoAnual.totalBruto)}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', border: `1px solid ${safeColors.primary}`, borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: safeColors.textMuted }}>Total Líquido</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: safeColors.success }}>
                  {formatarMoeda(resumoAnual.totalLiquido)}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', border: `1px solid ${safeColors.primary}`, borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: safeColors.textMuted }}>Média Mensal</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: safeColors.info }}>
                  {formatarMoeda(resumoAnual.mediaMensalLiquido)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusContracheques;