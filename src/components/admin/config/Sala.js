import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';
// Importa a sua instância de API configurada
import api from '../../../api/api';

const tipoSalaOptions = ['CONSULTORIO',
                         'POSTO_COLETA',
                         'SALA_AULA',
                         'SALA_VIRTUAL',
                         'RECEPCAO',
                         'ADMINISTRATIVO',
                         'SALA_DE_EXAMES',
                         'SALA_DE_ESPERA',
                         'ADMINISTRATIVO'];

const Sala = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;

    const estadoInicialForm = {
        nome: '',
        tipo: 'CONSULTORIO',
        capacidade: 1,
        descricao: '',
        unidadeId: '' // ID da unidade a qual a sala pertence
    };

    const [salas, setSalas] = useState([]);
    const [unidades, setUnidades] = useState([]); // Para popular o <select>
    const [formData, setFormData] = useState(estadoInicialForm);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Busca as salas e unidades simultaneamente para otimizar
            const [salasRes, unidadesRes] = await Promise.all([
                api.get('/admin/sala/todas'),
                api.get('/unidade/todas') // Assumindo que este endpoint retorna a lista de unidades
            ]);
            
            const salasData = salasRes.data.content || salasRes.data || [];
            const unidadesData = unidadesRes.data.content || unidadesRes.data || [];

            setSalas(Array.isArray(salasData) ? salasData : []);
            setUnidades(Array.isArray(unidadesData) ? unidadesData : []);

        } catch (err) {
            setError('Falha ao buscar dados. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Converte capacidade para número
        const finalValue = name === 'capacidade' ? parseInt(value, 10) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleEdit = (sala) => {
        window.scrollTo(0, 0);
        setEditId(sala.id);
        setFormData({
            nome: sala.nome,
            tipo: sala.tipo,
            capacidade: sala.capacidade,
            descricao: sala.descricao,
            unidadeId: sala.unidade.id // Pega o ID da unidade
        });
    };

    const handleCancel = () => {
        setEditId(null);
        setFormData(estadoInicialForm);
        setError('');
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
            setLoading(true);
            setError('');
            try {
                await api.delete(`/sala/deletar/${id}`); // Adapte o endpoint se necessário
                await fetchData();
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Erro ao excluir sala.';
                setError(errorMsg);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.unidadeId) {
            setError('Por favor, selecione uma unidade.');
            return;
        }
        setLoading(true);
        setError('');
        
        // O backend espera apenas os campos da sala, sem o 'unidadeId' no corpo
        const dadosSala = {
            nome: formData.nome,
            tipo: formData.tipo,
            capacidade: formData.capacidade,
            descricao: formData.descricao
        };

        try {
            if (editId) {
                // Para atualizar, o ID da sala vai na URL
                await api.put(`/sala/atualizar/${editId}`, dadosSala);
            } else {
                // Para criar, o ID da unidade vai na URL
                await api.post(`/sala/criar/${formData.unidadeId}`, dadosSala);
            }
            handleCancel();
            await fetchData(); // Recarrega a lista
        } catch (err) {
            const errorMsg = err.response?.data?.message || `Erro ao ${editId ? 'atualizar' : 'criar'} sala.`;
            setError(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
    };

    const inputGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
    };

    return (
        <div style={{ color: colors.text_primary }}>
            <h3 style={styles.app.subtitle}>{editId ? 'Editando Sala' : 'Nova Sala'}</h3>
            
            <form onSubmit={handleSubmit} style={{...styles.app.card, padding: '20px', marginBottom: '25px'}}>
                <div style={formStyles}>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Unidade Pertencente</label>
                        <select 
                            style={styles.app.input} 
                            name="unidadeId" 
                            value={formData.unidadeId} 
                            onChange={handleInputChange} 
                            required
                            disabled={!!editId} // Não permite trocar a unidade de uma sala existente
                        >
                            <option value="">Selecione uma unidade...</option>
                            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                        </select>
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Nome da Sala</label>
                        <input style={styles.app.input} type="text" name="nome" value={formData.nome} onChange={handleInputChange} required />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Tipo de Sala</label>
                         <select style={styles.app.input} name="tipo" value={formData.tipo} onChange={handleInputChange} required>
                            {tipoSalaOptions.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                     <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Capacidade</label>
                        <input style={styles.app.input} type="number" name="capacidade" value={formData.capacidade} onChange={handleInputChange} min="1" required />
                    </div>
                    <div style={{...inputGroupStyle, gridColumn: '1 / -1'}}>
                        <label style={styles.app.label}>Descrição (Opcional)</label>
                        <textarea style={{...styles.app.input, height: '80px'}} name="descricao" value={formData.descricao} onChange={handleInputChange}></textarea>
                    </div>
                </div>

                {error && <p style={{ color: colors.danger, marginTop: '10px' }}>{error}</p>}
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" style={styles.app.button_primary} disabled={loading}>
                        {loading ? 'Salvando...' : (editId ? 'Atualizar Sala' : 'Criar Sala')}
                    </button>
                    {editId && (
                        <button type="button" onClick={handleCancel} style={styles.app.button} disabled={loading}>
                            Cancelar Edição
                        </button>
                    )}
                </div>
            </form>

            <h3 style={styles.app.subtitle}>Salas Cadastradas</h3>
            {loading && !salas.length ? <p>Carregando...</p> : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {salas.map(sala => (
                    <div key={sala.id} style={{ ...styles.app.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', margin: 0, color: colors.text_primary }}>
                                {sala.nome} 
                                <span style={{ 
                                    marginLeft: '10px', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    backgroundColor: sala.ativo ? colors.success_light : colors.border,
                                    color: sala.ativo ? colors.success_dark : colors.text_secondary
                                }}>
                                    {sala.ativo ? 'Ativa' : 'Inativa'}
                                </span>
                            </p>
                            <p style={{ fontSize: '14px', margin: '4px 0 0', color: colors.text_secondary }}>
                                {sala.unidade.nome} | Tipo: {sala.tipo.replace(/_/g, ' ')} | Capacidade: {sala.capacidade}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleEdit(sala)} style={styles.app.button}>Editar</button>
                             {/* <button onClick={() => handleDelete(sala.id)} style={{...styles.app.button, backgroundColor: colors.danger, color: '#fff'}}>Excluir</button> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sala;