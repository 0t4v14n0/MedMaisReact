import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';
import { FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

const TabelaExames = ({ onEdit, onDesativar, onRefresh }) => {
  const { isDarkMode } = useTheme();
  const theme = generateStyles(isDarkMode) || {};
  const styles = theme.styles || { app: {} };
  const colors = theme.colors || {};

  const [exames, setExames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchExames = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/exame/all');
        setExames(response.data);
      } catch (err) {
        setError("Não foi possível carregar os exames.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExames();
  }, [onRefresh]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);

  const filteredExames = exames.filter(exame => 
    exame.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exame.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exame.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExames.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExames.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '200px',
      backgroundColor: colors.white,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
    }}>
      <p style={{ color: colors.text }}>Carregando exames...</p>
    </div>
  );

  if (error) return (
    <div style={{ 
      backgroundColor: colors.dangerLight || '#ffebee',
      color: colors.danger || 'red',
      padding: '20px',
      textAlign: 'center',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      {error}
    </div>
  );

  return (
    <div>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '20px',
        backgroundColor: colors.white,
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ 
          margin: 0,
          fontSize: '1.5rem',
          color: colors.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ 
            backgroundColor: colors.primary,
            color: colors.white,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem'
          }}>📊</span>
          Lista de Exames
        </h2>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          flex: 1,
          justifyContent: 'flex-end'
        }}>
          <div style={{ 
            position: 'relative',
            flex: '1 1 250px',
            maxWidth: '400px'
          }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textSecondary
            }} />
            <input
              type="text"
              placeholder="Buscar exames..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                ...styles.app.input,
                padding: '10px 15px 10px 35px',
                width: '100%',
                borderColor: colors.border,
                backgroundColor: colors.backgroundLight
              }}
            />
          </div>
          <span style={{ 
            ...styles.app.text,
            whiteSpace: 'nowrap',
            backgroundColor: colors.primaryLight,
            padding: '8px 12px',
            borderRadius: '20px',
            color: colors.primaryDark
          }}>
            Total: {filteredExames.length}
          </span>
        </div>
      </div>

      <div style={{ 
        width: '100%', 
        overflowX: 'auto',
        marginBottom: '20px',
        backgroundColor: colors.white,
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        padding: '10px'
      }}>
        <table style={{ 
          width: '100%',
          minWidth: '800px',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{
              backgroundColor: colors.primaryLight,
              borderBottom: `2px solid ${colors.primary}`
            }}>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                color: colors.primaryDark,
                fontWeight: '600'
              }}>Nome</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                color: colors.primaryDark,
                fontWeight: '600'
              }}>Código</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                color: colors.primaryDark,
                fontWeight: '600'
              }}>Categoria</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                color: colors.primaryDark,
                fontWeight: '600'
              }}>Valor</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'left',
                color: colors.primaryDark,
                fontWeight: '600'
              }}>Status</th>
              <th style={{
                padding: '12px 15px',
                textAlign: 'center',
                color: colors.primaryDark,
                fontWeight: '600',
                width: '120px'
              }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((exame, index) => (
                <tr key={exame.id} style={{
                  borderBottom: `1px solid ${colors.border}`,
                  backgroundColor: index % 2 === 0 ? colors.white : colors.backgroundLight
                }}>
                  <td style={{
                    padding: '12px 15px',
                    color: colors.text
                  }}>{exame.nome}</td>
                  <td style={{
                    padding: '12px 15px',
                    color: colors.text
                  }}>{exame.codigo}</td>
                  <td style={{
                    padding: '12px 15px',
                    color: colors.text
                  }}>{exame.categoria}</td>
                  <td style={{
                    padding: '12px 15px',
                    color: colors.text,
                    fontWeight: '500'
                  }}>{formatCurrency(exame.valor)}</td>
                  <td style={{
                    padding: '12px 15px',
                    color: colors.text
                  }}>
                    <span style={{
                      backgroundColor: exame.ativo ? (colors.success || 'green') : (colors.danger || 'red'),
                      color: colors.white || 'white', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      display: 'inline-block',
                      minWidth: '70px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {exame.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px 15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px',
                      justifyContent: 'center'
                    }}>
                      <button 
                        onClick={() => onEdit(exame)} 
                        style={{
                          border: 'none',
                          backgroundColor: colors.warning || 'orange',
                          color: colors.white,
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          ':hover': {
                            opacity: 0.8
                          }
                        }}
                        title="Editar"
                      >
                        <FiEdit size={16} />
                      </button>
                      {exame.ativo && (
                        <button 
                          onClick={() => onDesativar(exame)} 
                          style={{
                            border: 'none',
                            backgroundColor: colors.danger || 'red',
                            color: colors.white,
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            ':hover': {
                              opacity: 0.8
                            }
                          }}
                          title="Desativar"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ 
                  padding: '30px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontStyle: 'italic'
                }}>
                  Nenhum exame encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredExames.length > itemsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
          flexWrap: 'wrap',
          gap: '5px',
          backgroundColor: colors.white,
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              border: 'none',
              padding: '8px 12px',
              backgroundColor: colors.primary,
              color: colors.white,
              borderRadius: '6px',
              cursor: 'pointer',
              minWidth: '40px',
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: currentPage === 1 ? colors.primary : colors.primaryDark
              }
            }}
          >
            &lt;
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                style={{
                  border: 'none',
                  padding: '8px 12px',
                  backgroundColor: currentPage === pageNum ? colors.primaryDark : colors.primary,
                  color: colors.white,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  minWidth: '40px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: colors.primaryDark
                  }
                }}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              border: 'none',
              padding: '8px 12px',
              backgroundColor: colors.primary,
              color: colors.white,
              borderRadius: '6px',
              cursor: 'pointer',
              minWidth: '40px',
              opacity: currentPage === totalPages ? 0.5 : 1,
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: currentPage === totalPages ? colors.primary : colors.primaryDark
              }
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default TabelaExames;