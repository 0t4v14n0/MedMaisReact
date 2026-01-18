import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';
import { FiSave, FiTrash2, FiEdit, FiPlus, FiX, FiCalendar } from 'react-icons/fi';
import api from '../../../api/api'; // Importando a instância do axios

const RegrasCalculo = () => {
  const [regras, setRegras] = useState([]);
  const [regraEditando, setRegraEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [novaFaixa, setNovaFaixa] = useState({
    baseMin: '',
    baseMax: '',
    aliquotaPercentual: '',
    valorDeduzir: ''
  });
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

  // Tipos de linha de contracheque
  const tiposLinha = [
    { value: 'PROVENTO', label: 'Provento' },
    { value: 'DESCONTO', label: 'Desconto' },
    { value: 'BENEFICIO', label: 'Benefício' },
    { value: 'INFORMATIVO', label: 'Informativo' }
  ];

  // Buscar regras da API usando axios (padrão do seu projeto)
  const fetchRegras = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get('/admin/payroll/regras');
      const regrasData = response.data.content || response.data || [];
      setRegras(Array.isArray(regrasData) ? regrasData : []);
    } catch (err) {
      setErro('Falha ao buscar regras. Tente novamente.');
      console.error('Erro ao buscar regras:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    fetchRegras();
  }, [fetchRegras]);

  const handleNovaRegra = () => {
    setRegraEditando({
      id: null,
      codigo: '',
      nome: '',
      tipo: 'PROVENTO',
      dataVigenciaInicio: new Date().toISOString().split('T')[0],
      dataVigenciaFim: '',
      ativo: true,
      faixas: []
    });
    setModoEdicao(true);
  };

  const handleEditarRegra = (regra) => {
    setRegraEditando({ ...regra });
    setModoEdicao(true);
  };

  const handleCancelarEdicao = () => {
    setRegraEditando(null);
    setModoEdicao(false);
    setNovaFaixa({
      baseMin: '',
      baseMax: '',
      aliquotaPercentual: '',
      valorDeduzir: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegraEditando({
      ...regraEditando,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAdicionarFaixa = () => {
    if (!novaFaixa.baseMin || !novaFaixa.aliquotaPercentual) {
      alert('Base mínima e alíquota percentual são obrigatórias');
      return;
    }

    const faixa = {
      baseMin: parseFloat(novaFaixa.baseMin),
      baseMax: novaFaixa.baseMax ? parseFloat(novaFaixa.baseMax) : null,
      aliquotaPercentual: parseFloat(novaFaixa.aliquotaPercentual),
      valorDeduzir: novaFaixa.valorDeduzir ? parseFloat(novaFaixa.valorDeduzir) : null
    };

    setRegraEditando({
      ...regraEditando,
      faixas: [...regraEditando.faixas, faixa]
    });

    setNovaFaixa({
      baseMin: '',
      baseMax: '',
      aliquotaPercentual: '',
      valorDeduzir: ''
    });
  };

  const handleRemoverFaixa = (index) => {
    const novasFaixas = [...regraEditando.faixas];
    novasFaixas.splice(index, 1);
    setRegraEditando({
      ...regraEditando,
      faixas: novasFaixas
    });
  };

  const handleSalvarRegra = async () => {
    try {
      // Validações básicas
      if (!regraEditando.codigo || !regraEditando.nome || !regraEditando.dataVigenciaInicio) {
        alert('Código, nome e data de início são obrigatórios');
        return;
      }

      let response;
      if (regraEditando.id) {
        // Atualizar regra existente
        response = await api.put('/admin/payroll/regras', regraEditando);
      } else {
        // Criar nova regra
        response = await api.post('/admin/payroll/regras', regraEditando);
      }

      const regraSalva = response.data;
      
      if (regraEditando.id) {
        setRegras(regras.map(r => r.id === regraSalva.id ? regraSalva : r));
      } else {
        setRegras([...regras, regraSalva]);
      }

      handleCancelarEdicao();
      alert('Regra salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar regra:', error);
      alert('Erro ao salvar regra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExcluirRegra = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) {
      return;
    }

    try {
      await api.delete(`/admin/payroll/regras/${id}`);
      setRegras(regras.filter(r => r.id !== id));
      alert('Regra excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir regra:', error);
      alert('Erro ao excluir regra: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarPercentual = (valor) => {
    return `${valor}%`;
  };

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (carregando) {
    return (
      <div style={app?.card || {}}>
        <p>Carregando regras de cálculo...</p>
      </div>
    );
  }

  if (modoEdicao) {
    return (
      <div style={app?.container || {}}>
        <div style={app?.card || {}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={app?.title || {}}>
              {regraEditando.id ? 'Editar Regra de Cálculo' : 'Nova Regra de Cálculo'}
            </h2>
            <button 
              onClick={handleCancelarEdicao}
              style={{
                background: 'transparent',
                color: safeColors.danger,
                border: `1px solid ${safeColors.danger}`,
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiX /> Cancelar
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Código *</label>
              <input
                type="text"
                name="codigo"
                value={regraEditando.codigo}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${safeColors.primary}`,
                  background: isDarkMode ? '#333' : 'white',
                  color: isDarkMode ? 'white' : 'black'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome *</label>
              <input
                type="text"
                name="nome"
                value={regraEditando.nome}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${safeColors.primary}`,
                  background: isDarkMode ? '#333' : 'white',
                  color: isDarkMode ? 'white' : 'black'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo *</label>
              <select
                name="tipo"
                value={regraEditando.tipo}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${safeColors.primary}`,
                  background: isDarkMode ? '#333' : 'white',
                  color: isDarkMode ? 'white' : 'black'
                }}
              >
                {tiposLinha.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={regraEditando.ativo}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Regra Ativa
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Início Vigência *</label>
              <input
                type="date"
                name="dataVigenciaInicio"
                value={regraEditando.dataVigenciaInicio}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${safeColors.primary}`,
                  background: isDarkMode ? '#333' : 'white',
                  color: isDarkMode ? 'white' : 'black'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Fim Vigência</label>
              <input
                type="date"
                name="dataVigenciaFim"
                value={regraEditando.dataVigenciaFim || ''}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${safeColors.primary}`,
                  background: isDarkMode ? '#333' : 'white',
                  color: isDarkMode ? 'white' : 'black'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: safeColors.primary, marginBottom: '15px' }}>Faixas de Cálculo</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Base Mínima *</label>
                <input
                  type="number"
                  step="0.01"
                  value={novaFaixa.baseMin}
                  onChange={(e) => setNovaFaixa({...novaFaixa, baseMin: e.target.value})}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${safeColors.primary}`
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Base Máxima</label>
                <input
                  type="number"
                  step="0.01"
                  value={novaFaixa.baseMax}
                  onChange={(e) => setNovaFaixa({...novaFaixa, baseMax: e.target.value})}
                  placeholder="Opcional"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${safeColors.primary}`
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Alíquota % *</label>
                <input
                  type="number"
                  step="0.01"
                  value={novaFaixa.aliquotaPercentual}
                  onChange={(e) => setNovaFaixa({...novaFaixa, aliquotaPercentual: e.target.value})}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${safeColors.primary}`
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Valor a Deduzir</label>
                <input
                  type="number"
                  step="0.01"
                  value={novaFaixa.valorDeduzir}
                  onChange={(e) => setNovaFaixa({...novaFaixa, valorDeduzir: e.target.value})}
                  placeholder="Opcional"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${safeColors.primary}`
                  }}
                />
              </div>
            </div>
            
            <button
              onClick={handleAdicionarFaixa}
              style={{
                background: safeColors.primary,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiPlus /> Adicionar Faixa
            </button>
          </div>

          {regraEditando.faixas.length > 0 ? (
            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${safeColors.primary}` }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Base Mínima</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Base Máxima</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Alíquota</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Valor a Deduzir</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {regraEditando.faixas.map((faixa, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{formatarMoeda(faixa.baseMin)}</td>
                      <td style={{ padding: '8px' }}>{faixa.baseMax ? formatarMoeda(faixa.baseMax) : 'Ilimitado'}</td>
                      <td style={{ padding: '8px' }}>{formatarPercentual(faixa.aliquotaPercentual)}</td>
                      <td style={{ padding: '8px' }}>{faixa.valorDeduzir ? formatarMoeda(faixa.valorDeduzir) : 'Nenhum'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoverFaixa(index)}
                          style={{
                            background: safeColors.danger,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: safeColors.textMuted, marginBottom: '20px' }}>Nenhuma faixa de cálculo adicionada.</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              onClick={handleSalvarRegra}
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
              <FiSave /> Salvar Regra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={app?.container || {}}>
      <div style={app?.card || {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={app?.title || {}}>Regras de Cálculo de Folha</h2>
          <button 
            onClick={handleNovaRegra}
            style={{
              background: safeColors.primary,
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
            <FiPlus /> Nova Regra
          </button>
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
            <button 
              onClick={fetchRegras}
              style={{
                background: 'transparent',
                color: safeColors.danger,
                border: `1px solid ${safeColors.danger}`,
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {regras.length === 0 ? (
          <p>Nenhuma regra de cálculo cadastrada.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${safeColors.primary}` }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Código</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Vigência</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Faixas</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {regras.map((regra) => (
                  <tr key={regra.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{regra.codigo}</td>
                    <td style={{ padding: '12px' }}>{regra.nome}</td>
                    <td style={{ padding: '12px' }}>
                      {tiposLinha.find(t => t.value === regra.tipo)?.label || regra.tipo}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {formatarData(regra.dataVigenciaInicio)} 
                      {regra.dataVigenciaFim && ` até ${formatarData(regra.dataVigenciaFim)}`}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        backgroundColor: regra.ativo ? '#d4edda' : '#f8d7da',
                        color: regra.ativo ? '#155724' : '#721c24'
                      }}>
                        {regra.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {regra.faixas?.length || 0}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleEditarRegra(regra)}
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
                          <FiEdit /> Editar
                        </button>
                        <button
                          onClick={() => handleExcluirRegra(regra.id)}
                          style={{
                            background: safeColors.danger,
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
                          <FiTrash2 /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegrasCalculo;