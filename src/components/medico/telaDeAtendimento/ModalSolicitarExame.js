import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { FiCheck, FiX } from 'react-icons/fi';

const ModalSolicitarExame = ({ consulta, onCancel, styles, colors, mostrarToast }) => {
    const [examesDisponiveis, setExamesDisponiveis] = useState([]);
    const [examesSelecionados, setExamesSelecionados] = useState([]);
    const [justificativa, setJustificativa] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExames = async () => {
            try {
                setLoading(true);
                const response = await api.get('/exame/all/ativo');
                setExamesDisponiveis(response.data || []);
            } catch (err) {
                console.error("Erro ao buscar exames disponíveis:", err);
                mostrarToast("Erro ao carregar a lista de exames.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchExames();
    }, [mostrarToast]);

    const handleExameToggle = (id) => {
        setExamesSelecionados(prev =>
            prev.includes(id) ? prev.filter(exId => exId !== id) : [...prev, id]
        );
    };

    const handleSolicitar = async () => {
        if (examesSelecionados.length === 0) {
            mostrarToast("Selecione ao menos um exame.", "error");
            return;
        }

        try {
            // Preparando o payload conforme o DTO DataCriacaoPedidoPaciente
            const payload = {
                idPaciente: consulta.dataDetalhesPaciente.dataDetalhesPessoa.id,
                justificativa: justificativa,
                examesIds: examesSelecionados.map(id => Number(id)) // Garantindo que são números
            };

            console.log("Payload sendo enviado:", payload); // Para debug

            await api.post('medico/solicitar/exame', payload);
            mostrarToast("Exame(s) solicitado(s) com sucesso!");
            onCancel();
        } catch (err) {
            console.error("Erro ao solicitar exame:", err);
            mostrarToast(err.response?.data?.message || "Erro ao solicitar exame.", "error");
        }
    };

    const filteredExames = examesDisponiveis.filter(exame =>
        exame.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            {/* Restante do código do modal permanece igual */}
            <div style={{
                backgroundColor: colors.white,
                borderRadius: '10px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}>
                {/* Cabeçalho */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    borderBottom: `1px solid ${colors.border}`
                }}>
                    <h3 style={{
                        margin: 0,
                        color: colors.textPrimary,
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Solicitar Exames
                    </h3>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: colors.textSecondary,
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Corpo do Modal */}
                <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 100px)' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100px',
                            color: colors.textSecondary
                        }}>
                            Carregando exames disponíveis...
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar exame..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 15px',
                                        borderRadius: '6px',
                                        border: `1px solid ${colors.border}`,
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    color: colors.textPrimary,
                                    fontWeight: '500'
                                }}>
                                    Exames Disponíveis
                                </label>
                               
                                <div style={{
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '6px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {filteredExames.length > 0 ? (
                                        filteredExames.map(exame => (
                                            <div
                                                key={exame.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '12px 15px',
                                                    borderBottom: `1px solid ${colors.border}`,
                                                    backgroundColor: examesSelecionados.includes(exame.id)
                                                        ? `${colors.primary}15`
                                                        : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onClick={() => handleExameToggle(exame.id)}
                                            >
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '4px',
                                                    border: `1px solid ${colors.border}`,
                                                    marginRight: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: examesSelecionados.includes(exame.id)
                                                        ? colors.primary
                                                        : 'transparent'
                                                }}>
                                                    {examesSelecionados.includes(exame.id) && (
                                                        <FiCheck size={14} color="white" />
                                                    )}
                                                </div>
                                                <span style={{
                                                    color: colors.textPrimary,
                                                    flex: 1
                                                }}>
                                                    {exame.nome}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            color: colors.textSecondary
                                        }}>
                                            Nenhum exame encontrado
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    color: colors.textPrimary,
                                    fontWeight: '500'
                                }}>
                                    Justificativa / Hipótese Diagnóstica
                                </label>
                                <textarea
                                    value={justificativa}
                                    onChange={(e) => setJustificativa(e.target.value)}
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: `1px solid ${colors.border}`,
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}
                                    placeholder="Descreva a justificativa para a solicitação dos exames..."
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Rodapé */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '15px 20px',
                    borderTop: `1px solid ${colors.border}`,
                    gap: '10px'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: `1px solid ${colors.border}`,
                            background: 'transparent',
                            color: colors.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSolicitar}
                        disabled={examesSelecionados.length === 0}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: 'none',
                            background: examesSelecionados.length === 0
                                ? `${colors.success}80`
                                : colors.success,
                            color: 'white',
                            cursor: examesSelecionados.length === 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Solicitar Exames
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalSolicitarExame;