import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';
// Importa a sua instância de API configurada
import api from '../../../api/api';

const Unidade = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;

    const estadoInicialForm = {
        nome: '',
        razaoSocial: '',
        cnpj: '',
        codigoCnes: '',
        telefonePrincipal: '',
        emailContato: '',
        endereco: {
            cep: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: ''
        }
    };

    const [unidades, setUnidades] = useState([]);
    const [formData, setFormData] = useState(estadoInicialForm);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Novos estados para busca e paginação
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUnidades = useCallback(async (search = "", page = 0) => {
        setLoading(true);
        setError('');
        try {
            // A URL agora inclui os parâmetros de busca e paginação
            // Adapte o endpoint se for diferente no seu backend
            const url = `/unidade/todas?search=${encodeURIComponent(search)}&page=${page}`;
            const response = await api.get(url);
            
            // Lógica para lidar com a resposta paginada
            const data = response.data.content || response.data || [];
            setUnidades(Array.isArray(data) ? data : []);
            setTotalPages(response.data.totalPages || 1);

        } catch (err) {
            setError('Falha ao buscar unidades. Tente novamente.');
            console.error(err);
            setUnidades([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Debounce para evitar chamadas excessivas à API ao digitar
        const timer = setTimeout(() => {
            fetchUnidades(searchTerm, currentPage);
        }, 500); // Atraso de 500ms

        return () => clearTimeout(timer);
    }, [fetchUnidades, searchTerm, currentPage]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEnderecoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            endereco: { ...prev.endereco, [name]: value }
        }));
    };
    
    const handleBuscaCep = async () => {
        const cep = formData.endereco.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if(!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    endereco: {
                        ...prev.endereco,
                        endereco: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                        estado: data.uf
                    }
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleEdit = (unidade) => {
        setEditId(unidade.id);
        setFormData(unidade);
        window.scrollTo(0, 0); // Rola a tela para o topo para ver o formulário
    };

    const handleCancel = () => {
        setEditId(null);
        setFormData(estadoInicialForm);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (editId) {
                await api.put(`/unidade/atualizar/${editId}`, formData);
            } else {
                await api.post('/unidade/criar', formData);
            }
            handleCancel();
            await fetchUnidades(searchTerm, currentPage); // Recarrega a lista
        } catch (err) {
            const errorMsg = err.response?.data?.message || `Erro ao ${editId ? 'atualizar' : 'criar'} unidade.`;
            setError(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Adicione uma confirmação para segurança
        if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
            setLoading(true);
            setError('');
            try {
                // Adapte o endpoint se for diferente no seu backend
                await api.delete(`/unidade/deletar/${id}`);
                await fetchUnidades(searchTerm, currentPage);
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Erro ao excluir unidade.';
                setError(errorMsg);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };
    
    // Handlers para busca e paginação
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reseta para a primeira página ao buscar
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const formStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
    };
    
    const inputGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
    };

    return (
        <div style={{ color: colors.text_primary }}>
            <h3 style={styles.app.subtitle}>{editId ? 'Editando Unidade' : 'Nova Unidade'}</h3>
            
            <form onSubmit={handleSubmit} style={{...styles.app.card, padding: '20px', marginBottom: '25px'}}>
                <div style={formStyles}>
                    {/* Dados da Unidade */}
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Nome da Unidade</label>
                        <input style={styles.app.input} type="text" name="nome" value={formData.nome} onChange={handleInputChange} required />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Razão Social</label>
                        <input style={styles.app.input} type="text" name="razaoSocial" value={formData.razaoSocial} onChange={handleInputChange} required />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>CNPJ</label>
                        <input style={styles.app.input} type="text" name="cnpj" value={formData.cnpj} onChange={handleInputChange} required />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Código CNES</label>
                        <input style={styles.app.input} type="text" name="codigoCnes" value={formData.codigoCnes} onChange={handleInputChange} required />
                    </div>
                     <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Telefone Principal</label>
                        <input style={styles.app.input} type="text" name="telefonePrincipal" value={formData.telefonePrincipal} onChange={handleInputChange} required />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>E-mail de Contato</label>
                        <input style={styles.app.input} type="email" name="emailContato" value={formData.emailContato} onChange={handleInputChange} required />
                    </div>
                </div>
                 <hr style={{ border: `1px solid ${colors.border}`, margin: '20px 0' }} />
                <h4 style={styles.app.subtitle}>Endereço</h4>
                 <div style={formStyles}>
                    {/* Endereço */}
                     <div style={inputGroupStyle}>
                        <label style={styles.app.label}>CEP</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input style={{...styles.app.input, flex: 1}} type="text" name="cep" value={formData.endereco.cep} onChange={handleEnderecoChange} />
                            <button type="button" onClick={handleBuscaCep} style={{...styles.app.button, padding: '0 15px'}}>Buscar</button>
                        </div>
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Endereço (Logradouro)</label>
                        <input style={styles.app.input} type="text" name="endereco" value={formData.endereco.endereco} onChange={handleEnderecoChange} required />
                    </div>
                     <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Número</label>
                        <input style={styles.app.input} type="text" name="numero" value={formData.endereco.numero} onChange={handleEnderecoChange} required />
                    </div>
                     <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Complemento</label>
                        <input style={styles.app.input} type="text" name="complemento" value={formData.endereco.complemento} onChange={handleEnderecoChange} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Bairro</label>
                        <input style={styles.app.input} type="text" name="bairro" value={formData.endereco.bairro} onChange={handleEnderecoChange} required />
                    </div>
                     <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Cidade</label>
                        <input style={styles.app.input} type="text" name="cidade" value={formData.endereco.cidade} onChange={handleEnderecoChange} required />
                    </div>
                     <div style={inputGroupStyle}>
                        <label style={styles.app.label}>Estado (UF)</label>
                        <input style={styles.app.input} type="text" name="estado" maxLength="2" value={formData.endereco.estado} onChange={handleEnderecoChange} required />
                    </div>
                </div>
                {error && <p style={{ color: colors.danger, marginTop: '10px' }}>{error}</p>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" style={styles.app.button_primary} disabled={loading}>
                        {loading ? 'Salvando...' : (editId ? 'Atualizar Unidade' : 'Criar Unidade')}
                    </button>
                    {editId && (
                        <button type="button" onClick={handleCancel} style={styles.app.button} disabled={loading}>
                            Cancelar Edição
                        </button>
                    )}
                </div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={styles.app.subtitle}>Unidades Cadastradas</h3>
                <input 
                    type="text"
                    placeholder="Buscar por nome ou cidade..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{...styles.app.input, maxWidth: '300px'}}
                />
            </div>
            
            {loading && <p>Carregando...</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {unidades.map(unidade => (
                    <div key={unidade.id} style={{ ...styles.app.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', margin: 0, color: colors.text_primary }}>{unidade.nome}</p>
                            <p style={{ fontSize: '14px', margin: '4px 0 0', color: colors.text_secondary }}>
                                {unidade.endereco.cidade} - {unidade.endereco.estado} | CNPJ: {unidade.cnpj}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleEdit(unidade)} style={styles.app.button}>Editar</button>
                            {/* Descomente a linha abaixo quando tiver o endpoint de exclusão */}
                            {/* <button onClick={() => handleDelete(unidade.id)} style={{...styles.app.button, backgroundColor: colors.danger, color: '#fff'}}>Excluir</button> */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Controles de Paginação */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 0 || loading}
                    style={styles.app.button}
                >
                    Anterior
                </button>
                <span style={{color: colors.text_secondary}}>
                    Página {currentPage + 1} de {totalPages}
                </span>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage >= totalPages - 1 || loading}
                    style={styles.app.button}
                >
                    Próxima
                </button>
            </div>
        </div>
    );
};

export default Unidade;