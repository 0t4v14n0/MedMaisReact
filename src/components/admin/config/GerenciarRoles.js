import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStyles } from '../../../styles/globalStyles';
import { FiSearch, FiUser, FiMail, FiBriefcase, FiUserPlus, FiUserMinus, FiTrash2, FiEdit, FiSave, FiX, FiAlertTriangle, FiMapPin, FiCalendar, FiClock, FiHome, FiDroplet, FiPhone, FiScale, FiActivity } from 'react-icons/fi';

// =================================================================
// 🎯 CONFIGURAÇÃO DA HIERARQUIA DE ROLES
// =================================================================
const HIERARQUIA_ROLES = {
    // Roles base (não dependem de outras)
    'PACIENTE': { 
        nome: 'Paciente', 
        dependeDe: [],
        icon: '👤',
        color: '#8b5cf6'
    },
    'FUNCIONARIO': { 
        nome: 'Funcionário', 
        dependeDe: [],
        icon: '💼', 
        color: '#3b82f6'
    },
    
    // Roles que dependem de FUNCIONARIO
    'MEDICO': { 
        nome: 'Médico', 
        dependeDe: ['FUNCIONARIO'],
        icon: '👨‍⚕️',
        color: '#10b981'
    },
    'RECEPCAO': { 
        nome: 'Recepção', 
        dependeDe: ['FUNCIONARIO'],
        icon: '🏢',
        color: '#f59e0b'
    },
    'LABORATORIO': { 
        nome: 'Laboratório', 
        dependeDe: ['FUNCIONARIO'],
        icon: '🔬',
        color: '#06b6d4'
    },
    'FINANCEIRO': { 
        nome: 'Financeiro', 
        dependeDe: ['FUNCIONARIO'],
        icon: '💰',
        color: '#84cc16'
    },
    'COLETA': { 
        nome: 'Coleta', 
        dependeDe: ['FUNCIONARIO'],
        icon: '🚚',
        color: '#f97316'
    },
    'PROFESSOR': { 
        nome: 'Professor', 
        dependeDe: ['FUNCIONARIO'],
        icon: '👨‍🏫',
        color: '#ec4899'
    },
    
    // Role especial
    'ADMIN': { 
        nome: 'Admin', 
        dependeDe: [],
        icon: '👑',
        color: '#ef4444'
    }
};

// 🩸 TIPOS SANGUÍNEOS - SEGUINDO O ENUM DO BACKEND
const TIPOS_SANGUINEOS = [
    { valor: 'A_POSITIVO', nome: 'A+', descricao: 'A Positivo' },
    { valor: 'A_NEGATIVO', nome: 'A-', descricao: 'A Negativo' },
    { valor: 'B_POSITIVO', nome: 'B+', descricao: 'B Positivo' },
    { valor: 'B_NEGATIVO', nome: 'B-', descricao: 'B Negativo' },
    { valor: 'AB_POSITIVO', nome: 'AB+', descricao: 'AB Positivo' },
    { valor: 'AB_NEGATIVO', nome: 'AB-', descricao: 'AB Negativo' },
    { valor: 'O_POSITIVO', nome: 'O+', descricao: 'O Positivo' },
    { valor: 'O_NEGATIVO', nome: 'O-', descricao: 'O Negativo' },
    { valor: 'AB_POS', nome: 'AB+', descricao: 'AB Positivo' } // Mantido como está no enum
];

// =================================================================
// 🎯 COMPONENTE PRINCIPAL - GERENCIAMENTO DE ROLES
// =================================================================
const GerenciarRoles = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const { colors } = styles;

    // Estados principais
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [modalRoleAberto, setModalRoleAberto] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [paginacao, setPaginacao] = useState({
        paginaAtual: 0,
        totalPaginas: 0,
        totalElementos: 0
    });

    // Dados para os modais
    const [roles, setRoles] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [unidades, setUnidades] = useState([]);

    // Buscar usuários com debounce
    const buscarUsuarios = useCallback(async (termoBusca, pagina = 0) => {
        if (!termoBusca.trim()) {
            setUsuarios([]);
            setPaginacao({ paginaAtual: 0, totalPaginas: 0, totalElementos: 0 });
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/admin/pessoa/buscar`, {
                params: {
                    termo: termoBusca,
                    page: pagina,
                    size: 10
                }
            });
            
            setUsuarios(response.data.content || []);
            setPaginacao({
                paginaAtual: response.data.number || 0,
                totalPaginas: response.data.totalPages || 0,
                totalElementos: response.data.totalElements || 0
            });
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            mostrarToast('Erro ao buscar usuários', 'error');
            setUsuarios([]);
            setPaginacao({ paginaAtual: 0, totalPaginas: 0, totalElementos: 0 });
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar dados auxiliares
    useEffect(() => {
        const carregarDadosAuxiliares = async () => {
            try {
                const [rolesRes, cargosRes, especialidadesRes, unidadesRes] = await Promise.all([
                    api.get('/admin/role/all'),
                    api.get('/admin/cargo/all'),
                    api.get('/admin/medico/especialidade'),
                    api.get('/unidade/todas')
                ]);

                setRoles(rolesRes.data || []);
                setCargos(cargosRes.data || []);
                setEspecialidades(especialidadesRes.data || []);
                setUnidades(unidadesRes.data?.content || unidadesRes.data || []);
            } catch (error) {
                console.error('Erro ao carregar dados auxiliares:', error);
                mostrarToast('Erro ao carregar dados do sistema', 'error');
            }
        };
        carregarDadosAuxiliares();
    }, []);

    // Debounce para busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (busca.trim()) {
                buscarUsuarios(busca, 0);
            } else {
                setUsuarios([]);
                setPaginacao({ paginaAtual: 0, totalPaginas: 0, totalElementos: 0 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [busca, buscarUsuarios]);

    const mostrarToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // 🎯 FUNÇÃO MELHORADA: Verifica dependências antes de abrir modal + busca unidades
    const abrirModalRole = async (usuario, role) => {
        const rolesAtuais = getRolesAtuais(usuario);
        const roleConfig = HIERARQUIA_ROLES[role];
        
        // Verifica se tem as dependências necessárias
        const dependenciasFaltantes = roleConfig.dependeDe.filter(
            dep => !rolesAtuais.includes(dep)
        );

        if (dependenciasFaltantes.length > 0) {
            const mensagemDependencias = dependenciasFaltantes
                .map(dep => HIERARQUIA_ROLES[dep].nome)
                .join(', ');
            
            mostrarToast(
                `Para adicionar ${roleConfig.nome}, primeiro adicione: ${mensagemDependencias}`,
                'error'
            );
            return;
        }

        // 🆕 SE FOR MÉDICO: BUSCAR UNIDADES DO FUNCIONÁRIO
        if (role === 'MEDICO') {
            try {
                setLoading(true);
                // Buscar unidades do funcionário
                const response = await api.get(`/admin/funcionario/unidades/${usuario.id}`);
                const unidadesDoFuncionario = response.data || [];
                
                if (unidadesDoFuncionario.length === 0) {
                    mostrarToast('Funcionário não está vinculado a nenhuma unidade', 'error');
                    setLoading(false);
                    return;
                }
                
                setUsuarioSelecionado({
                    ...usuario,
                    unidadesDoFuncionario // 🎯 ADICIONAR UNIDADES AO USUÁRIO
                });
                setModalRoleAberto(role);
                
            } catch (error) {
                console.error('Erro ao buscar unidades do funcionário:', error);
                mostrarToast('Erro ao buscar unidades do funcionário', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            setUsuarioSelecionado(usuario);
            setModalRoleAberto(role);
        }
    };

    // 🎯 FUNÇÃO ATUALIZADA: Adiciona role com verificação de dependências E unidades
    const handleAdicionarRole = async (role, dadosEspecificos) => {
        setLoading(true);
        try {
            let endpoint = '';
            let data = {};

            switch (role) {
                case 'FUNCIONARIO':
                    endpoint = `/admin/funcionario/role/criar/${usuarioSelecionado.id}`;
                    data = {
                        idCargo: dadosEspecificos.idCargo,
                        dataAdmissao: dadosEspecificos.dataAdmissao,
                        salario: dadosEspecificos.salario,
                        idsUnidade: dadosEspecificos.idsUnidade || [],
                        tipoVinculo: dadosEspecificos.tipoVinculo
                    };
                    
                    // 🆕 VALIDAÇÃO DE UNIDADES
                    if (!dadosEspecificos.idsUnidade || dadosEspecificos.idsUnidade.length === 0) {
                        mostrarToast('Selecione pelo menos uma unidade', 'error');
                        setLoading(false);
                        return;
                    }
                    break;
                    
                case 'MEDICO':
                    // 🎯 VERIFICA SE É FUNCIONÁRIO ANTES DE CRIAR MÉDICO
                    if (!usuarioSelecionado.funcionario) {
                        mostrarToast('Usuário precisa ser funcionário antes de ser médico', 'error');
                        setLoading(false);
                        return;
                    }
                    
                    endpoint = `/admin/medico/role/criar/${usuarioSelecionado.id}`;
                    data = {
                        crm: dadosEspecificos.crm,
                        valorConsultaPresencial: dadosEspecificos.valorConsultaPresencial,
                        valorConsultaOnline: dadosEspecificos.valorConsultaOnline,
                        especialidadeIds: dadosEspecificos.especialidadeIds,
                        intervaloConsultaPresencialMinutos: dadosEspecificos.intervaloConsultaPresencialMinutos,
                        intervaloConsultaOnlineMinutos: dadosEspecificos.intervaloConsultaOnlineMinutos,
                        horariosDeTrabalho: dadosEspecificos.horariosDeTrabalho
                    };
                    
                    // 🆕 VALIDAÇÃO DE HORÁRIOS PARA MÉDICO
                    if (!dadosEspecificos.horariosDeTrabalho || dadosEspecificos.horariosDeTrabalho.length === 0) {
                        mostrarToast('É necessário definir pelo menos um horário de trabalho', 'error');
                        setLoading(false);
                        return;
                    }
                    break;
                    
                case 'COLETA':
                    // 🎯 VERIFICA SE É FUNCIONÁRIO ANTES DE CRIAR COLETOR
                    if (!usuarioSelecionado.funcionario) {
                        mostrarToast('Usuário precisa ser funcionário antes de ser coletor', 'error');
                        setLoading(false);
                        return;
                    }
                    endpoint = `/admin/coletor/horario/${usuarioSelecionado.id}`;
                    data = dadosEspecificos.horariosTrabalho;
                    break;
                    
                case 'PROFESSOR':
                    // 🎯 VERIFICA SE É FUNCIONÁRIO ANTES DE CRIAR PROFESSOR
                    if (!usuarioSelecionado.funcionario) {
                        mostrarToast('Usuário precisa ser funcionário antes de ser professor', 'error');
                        setLoading(false);
                        return;
                    }
                    endpoint = `/admin/professor/criar/${usuarioSelecionado.id}`;
                    data = {
                        formacao: dadosEspecificos.formacao,
                        especializacao: dadosEspecificos.especializacao,
                        valorHoraAula: parseFloat(dadosEspecificos.valorHoraAula) || 0,
                        registroProfissional: dadosEspecificos.registroProfissional || '',
                        corAgenda: dadosEspecificos.corAgenda || '#3b82f6',
                        biografia: dadosEspecificos.biografia || '',
                        ativo: dadosEspecificos.ativo !== false // Default true
                    };
                    break;
                    
                case 'PACIENTE':
                    endpoint = `/admin/paciente/criar/${usuarioSelecionado.id}`;
                    data = {
                        tipoSanguineo: dadosEspecificos.tipoSanguineo,
                        contatoEmergencia: dadosEspecificos.contatoEmergencia,
                        peso: dadosEspecificos.peso,
                        altura: dadosEspecificos.altura
                    };
                    break;
                    
                default:
                    endpoint = `/admin/usuarios/${usuarioSelecionado.id}/roles/${role}`;
                    data = dadosEspecificos;
            }

            await api.post(endpoint, data);
            mostrarToast(`${HIERARQUIA_ROLES[role].nome} adicionado com sucesso!`, 'success');
            fecharModal();
            // Atualizar busca
            buscarUsuarios(busca, paginacao.paginaAtual);
        } catch (error) {
            console.error('Erro ao adicionar role:', error);
            mostrarToast(error.response?.data?.message || `Erro ao adicionar ${HIERARQUIA_ROLES[role].nome}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoverRole = async (role) => {
        if (!window.confirm(`Tem certeza que deseja remover a role ${HIERARQUIA_ROLES[role]?.nome || role} deste usuário?`)) return;
        
        setLoading(true);
        try {
            let endpoint = '';
            
            switch (role) {
                case 'FUNCIONARIO':
                    endpoint = `/admin/funcionario/role/demitir/${usuarioSelecionado.id}`;
                    await api.put(endpoint);
                    break;
                case 'MEDICO':
                    endpoint = `/admin/medico/role/desativar/${usuarioSelecionado.id}`;
                    await api.put(endpoint);
                    break;
                case 'PROFESSOR':
                    endpoint = `/admin/professor/desativar/${usuarioSelecionado.id}`;
                    await api.put(endpoint);
                    break;
                case 'PACIENTE':
                    endpoint = `/admin/professor/desativar/${usuarioSelecionado.id}`;
                    await api.put(endpoint);
                    break;
                default:
                    endpoint = `/admin/usuarios/${usuarioSelecionado.id}/roles/${role}`;
                    await api.delete(endpoint);
            }

            // 🎯 SOLUÇÃO CRÍTICA: Força uma NOVA BUSCA dos dados atualizados
            if (busca.trim()) {
                await buscarUsuarios(busca, paginacao.paginaAtual);
            }
            
            mostrarToast(`${HIERARQUIA_ROLES[role]?.nome || role} removido com sucesso!`, 'success');
            
            // Fecha o modal se estiver aberto
            fecharModal();
            
        } catch (error) {
            console.error('Erro ao remover role:', error);
            mostrarToast(
                error.response?.data?.message || 
                error.message || 
                `Erro ao remover ${HIERARQUIA_ROLES[role]?.nome || role}`, 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const fecharModal = () => {
        setModalRoleAberto(null);
        setUsuarioSelecionado(null);
    };

    // Funções de formatação
    const formatarCPF = (cpf) => {
        if (!cpf) return '-';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    // Determinar roles atuais do usuário baseado no DTO
    const getRolesAtuais = (usuario) => {
        const rolesAtuais = [];
        
        if (usuario.funcionario === true) rolesAtuais.push('FUNCIONARIO');
        if (usuario.medico === true) rolesAtuais.push('MEDICO');
        if (usuario.paciente === true) rolesAtuais.push('PACIENTE');
        if (usuario.admin === true) rolesAtuais.push('ADMIN');
        if (usuario.recepcao === true) rolesAtuais.push('RECEPCAO');
        if (usuario.laboratorio === true) rolesAtuais.push('LABORATORIO');
        if (usuario.financeiro === true) rolesAtuais.push('FINANCEIRO');
        if (usuario.coleta === true) rolesAtuais.push('COLETA');
        if (usuario.professor === true) rolesAtuais.push('PROFESSOR');
        
        return rolesAtuais;
    };

    // 🎯 FUNÇÃO MELHORADA: Determinar roles disponíveis considerando hierarquia
    const getRolesDisponiveis = (usuario) => {
        const rolesAtuais = getRolesAtuais(usuario);
        
        return Object.keys(HIERARQUIA_ROLES).filter(role => {
            // Não mostrar roles que o usuário já tem
            if (rolesAtuais.includes(role)) return false;
            
            // Verificar se tem as dependências necessárias
            const roleConfig = HIERARQUIA_ROLES[role];
            const temDependencias = roleConfig.dependeDe.every(
                dep => rolesAtuais.includes(dep)
            );
            
            return temDependencias;
        });
    };

    // 🎯 FUNÇÃO MELHORADA: Verificar se role tem dependências pendentes
    const getDependenciasPendentes = (usuario, role) => {
        const rolesAtuais = getRolesAtuais(usuario);
        const roleConfig = HIERARQUIA_ROLES[role];
        
        return roleConfig.dependeDe.filter(
            dep => !rolesAtuais.includes(dep)
        );
    };

    return (
        <div style={styles.app.card}>
            {toast.show && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', padding: '12px 20px',
                    borderRadius: '8px', backgroundColor: toast.type === 'success' ? colors.success : colors.danger,
                    color: 'white', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}

            <header style={{ marginBottom: '30px' }}>
                <h2 style={styles.app.title}>Gerenciar Roles de Usuários</h2>
                <p style={{ color: colors.text_secondary, margin: '8px 0 0 0' }}>
                    Sistema hierárquico de roles - Algumas funções exigem dependências
                </p>
            </header>

            {/* Barra de Busca */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '15px',
                marginBottom: '30px',
                alignItems: 'end'
            }}>
                <div>
                    <label style={styles.app.label}>Buscar Usuário:</label>
                    <input
                        type="text"
                        style={styles.app.input}
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Digite nome, CPF ou email do usuário..."
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                        onClick={() => buscarUsuarios(busca, 0)}
                        style={{ ...styles.app.button, display: 'flex', alignItems: 'center', gap: '8px' }}
                        disabled={!busca.trim()}
                    >
                        <FiSearch /> Buscar
                    </button>
                </div>
            </div>

            {/* Contador de resultados */}
            {busca.trim() && usuarios.length > 0 && (
                <div style={{
                    padding: '10px 15px',
                    backgroundColor: colors.background_secondary,
                    borderRadius: '8px',
                    marginBottom: '15px',
                    fontSize: '14px',
                    color: colors.text_secondary
                }}>
                    Encontrados {paginacao.totalElementos} usuário(s) - Página {paginacao.paginaAtual + 1} de {paginacao.totalPaginas}
                </div>
            )}

            {/* Dica de uso */}
            {!busca.trim() && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: colors.text_secondary
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
                    <h3 style={{ color: colors.text_primary, marginBottom: '10px' }}>
                        Sistema Hierárquico de Roles
                    </h3>
                    <p>
                        Algumas funções exigem que o usuário tenha outras roles primeiro.
                    </p>
                    
                    {/* 🎯 LEGENDA DA HIERARQUIA */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '15px', 
                        marginTop: '30px',
                        maxWidth: '800px',
                        margin: '30px auto'
                    }}>
                        {/* Roles Base */}
                        <div style={{ textAlign: 'left' }}>
                            <h4 style={{ color: colors.primary, marginBottom: '10px' }}>🎯 Roles Base</h4>
                            {Object.entries(HIERARQUIA_ROLES)
                                .filter(([_, config]) => config.dependeDe.length === 0 && config.nome !== 'Admin')
                                .map(([role, config]) => (
                                    <div key={role} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px',
                                        marginBottom: '5px'
                                    }}>
                                        <span style={{ fontSize: '20px' }}>{config.icon}</span>
                                        <span>{config.nome}</span>
                                    </div>
                                ))}
                        </div>

                        {/* Roles que dependem de Funcionário */}
                        <div style={{ textAlign: 'left' }}>
                            <h4 style={{ color: colors.primary, marginBottom: '10px' }}>🏢 Requerem Funcionário</h4>
                            {Object.entries(HIERARQUIA_ROLES)
                                .filter(([_, config]) => config.dependeDe.includes('FUNCIONARIO'))
                                .map(([role, config]) => (
                                    <div key={role} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px',
                                        marginBottom: '5px'
                                    }}>
                                        <span style={{ fontSize: '20px' }}>{config.icon}</span>
                                        <span>{config.nome}</span>
                                        <span style={{ 
                                            fontSize: '10px', 
                                            color: colors.text_secondary,
                                            marginLeft: 'auto'
                                        }}>← Funcionário</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados da Busca */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={styles.app.text}>Buscando usuários...</p>
                </div>
            ) : busca.trim() && usuarios.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {usuarios.map(usuario => (
                        <UsuarioCard 
                            key={usuario.id}
                            usuario={usuario}
                            onAdicionarRole={abrirModalRole}
                            onRemoverRole={handleRemoverRole}
                            onSelecionarUsuario={setUsuarioSelecionado}
                            formatarCPF={formatarCPF}
                            getRolesAtuais={getRolesAtuais}
                            getRolesDisponiveis={getRolesDisponiveis}
                            getDependenciasPendentes={getDependenciasPendentes}
                            styles={styles}
                        />
                    ))}
                </div>
            ) : busca.trim() && !loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: colors.text_secondary }}>
                    <p>Nenhum usuário encontrado com os critérios de busca.</p>
                </div>
            ) : null}

            {/* Paginação */}
            {paginacao.totalPaginas > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '30px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => buscarUsuarios(busca, paginacao.paginaAtual - 1)}
                        disabled={paginacao.paginaAtual === 0}
                        style={{
                            ...styles.app.button,
                            backgroundColor: colors.secondary,
                            padding: '8px 16px'
                        }}
                    >
                        Anterior
                    </button>
                    
                    <span style={{ color: colors.text_secondary, fontSize: '14px' }}>
                        Página {paginacao.paginaAtual + 1} de {paginacao.totalPaginas}
                    </span>
                    
                    <button
                        onClick={() => buscarUsuarios(busca, paginacao.paginaAtual + 1)}
                        disabled={paginacao.paginaAtual >= paginacao.totalPaginas - 1}
                        style={{
                            ...styles.app.button,
                            backgroundColor: colors.secondary,
                            padding: '8px 16px'
                        }}
                    >
                        Próxima
                    </button>
                </div>
            )}

            {/* Modais de Roles */}
            {modalRoleAberto && usuarioSelecionado && (
                <RoleModal 
                    role={modalRoleAberto}
                    usuario={usuarioSelecionado}
                    onSave={handleAdicionarRole}
                    onClose={fecharModal}
                    cargos={cargos}
                    especialidades={especialidades}
                    unidades={unidades}
                    loading={loading}
                    styles={styles}
                />
            )}
        </div>
    );
};

// =================================================================
// 🎴 COMPONENTE DE CARD DO USUÁRIO (MELHORADO COM HIERARQUIA)
// =================================================================
const UsuarioCard = ({ 
    usuario, 
    onAdicionarRole, 
    onRemoverRole, 
    onSelecionarUsuario,
    formatarCPF, 
    getRolesAtuais,
    getRolesDisponiveis,
    getDependenciasPendentes,
    styles 
}) => {
    const { colors } = styles;

    const rolesAtuais = getRolesAtuais(usuario);
    const rolesDisponiveis = getRolesDisponiveis(usuario);

    return (
        <div style={{
            ...styles.app.card,
            border: `2px solid ${colors.border}`,
            padding: '20px',
            backgroundColor: colors.white
        }}>
            {/* Header do Card */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ 
                        margin: '0 0 8px 0', 
                        color: colors.text_primary,
                        fontSize: '18px'
                    }}>
                        {usuario.nome}
                    </h3>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '10px',
                        fontSize: '14px',
                        color: colors.text_secondary
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiMail size={14} />
                            <span>{usuario.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiUser size={14} />
                            <span>{formatarCPF(usuario.cpf)}</span>
                        </div>
                    </div>
                </div>

                {/* Badge de Idade */}
                {usuario.dataNascimento && (
                    <div style={{
                        padding: '6px 12px',
                        backgroundColor: colors.primary,
                        color: 'white',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {calcularIdade(usuario.dataNascimento)} anos
                    </div>
                )}
            </div>

            {/* 🎯 SEÇÃO: ROLES ATUAIS */}
            {rolesAtuais.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '14px',
                        color: colors.text_secondary
                    }}>
                        Roles Atuais:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {rolesAtuais.map(role => (
                            <div key={role} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                backgroundColor: HIERARQUIA_ROLES[role].color,
                                color: 'white',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                <span>{HIERARQUIA_ROLES[role].icon}</span>
                                <span>{HIERARQUIA_ROLES[role].nome}</span>
                                <button
                                    onClick={() => {
                                        onSelecionarUsuario(usuario);
                                        onRemoverRole(role);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        padding: '0',
                                        marginLeft: '4px'
                                    }}
                                    title={`Remover ${HIERARQUIA_ROLES[role].nome}`}
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🎯 SEÇÃO: ROLES DISPONÍVEIS */}
            {rolesDisponiveis.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '14px',
                        color: colors.text_secondary
                    }}>
                        Roles Disponíveis:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {rolesDisponiveis.map(role => (
                            <button
                                key={role}
                                onClick={() => {
                                    onSelecionarUsuario(usuario);
                                    onAdicionarRole(usuario, role);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    backgroundColor: `${HIERARQUIA_ROLES[role].color}20`,
                                    color: HIERARQUIA_ROLES[role].color,
                                    border: `1px solid ${HIERARQUIA_ROLES[role].color}`,
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = HIERARQUIA_ROLES[role].color;
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = `${HIERARQUIA_ROLES[role].color}20`;
                                    e.target.style.color = HIERARQUIA_ROLES[role].color;
                                }}
                            >
                                <span>{HIERARQUIA_ROLES[role].icon}</span>
                                <span>+ {HIERARQUIA_ROLES[role].nome}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 🎯 SEÇÃO: ROLES BLOQUEADAS (COM DEPENDÊNCIAS) */}
            {Object.keys(HIERARQUIA_ROLES)
                .filter(role => !rolesAtuais.includes(role) && !rolesDisponiveis.includes(role))
                .length > 0 && (
                <div>
                    <h4 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '14px',
                        color: colors.text_secondary
                    }}>
                        Roles Bloqueadas (Requerem dependências):
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Object.keys(HIERARQUIA_ROLES)
                            .filter(role => !rolesAtuais.includes(role) && !rolesDisponiveis.includes(role))
                            .map(role => {
                                const dependenciasPendentes = getDependenciasPendentes(usuario, role);
                                
                                return (
                                    <div
                                        key={role}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            backgroundColor: colors.background_secondary,
                                            color: colors.text_secondary,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            opacity: 0.6,
                                            cursor: 'not-allowed'
                                        }}
                                        title={`Requer: ${dependenciasPendentes.map(dep => HIERARQUIA_ROLES[dep].nome).join(', ')}`}
                                    >
                                        <span>{HIERARQUIA_ROLES[role].icon}</span>
                                        <span>{HIERARQUIA_ROLES[role].nome}</span>
                                        <FiAlertTriangle size={12} color={colors.warning} />
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {rolesAtuais.length === 0 && rolesDisponiveis.length === 0 && (
                <div style={{
                    padding: '15px',
                    backgroundColor: colors.background_secondary,
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: colors.text_secondary
                }}>
                    <p style={{ margin: 0 }}>Este usuário não possui roles e não há roles disponíveis</p>
                </div>
            )}
        </div>
    );
};

// =================================================================
// 🎯 MODAL UNIFICADO PARA TODAS AS ROLES (ATUALIZADO COM NOVOS CAMPOS DO PACIENTE)
// =================================================================
const RoleModal = ({ 
    role, 
    usuario, 
    onSave, 
    onClose, 
    cargos, 
    especialidades, 
    unidades, 
    loading, 
    styles 
}) => {
    const { colors } = styles;
    const [formData, setFormData] = useState({});
    const [unidadesDoFuncionario, setUnidadesDoFuncionario] = useState([]);
    const [imc, setImc] = useState(null);

    // 🆕 BUSCAR UNIDADES DO FUNCIONÁRIO QUANDO O MODAL FOR MÉDICO
    useEffect(() => {
        if (role === 'MEDICO' && usuario.id && usuario.unidadesDoFuncionario) {
            setUnidadesDoFuncionario(usuario.unidadesDoFuncionario || []);
        }
    }, [role, usuario]);

    // 🆕 CALCULAR IMC QUANDO PESO OU ALTURA MUDAR
    useEffect(() => {
        if (role === 'PACIENTE' && formData.peso && formData.altura) {
            const peso = parseFloat(formData.peso);
            const altura = parseFloat(formData.altura) / 100; // converter cm para m
            if (peso > 0 && altura > 0) {
                const imcCalculado = peso / (altura * altura);
                setImc(imcCalculado.toFixed(2));
            } else {
                setImc(null);
            }
        } else {
            setImc(null);
        }
    }, [role, formData.peso, formData.altura]);

    // 🆕 CONFIGURAÇÃO ATUALIZADA COM NOVOS CAMPOS DO PACIENTE
    const configRoles = {
        FUNCIONARIO: {
            titulo: 'Adicionar Funcionário',
            campos: [
                { name: 'idCargo', label: 'Cargo', type: 'select', options: cargos, required: true },
                { name: 'dataAdmissao', label: 'Data Admissão', type: 'date', required: true },
                { name: 'salario', label: 'Salário', type: 'number', step: '0.01', required: true },
                { name: 'idsUnidade', label: 'Unidades de Trabalho', type: 'multiselect-unidade', 
                  options: unidades, required: true },
                { name: 'tipoVinculo', label: 'Vínculo', type: 'select', 
                  options: ['CLT', 'PJ', 'ESTAGIO'], required: true }
            ]
        },
        MEDICO: {
            titulo: 'Adicionar Médico',
            campos: [
                { name: 'crm', label: 'CRM', type: 'text', required: true },
                { name: 'especialidadeIds', label: 'Especialidades', type: 'multiselect', 
                  options: especialidades, required: true },
                { name: 'valorConsultaPresencial', label: 'Valor Presencial (R$)', type: 'number', step: '0.01', required: true },
                { name: 'valorConsultaOnline', label: 'Valor Online (R$)', type: 'number', step: '0.01', required: true },
                { name: 'intervaloConsultaPresencialMinutos', label: 'Intervalo Presencial (min)', type: 'number', defaultValue: 30 },
                { name: 'intervaloConsultaOnlineMinutos', label: 'Intervalo Online (min)', type: 'number', defaultValue: 30 },
                { name: 'horariosDeTrabalho', label: 'Agenda por Unidade', type: 'horarios-medico', 
                  unidades: unidadesDoFuncionario, required: true }
            ]
        },
        COLETA: {
            titulo: 'Adicionar Coletor',
            campos: [
                { name: 'horariosTrabalho', label: 'Horários de Trabalho', type: 'horarios', unidades }
            ]
        },
        PACIENTE: {
            titulo: 'Adicionar Paciente',
            campos: [
                { name: 'tipoSanguineo', label: 'Tipo Sanguíneo', type: 'select-tipo-sanguineo', required: true },
                { name: 'contatoEmergencia', label: 'Contato de Emergência', type: 'text', required: true },
                { name: 'peso', label: 'Peso (kg)', type: 'number', step: '0.1', required: true },
                { name: 'altura', label: 'Altura (cm)', type: 'number', step: '0.1', required: true }
            ]
        },
        PROFESSOR: {
            titulo: 'Adicionar Professor',
            campos: [
                { name: 'formacao', label: 'Formação Acadêmica', type: 'text', required: true },
                { name: 'especializacao', label: 'Especialização', type: 'text', required: true },
                { name: 'valorHoraAula', label: 'Valor Hora/Aula (R$)', type: 'number', step: '0.01', required: true },
                { name: 'registroProfissional', label: 'Registro Profissional', type: 'text' },
                { name: 'corAgenda', label: 'Cor da Agenda', type: 'color' },
                { name: 'biografia', label: 'Biografia', type: 'textarea' },
                { name: 'ativo', label: 'Ativo', type: 'checkbox', default: true }
            ]
        }
    };

    const config = configRoles[role] || {
        titulo: `Adicionar ${HIERARQUIA_ROLES[role]?.nome || role}`,
        campos: []
    };

    // 🎯 INICIALIZAR FORMULÁRIO COM VALORES PADRÃO
    useEffect(() => {
        const valoresIniciais = {};
        
        if (role === 'PROFESSOR') {
            valoresIniciais.formacao = '';
            valoresIniciais.especializacao = '';
            valoresIniciais.valorHoraAula = '';
            valoresIniciais.registroProfissional = '';
            valoresIniciais.corAgenda = '#3b82f6';
            valoresIniciais.biografia = '';
            valoresIniciais.ativo = true;
        } else if (role === 'FUNCIONARIO') {
            valoresIniciais.dataAdmissao = new Date().toISOString().split('T')[0];
            valoresIniciais.salario = '';
            valoresIniciais.idsUnidade = [];
            valoresIniciais.tipoVinculo = 'CLT';
        } else if (role === 'MEDICO') {
            valoresIniciais.crm = '';
            valoresIniciais.valorConsultaPresencial = '';
            valoresIniciais.valorConsultaOnline = '';
            valoresIniciais.intervaloConsultaPresencialMinutos = 30;
            valoresIniciais.intervaloConsultaOnlineMinutos = 30;
            valoresIniciais.especialidadeIds = [];
            valoresIniciais.horariosDeTrabalho = [];
        } else if (role === 'PACIENTE') {
            valoresIniciais.tipoSanguineo = 'A_POSITIVO'; // Primeiro valor do enum como default
            valoresIniciais.contatoEmergencia = '';
            valoresIniciais.peso = '';
            valoresIniciais.altura = '';
        }
        
        setFormData(valoresIniciais);
    }, [role, usuario]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 🎯 VALIDAÇÃO ESPECÍFICA PARA PROFESSOR
        if (role === 'PROFESSOR') {
            if (!formData.formacao?.trim()) {
                mostrarToast('Formação acadêmica é obrigatória', 'error');
                return;
            }
            if (!formData.especializacao?.trim()) {
                mostrarToast('Especialização é obrigatória', 'error');
                return;
            }
            if (!formData.valorHoraAula || parseFloat(formData.valorHoraAula) <= 0) {
                mostrarToast('Valor hora/aula deve ser maior que zero', 'error');
                return;
            }
        }
        
        // 🎯 VALIDAÇÃO PARA FUNCIONÁRIO (COM UNIDADES)
        if (role === 'FUNCIONARIO') {
            if (!formData.idCargo) {
                mostrarToast('Cargo é obrigatório', 'error');
                return;
            }
            if (!formData.dataAdmissao) {
                mostrarToast('Data de admissão é obrigatória', 'error');
                return;
            }
            if (!formData.salario || parseFloat(formData.salario) <= 0) {
                mostrarToast('Salário deve ser maior que zero', 'error');
                return;
            }
            if (!formData.idsUnidade || formData.idsUnidade.length === 0) {
                mostrarToast('Selecione pelo menos uma unidade', 'error');
                return;
            }
        }
        
        // 🆕 VALIDAÇÃO PARA PACIENTE
        if (role === 'PACIENTE') {
            if (!formData.tipoSanguineo) {
                mostrarToast('Tipo sanguíneo é obrigatório', 'error');
                return;
            }
            if (!formData.contatoEmergencia?.trim()) {
                mostrarToast('Contato de emergência é obrigatório', 'error');
                return;
            }
            if (!formData.peso || parseFloat(formData.peso) <= 0) {
                mostrarToast('Peso deve ser maior que zero', 'error');
                return;
            }
            if (!formData.altura || parseFloat(formData.altura) <= 0) {
                mostrarToast('Altura deve ser maior que zero', 'error');
                return;
            }
        }
        
        // 🆕 VALIDAÇÃO PARA MÉDICO (COM HORÁRIOS POR UNIDADE)
        if (role === 'MEDICO') {
            if (!formData.crm?.trim()) {
                mostrarToast('CRM é obrigatório', 'error');
                return;
            }
            if (!formData.especialidadeIds || formData.especialidadeIds.length === 0) {
                mostrarToast('Selecione pelo menos uma especialidade', 'error');
                return;
            }
            if (!formData.valorConsultaPresencial || parseFloat(formData.valorConsultaPresencial) <= 0) {
                mostrarToast('Valor da consulta presencial deve ser maior que zero', 'error');
                return;
            }
            if (!formData.valorConsultaOnline || parseFloat(formData.valorConsultaOnline) <= 0) {
                mostrarToast('Valor da consulta online deve ser maior que zero', 'error');
                return;
            }
            if (!formData.horariosDeTrabalho || formData.horariosDeTrabalho.length === 0) {
                mostrarToast('Defina pelo menos um horário de trabalho', 'error');
                return;
            }
            
            // 🆕 VALIDAR SE TEM HORÁRIOS PARA CADA UNIDADE
            const unidadesComHorario = [...new Set(formData.horariosDeTrabalho
                .filter(h => h.idUnidade)
                .map(h => h.idUnidade))];
            
            if (unidadesComHorario.length === 0) {
                mostrarToast('Adicione horários para pelo menos uma unidade', 'error');
                return;
            }
        }
        
        await onSave(role, formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // 🎯 FUNÇÃO MELHORADA: Renderizar campos específicos (INCLUINDO TIPO SANGUÍNEO)
    const renderCampo = (campo) => {
        switch (campo.type) {
            case 'select':
                return (
                    <select
                        value={formData[campo.name] || ''}
                        onChange={(e) => handleChange(campo.name, e.target.value)}
                        style={styles.app.input}
                        required={campo.required}
                    >
                        <option value="">Selecione...</option>
                        {campo.options?.map(opt => (
                            <option key={opt.id || opt} value={opt.id || opt}>
                                {opt.nome || opt}
                            </option>
                        ))}
                    </select>
                );
            
            case 'select-tipo-sanguineo':
                return (
                    <div>
                        <select
                            value={formData[campo.name] || 'A_POSITIVO'}
                            onChange={(e) => handleChange(campo.name, e.target.value)}
                            style={styles.app.input}
                            required={campo.required}
                        >
                            {TIPOS_SANGUINEOS.map(tipo => (
                                <option key={tipo.valor} value={tipo.valor}>
                                    {tipo.nome} - {tipo.descricao}
                                </option>
                            ))}
                        </select>
                        <div style={{ 
                            marginTop: '8px', 
                            padding: '8px', 
                            backgroundColor: `${colors.primary}10`,
                            border: `1px solid ${colors.primary}`,
                            borderRadius: '6px',
                            fontSize: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiDroplet color={colors.primary} />
                                <span>
                                    Tipo sanguíneo é importante para emergências médicas
                                </span>
                            </div>
                        </div>
                    </div>
                );
            
            case 'multiselect':
                return (
                    <EspecialidadesSelector
                        especialidades={campo.options}
                        selecionadas={formData[campo.name] || []}
                        onChange={(ids) => handleChange(campo.name, ids)}
                        styles={styles}
                    />
                );
            
            case 'multiselect-unidade':
                return (
                    <UnidadesSelector
                        unidades={campo.options}
                        selecionadas={formData[campo.name] || []}
                        onChange={(ids) => handleChange(campo.name, ids)}
                        styles={styles}
                    />
                );
            
            case 'horarios-medico':
                return (
                    <HorariosMedicoComponent 
                        horarios={formData[campo.name] || []}
                        onChange={(horarios) => handleChange(campo.name, horarios)}
                        unidadesDoFuncionario={campo.unidades}
                        styles={styles}
                    />
                );
            
            case 'horarios':
                return (
                    <HorariosComponent 
                        horarios={formData[campo.name] || []}
                        onChange={(horarios) => handleChange(campo.name, horarios)}
                        unidades={campo.unidades}
                        styles={styles}
                    />
                );
            
            case 'textarea':
                return (
                    <textarea
                        value={formData[campo.name] || ''}
                        onChange={(e) => handleChange(campo.name, e.target.value)}
                        style={{ 
                            ...styles.app.input, 
                            minHeight: '100px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                        placeholder={campo.label}
                        rows={4}
                    />
                );
            
            case 'color':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="color"
                            value={formData[campo.name] || '#3b82f6'}
                            onChange={(e) => handleChange(campo.name, e.target.value)}
                            style={{
                                width: '60px',
                                height: '40px',
                                border: `2px solid ${colors.border}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                padding: '2px'
                            }}
                        />
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '2px'
                        }}>
                            <span style={{ 
                                fontSize: '14px', 
                                color: colors.text_secondary 
                            }}>
                                {formData[campo.name] || '#3b82f6'}
                            </span>
                            <span style={{ 
                                fontSize: '11px', 
                                color: colors.text_secondary,
                                opacity: 0.7
                            }}>
                                Clique para alterar
                            </span>
                        </div>
                    </div>
                );
            
            case 'checkbox':
                return (
                    <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '10px',
                        backgroundColor: colors.background_secondary,
                        borderRadius: '6px',
                        border: `1px solid ${colors.border}`,
                        marginTop: '5px'
                    }}>
                        <input
                            type="checkbox"
                            checked={formData[campo.name] ?? campo.default}
                            onChange={(e) => handleChange(campo.name, e.target.checked)}
                            style={{ 
                                width: '18px', 
                                height: '18px',
                                accentColor: colors.primary
                            }}
                        />
                        <div>
                            <span style={{ 
                                fontSize: '14px',
                                fontWeight: '500',
                                color: colors.text_primary
                            }}>
                                {campo.label}
                            </span>
                            <div style={{ 
                                fontSize: '12px', 
                                color: colors.text_secondary,
                                marginTop: '2px'
                            }}>
                                {formData[campo.name] !== false ? 
                                    '✅ Professor ativo no sistema' : 
                                    '❌ Professor inativo'
                                }
                            </div>
                        </div>
                    </label>
                );
            
            default:
                return (
                    <input
                        type={campo.type}
                        value={formData[campo.name] || ''}
                        onChange={(e) => handleChange(campo.name, e.target.value)}
                        style={styles.app.input}
                        placeholder={campo.label}
                        step={campo.step}
                        required={campo.required}
                        defaultValue={campo.defaultValue}
                    />
                );
        }
    };

    // 🆕 FUNÇÃO PARA CLASSIFICAR IMC
    const getClassificacaoImc = (imc) => {
        if (!imc) return null;
        const imcNum = parseFloat(imc);
        if (imcNum < 18.5) return { texto: 'Abaixo do peso', cor: colors.warning };
        if (imcNum < 25) return { texto: 'Peso normal', cor: colors.success };
        if (imcNum < 30) return { texto: 'Sobrepeso', cor: colors.warning };
        if (imcNum < 35) return { texto: 'Obesidade Grau I', cor: colors.danger };
        if (imcNum < 40) return { texto: 'Obesidade Grau II', cor: colors.danger };
        return { texto: 'Obesidade Grau III', cor: colors.danger };
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={{
                ...modalContentStyle(styles),
                width: role === 'PROFESSOR' ? '700px' : 
                       role === 'MEDICO' ? '750px' :
                       role === 'FUNCIONARIO' ? '650px' : 
                       role === 'PACIENTE' ? '600px' : '600px',
                maxWidth: '95vw'
            }}>
                <div style={{
                    ...modalHeaderStyle(styles),
                    backgroundColor: HIERARQUIA_ROLES[role]?.color || colors.primary
                }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>
                            {HIERARQUIA_ROLES[role]?.icon}
                        </span>
                        {config.titulo}
                    </h3>
                    <button onClick={onClose} style={closeButtonStyle}>✕</button>
                </div>

                <div style={{ padding: '25px', maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ 
                        backgroundColor: colors.background_secondary, 
                        padding: '15px', 
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Usuário:</p>
                        <p style={{ margin: 0 }}>{usuario.nome} - {usuario.email}</p>
                        
                        {/* 🎯 INDICADOR DE DEPENDÊNCIAS */}
                        {HIERARQUIA_ROLES[role]?.dependeDe.length > 0 && (
                            <div style={{ 
                                marginTop: '10px',
                                padding: '8px',
                                backgroundColor: `${colors.success}20`,
                                border: `1px solid ${colors.success}`,
                                borderRadius: '6px',
                                fontSize: '12px'
                            }}>
                                <strong>✅ Dependências atendidas:</strong>{' '}
                                {HIERARQUIA_ROLES[role].dependeDe.map(dep => 
                                    HIERARQUIA_ROLES[dep].nome
                                ).join(', ')}
                            </div>
                        )}
                        
                        {/* 🆕 INFO DAS UNIDADES DO FUNCIONÁRIO (PARA MÉDICO) */}
                        {role === 'MEDICO' && unidadesDoFuncionario.length > 0 && (
                            <div style={{ 
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: `${colors.info}10`,
                                border: `1px solid ${colors.info}`,
                                borderRadius: '6px'
                            }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiHome size={14} /> Unidades Vinculadas:
                                </strong>
                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '5px', 
                                    marginTop: '5px' 
                                }}>
                                    {unidadesDoFuncionario.map(unidade => (
                                        <span key={unidade.id} style={{
                                            padding: '4px 8px',
                                            backgroundColor: colors.primary,
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '11px'
                                        }}>
                                            {unidade.nome}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* 🆕 MOSTRAR IMC PARA PACIENTE */}
                        {role === 'PACIENTE' && imc && (
                            <div style={{ 
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: `${colors.info}10`,
                                border: `1px solid ${colors.info}`,
                                borderRadius: '6px'
                            }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiActivity size={14} /> IMC Calculado:
                                </strong>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    marginTop: '5px'
                                }}>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        {imc}
                                    </span>
                                    {getClassificacaoImc(imc) && (
                                        <span style={{ 
                                            padding: '4px 8px',
                                            backgroundColor: getClassificacaoImc(imc).cor,
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {getClassificacaoImc(imc).texto}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '20px',
                            ...(role === 'PROFESSOR' && {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px'
                            }),
                            ...(role === 'MEDICO' && {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px'
                            }),
                            ...(role === 'PACIENTE' && {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px'
                            })
                        }}>
                            {config.campos.map((campo, index) => (
                                <div key={campo.name} style={{
                                    ...(role === 'PROFESSOR' && [
                                        'biografia', 'ativo'
                                    ].includes(campo.name) && {
                                        gridColumn: '1 / -1'
                                    }),
                                    ...(role === 'MEDICO' && [
                                        'horariosDeTrabalho', 'especialidadeIds'
                                    ].includes(campo.name) && {
                                        gridColumn: '1 / -1'
                                    }),
                                    ...(role === 'PACIENTE' && [
                                        'tipoSanguineo', 'contatoEmergencia'
                                    ].includes(campo.name) && {
                                        gridColumn: '1 / -1'
                                    }),
                                    ...(role === 'PROFESSOR' && campo.name === 'biografia' && {
                                        minHeight: '150px'
                                    }),
                                    ...(role === 'FUNCIONARIO' && campo.name === 'idsUnidade' && {
                                        minHeight: '150px'
                                    }),
                                    ...(role === 'MEDICO' && campo.name === 'horariosDeTrabalho' && {
                                        minHeight: '300px'
                                    })
                                }}>
                                    <label style={{
                                        ...styles.app.label,
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600'
                                    }}>
                                        {campo.label} {campo.required && '*'}
                                        
                                        {/* 🎯 DICAS PARA CAMPOS ESPECÍFICOS */}
                                        {role === 'PROFESSOR' && campo.name === 'corAgenda' && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                color: colors.text_secondary,
                                                fontWeight: 'normal',
                                                marginLeft: '8px'
                                            }}>
                                                (identificação visual)
                                            </span>
                                        )}
                                        
                                        {role === 'FUNCIONARIO' && campo.name === 'idsUnidade' && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                color: colors.text_secondary,
                                                fontWeight: 'normal',
                                                marginLeft: '8px'
                                            }}>
                                                (pode selecionar várias)
                                            </span>
                                        )}
                                        
                                        {role === 'PACIENTE' && campo.name === 'tipoSanguineo' && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                color: colors.text_secondary,
                                                fontWeight: 'normal',
                                                marginLeft: '8px'
                                            }}>
                                                (para emergências médicas)
                                            </span>
                                        )}
                                        
                                        {role === 'PACIENTE' && campo.name === 'contatoEmergencia' && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                color: colors.text_secondary,
                                                fontWeight: 'normal',
                                                marginLeft: '8px'
                                            }}>
                                                (telefone para emergências)
                                            </span>
                                        )}
                                    </label>
                                    
                                    {renderCampo(campo)}
                                    
                                    {/* 🎯 DESCRIÇÕES ADICIONAIS */}
                                    {role === 'PROFESSOR' && campo.name === 'registroProfissional' && (
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: colors.text_secondary,
                                            margin: '5px 0 0 0',
                                            fontStyle: 'italic'
                                        }}>
                                            Ex: CREF, registro no MEC, etc.
                                        </p>
                                    )}
                                    
                                    {role === 'PROFESSOR' && campo.name === 'biografia' && (
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: colors.text_secondary,
                                            margin: '5px 0 0 0',
                                            fontStyle: 'italic'
                                        }}>
                                            Descrição profissional que aparecerá no perfil
                                        </p>
                                    )}
                                    
                                    {role === 'PROFESSOR' && campo.name === 'valorHoraAula' && (
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: colors.text_secondary,
                                            margin: '5px 0 0 0',
                                            fontStyle: 'italic'
                                        }}>
                                            Valor cobrado por hora/aula
                                        </p>
                                    )}
                                    
                                    {role === 'FUNCIONARIO' && campo.name === 'idsUnidade' && (
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: colors.text_secondary,
                                            margin: '5px 0 0 0',
                                            fontStyle: 'italic'
                                        }}>
                                            Unidades onde o funcionário irá trabalhar
                                        </p>
                                    )}
                                    
                                    {role === 'PACIENTE' && campo.name === 'peso' && (
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: colors.text_secondary,
                                            margin: '5px 0 0 0',
                                            fontStyle: 'italic'
                                        }}>
                                            Em quilogramas (ex: 70.5)
                                        </p>
                                    )}
                                    
                                    {role === 'PACIENTE' && campo.name === 'altura' && (
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: colors.text_secondary,
                                            margin: '5px 0 0 0',
                                            fontStyle: 'italic'
                                        }}>
                                            Em centímetros (ex: 175)
                                        </p>
                                    )}
                                    
                                    {role === 'PACIENTE' && campo.name === 'contatoEmergencia' && (
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: colors.text_secondary,
                                            margin: '5px 0 0 0',
                                            fontStyle: 'italic'
                                        }}>
                                            Telefone com DDD (ex: 11 99999-9999)
                                        </p>
                                    )}
                                </div>
                            ))}

                            {config.campos.length === 0 && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '40px',
                                    color: colors.text_secondary,
                                    gridColumn: '1 / -1'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                                        {HIERARQUIA_ROLES[role]?.icon}
                                    </div>
                                    <p>Esta role não requer informações adicionais.</p>
                                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                                        Clique em "Adicionar" para confirmar.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div style={modalFooterStyle(styles)}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    ...secondaryButtonStyle(styles),
                                    padding: '12px 24px'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...primaryButtonStyle(styles),
                                    backgroundColor: HIERARQUIA_ROLES[role]?.color || colors.success,
                                    padding: '12px 24px'
                                }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid transparent',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Salvando...
                                    </span>
                                ) : (
                                    `Adicionar ${HIERARQUIA_ROLES[role]?.nome || role}`
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* 🎯 ESTILO PARA ANIMAÇÃO DE LOADING */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

// =================================================================
// 📅 COMPONENTES AUXILIARES (ATUALIZADOS)
// =================================================================

// 🆕 COMPONENTE MELHORADO: Horários para Médico (por unidade)
const HorariosMedicoComponent = ({ 
    horarios, 
    onChange, 
    unidadesDoFuncionario, 
    styles 
}) => {
    const [localHorarios, setLocalHorarios] = useState(horarios || []);

    const tiposConsulta = [
        { valor: 'PRESENCIAL', nome: 'Presencial', icon: '🏢' },
        { valor: 'ONLINE', nome: 'Online', icon: '💻' }
    ];

    const diasDaSemana = [
        { nome: 'Segunda', valor: 'MONDAY', short: 'SEG' },
        { nome: 'Terça', valor: 'TUESDAY', short: 'TER' },
        { nome: 'Quarta', valor: 'WEDNESDAY', short: 'QUA' },
        { nome: 'Quinta', valor: 'THURSDAY', short: 'QUI' },
        { nome: 'Sexta', valor: 'FRIDAY', short: 'SEX' },
        { nome: 'Sábado', valor: 'SATURDAY', short: 'SAB' },
        { nome: 'Domingo', valor: 'SUNDAY', short: 'DOM' },
    ];

    const adicionarHorario = () => {
        const novoHorario = {
            tipoConsulta: 'PRESENCIAL',
            diaDaSemana: 'MONDAY',
            horaInicio: '08:00',
            horaFim: '12:00',
            idUnidade: unidadesDoFuncionario[0]?.id || null
        };
        const novosHorarios = [...localHorarios, novoHorario];
        setLocalHorarios(novosHorarios);
        onChange(novosHorarios);
    };

    const adicionarHorarioEmMassa = () => {
        const novosHorarios = [...localHorarios];
        
        // Adiciona horário padrão para cada unidade (segunda a sexta, 8h-12h)
        unidadesDoFuncionario.forEach(unidade => {
            ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].forEach(dia => {
                novosHorarios.push({
                    tipoConsulta: 'PRESENCIAL',
                    diaDaSemana: dia,
                    horaInicio: '08:00',
                    horaFim: '12:00',
                    idUnidade: unidade.id
                });
            });
        });
        
        setLocalHorarios(novosHorarios);
        onChange(novosHorarios);
    };

    const atualizarHorario = (index, campo, valor) => {
        const novosHorarios = localHorarios.map((horario, i) => 
            i === index ? { ...horario, [campo]: valor } : horario
        );
        setLocalHorarios(novosHorarios);
        onChange(novosHorarios);
    };

    const removerHorario = (index) => {
        const novosHorarios = localHorarios.filter((_, i) => i !== index);
        setLocalHorarios(novosHorarios);
        onChange(novosHorarios);
    };

    // 🆕 FUNÇÃO PARA AGRUPAR HORÁRIOS POR UNIDADE
    const getHorariosPorUnidade = () => {
        const grupos = {};
        
        localHorarios.forEach(horario => {
            const unidadeId = horario.idUnidade || 'online';
            const unidadeNome = horario.idUnidade 
                ? unidadesDoFuncionario.find(u => u.id === horario.idUnidade)?.nome 
                : 'Online';
            
            if (!grupos[unidadeId]) {
                grupos[unidadeId] = {
                    nome: unidadeNome,
                    horarios: [],
                    tipo: horario.idUnidade ? 'presencial' : 'online'
                };
            }
            grupos[unidadeId].horarios.push(horario);
        });
        
        return grupos;
    };

    const gruposHorarios = getHorariosPorUnidade();

    return (
        <div style={{ 
            border: `1px solid ${styles.colors.border}`, 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: styles.colors.background
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div>
                    <label style={{ fontWeight: '500', fontSize: '14px' }}>
                        Agenda por Unidade
                    </label>
                    <p style={{ 
                        fontSize: '12px', 
                        color: styles.colors.text_secondary,
                        marginTop: '4px',
                        maxWidth: '500px'
                    }}>
                        Configure os horários de atendimento para cada unidade vinculada ao funcionário
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        type="button" 
                        onClick={adicionarHorario}
                        style={{ 
                            ...styles.app.button, 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            backgroundColor: styles.colors.primary
                        }}
                    >
                        <FiClock style={{ marginRight: '4px' }} /> + Horário
                    </button>
                    {unidadesDoFuncionario.length > 0 && (
                        <button 
                            type="button" 
                            onClick={adicionarHorarioEmMassa}
                            style={{ 
                                ...styles.app.button, 
                                padding: '6px 12px', 
                                fontSize: '12px',
                                backgroundColor: styles.colors.success
                            }}
                        >
                            <FiCalendar style={{ marginRight: '4px' }} /> + Todos os dias
                        </button>
                    )}
                </div>
            </div>
            
            {/* 🆕 VISUALIZAÇÃO AGRUPADA POR UNIDADE */}
            {Object.keys(gruposHorarios).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                        fontSize: '13px', 
                        color: styles.colors.text_secondary,
                        marginBottom: '10px',
                        fontWeight: '500'
                    }}>
                        Horários Configurados:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {Object.entries(gruposHorarios).map(([unidadeId, grupo]) => (
                            <div key={unidadeId} style={{
                                padding: '12px',
                                backgroundColor: grupo.tipo === 'online' 
                                    ? `${styles.colors.info}10` 
                                    : `${styles.colors.primary}10`,
                                border: `1px solid ${grupo.tipo === 'online' 
                                    ? styles.colors.info 
                                    : styles.colors.primary}`,
                                borderRadius: '8px',
                                flex: '1',
                                minWidth: '200px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ fontSize: '16px' }}>
                                        {grupo.tipo === 'online' ? '💻' : '🏢'}
                                    </span>
                                    <strong style={{ fontSize: '13px' }}>{grupo.nome}</strong>
                                    <span style={{ 
                                        fontSize: '10px', 
                                        backgroundColor: grupo.tipo === 'online' 
                                            ? styles.colors.info 
                                            : styles.colors.primary,
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        marginLeft: 'auto'
                                    }}>
                                        {grupo.horarios.length} horário(s)
                                    </span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '5px',
                                    fontSize: '11px'
                                }}>
                                    {grupo.horarios.slice(0, 3).map((horario, idx) => (
                                        <span key={idx} style={{
                                            padding: '2px 6px',
                                            backgroundColor: styles.colors.background_secondary,
                                            borderRadius: '4px'
                                        }}>
                                            {diasDaSemana.find(d => d.valor === horario.diaDaSemana)?.short}: {horario.horaInicio}-{horario.horaFim}
                                        </span>
                                    ))}
                                    {grupo.horarios.length > 3 && (
                                        <span style={{
                                            padding: '2px 6px',
                                            backgroundColor: styles.colors.background_secondary,
                                            borderRadius: '4px',
                                            fontStyle: 'italic'
                                        }}>
                                            +{grupo.horarios.length - 3} mais
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* LISTA DE HORÁRIOS PARA EDIÇÃO */}
            <div style={{ 
                maxHeight: '250px', 
                overflowY: 'auto',
                border: `1px solid ${styles.colors.border}`,
                borderRadius: '6px',
                padding: '10px'
            }}>
                {localHorarios.map((horario, index) => (
                    <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 0.5fr', 
                        gap: '8px', 
                        alignItems: 'center', 
                        marginBottom: '8px',
                        padding: '8px',
                        backgroundColor: index % 2 === 0 ? styles.colors.background_secondary : 'transparent',
                        borderRadius: '6px'
                    }}>
                        {/* Tipo de Consulta */}
                        <select
                            value={horario.tipoConsulta || 'PRESENCIAL'}
                            onChange={(e) => atualizarHorario(index, 'tipoConsulta', e.target.value)}
                            style={{ 
                                ...styles.app.input, 
                                padding: '6px 8px',
                                fontSize: '12px'
                            }}
                        >
                            {tiposConsulta.map(tipo => (
                                <option key={tipo.valor} value={tipo.valor}>
                                    {tipo.icon} {tipo.nome}
                                </option>
                            ))}
                        </select>
                        
                        {/* Dia da Semana */}
                        <select
                            value={horario.diaDaSemana || 'MONDAY'} 
                            onChange={(e) => atualizarHorario(index, 'diaDaSemana', e.target.value)}
                            style={{ 
                                ...styles.app.input, 
                                padding: '6px 8px',
                                fontSize: '12px'
                            }}
                        >
                            {diasDaSemana.map(dia => (
                                <option key={dia.valor} value={dia.valor}>
                                    {dia.short}
                                </option>
                            ))}
                        </select>
                        
                        {/* Hora Início */}
                        <input 
                            type="time" 
                            value={horario.horaInicio} 
                            onChange={(e) => atualizarHorario(index, 'horaInicio', e.target.value)} 
                            style={{ 
                                ...styles.app.input, 
                                padding: '6px 8px',
                                fontSize: '12px'
                            }} 
                        />
                        
                        {/* Hora Fim */}
                        <input 
                            type="time" 
                            value={horario.horaFim} 
                            onChange={(e) => atualizarHorario(index, 'horaFim', e.target.value)} 
                            style={{ 
                                ...styles.app.input, 
                                padding: '6px 8px',
                                fontSize: '12px'
                            }} 
                        />
                        
                        {/* Unidade (só para PRESENCIAL) */}
                        <select
                            value={horario.idUnidade || ''}
                            onChange={(e) => atualizarHorario(index, 'idUnidade', e.target.value === '' ? null : e.target.value)}
                            style={{ 
                                ...styles.app.input, 
                                padding: '6px 8px',
                                fontSize: '12px',
                                backgroundColor: horario.tipoConsulta === 'ONLINE' ? styles.colors.background_secondary : 'white'
                            }}
                            disabled={horario.tipoConsulta === 'ONLINE'}
                        >
                            {horario.tipoConsulta === 'ONLINE' ? (
                                <option value="">💻 Online</option>
                            ) : (
                                <>
                                    <option value="">Selecione...</option>
                                    {unidadesDoFuncionario.map(unidade => (
                                        <option key={unidade.id} value={unidade.id}>
                                            🏢 {unidade.nome.substring(0, 15)}...
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        
                        {/* Botão Remover */}
                        <button 
                            type="button" 
                            onClick={() => removerHorario(index)} 
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: styles.colors.danger,
                                textAlign: 'right',
                                padding: '4px'
                            }}
                            title="Remover horário"
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                ))}
                
                {localHorarios.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '30px',
                        color: styles.colors.text_secondary,
                        fontStyle: 'italic'
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                        <p>Nenhum horário cadastrado</p>
                        <p style={{ fontSize: '12px', marginTop: '5px' }}>
                            Clique em "+ Horário" para adicionar o primeiro horário
                        </p>
                    </div>
                )}
            </div>
            
            {/* 🆕 RESUMO DE CONFIGURAÇÃO */}
            {localHorarios.length > 0 && (
                <div style={{ 
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: `${styles.colors.success}10`,
                    border: `1px solid ${styles.colors.success}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                }}>
                    <strong>✅ Resumo da Agenda:</strong>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '10px',
                        marginTop: '8px'
                    }}>
                        <div>
                            <strong>Total de Horários:</strong> {localHorarios.length}
                        </div>
                        <div>
                            <strong>Presenciais:</strong> {localHorarios.filter(h => h.tipoConsulta === 'PRESENCIAL').length}
                        </div>
                        <div>
                            <strong>Online:</strong> {localHorarios.filter(h => h.tipoConsulta === 'ONLINE').length}
                        </div>
                        <div>
                            <strong>Unidades:</strong> {[...new Set(localHorarios.filter(h => h.idUnidade).map(h => h.idUnidade))].length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 🆕 COMPONENTE NOVO: Seleção de Unidades
const UnidadesSelector = ({ unidades, selecionadas, onChange, styles }) => {
    const toggleUnidade = (id) => {
        const novasSelecionadas = selecionadas.includes(id)
            ? selecionadas.filter(u => u !== id)
            : [...selecionadas, id];
        onChange(novasSelecionadas);
    };

    return (
        <div style={{ 
            border: `1px solid ${styles.colors.border}`, 
            padding: '15px', 
            borderRadius: '8px',
            maxHeight: '200px',
            overflowY: 'auto'
        }}>
            <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '500',
                color: styles.colors.text_primary
            }}>
                Unidades Disponíveis:
            </label>
            
            {unidades.length === 0 ? (
                <p style={{ 
                    color: styles.colors.text_secondary, 
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    Nenhuma unidade cadastrada
                </p>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '10px'
                }}>
                    {unidades.map(unidade => (
                        <label key={unidade.id} style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: '10px', 
                            cursor: 'pointer', 
                            fontSize: '14px',
                            padding: '10px',
                            border: `1px solid ${selecionadas.includes(unidade.id) ? styles.colors.primary : styles.colors.border}`,
                            borderRadius: '6px',
                            backgroundColor: selecionadas.includes(unidade.id) ? 
                                `${styles.colors.primary}10` : 'transparent',
                            transition: 'all 0.2s ease'
                        }}>
                            <input
                                type="checkbox"
                                checked={selecionadas.includes(unidade.id)}
                                onChange={() => toggleUnidade(unidade.id)}
                                style={{
                                    marginTop: '3px',
                                    accentColor: styles.colors.primary
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontWeight: '500',
                                    color: selecionadas.includes(unidade.id) ? 
                                        styles.colors.primary : styles.colors.text_primary,
                                    marginBottom: '2px'
                                }}>
                                    {unidade.nome}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: styles.colors.text_secondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <FiMapPin size={10} />
                                    {unidade.endereco?.logradouro}, {unidade.endereco?.numero} - {unidade.endereco?.bairro}
                                </div>
                                {unidade.cnpj && (
                                    <div style={{ 
                                        fontSize: '11px', 
                                        color: styles.colors.text_secondary,
                                        marginTop: '2px'
                                    }}>
                                        CNPJ: {formatarCNPJ(unidade.cnpj)}
                                    </div>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
            )}
            
            {selecionadas.length > 0 && (
                <div style={{ 
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: `${styles.colors.success}10`,
                    border: `1px solid ${styles.colors.success}`,
                    borderRadius: '6px',
                    fontSize: '13px'
                }}>
                    <strong>✅ Selecionadas:</strong> {selecionadas.length} unidade(s)
                </div>
            )}
        </div>
    );
};

// Componente de Horários (Reutilizável)
const HorariosComponent = ({ horarios, onChange, unidades, styles }) => {
    const [localHorarios, setLocalHorarios] = useState(horarios || []);

    const diasDaSemana = [
        { nome: 'Segunda', valor: 'MONDAY' },
        { nome: 'Terça', valor: 'TUESDAY' },
        { nome: 'Quarta', valor: 'WEDNESDAY' },
        { nome: 'Quinta', valor: 'THURSDAY' },
        { nome: 'Sexta', valor: 'FRIDAY' },
        { nome: 'Sábado', valor: 'SATURDAY' },
        { nome: 'Domingo', valor: 'SUNDAY' },
    ];

    const adicionarHorario = () => {
        const novoHorario = {
            idUnidade: unidades[0]?.id || '',
            diaDaSemana: 'MONDAY',
            horaInicio: '08:00',
            horaFim: '17:00'
        };
        const novosHorarios = [...localHorarios, novoHorario];
        setLocalHorarios(novosHorarios);
        onChange(novosHorarios);
    };

    const atualizarHorario = (index, campo, valor) => {
        const novosHorarios = localHorarios.map((horario, i) => 
            i === index ? { ...horario, [campo]: valor } : horario
        );
        setLocalHorarios(novosHorarios);
        onChange(novosHorarios);
    };

    const removerHorario = (index) => {
        const novosHorarios = localHorarios.filter((_, i) => i !== index);
        setLocalHorarios(novosHorarios);
        onChange(novosHorarios);
    };

    return (
        <div style={{ border: `1px solid ${styles.colors.border}`, padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <label style={{ fontWeight: '500' }}>Horários de Trabalho:</label>
                <button 
                    type="button" 
                    onClick={adicionarHorario}
                    style={{ ...styles.app.button, padding: '5px 10px', fontSize: '12px' }}
                >
                    + Adicionar Horário
                </button>
            </div>
            
            {localHorarios.map((horario, index) => (
                <div key={index} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.5fr', 
                    gap: '10px', 
                    alignItems: 'center', 
                    marginBottom: '10px' 
                }}>
                    <select
                        value={horario.idUnidade || ''}
                        onChange={(e) => atualizarHorario(index, 'idUnidade', e.target.value)}
                        style={{ ...styles.app.input, padding: '8px' }}
                    >
                        <option value="">Selecione...</option>
                        {unidades.map(unidade => (
                            <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                        ))}
                    </select>
                    
                    <select
                        value={horario.diaDaSemana || 'MONDAY'} 
                        onChange={(e) => atualizarHorario(index, 'diaDaSemana', e.target.value)}
                        style={{ ...styles.app.input, padding: '8px' }}
                    >
                        {diasDaSemana.map(dia => (
                            <option key={dia.valor} value={dia.valor}>{dia.nome}</option>
                        ))}
                    </select>
                    
                    <input 
                        type="time" 
                        value={horario.horaInicio} 
                        onChange={(e) => atualizarHorario(index, 'horaInicio', e.target.value)} 
                        style={{ ...styles.app.input, padding: '8px' }} 
                    />
                    <input 
                        type="time" 
                        value={horario.horaFim} 
                        onChange={(e) => atualizarHorario(index, 'horaFim', e.target.value)} 
                        style={{ ...styles.app.input, padding: '8px' }} 
                    />
                    
                    <button 
                        type="button" 
                        onClick={() => removerHorario(index)} 
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: styles.colors.danger,
                            textAlign: 'right'
                        }}
                    >
                        <FiX size={16} />
                    </button>
                </div>
            ))}
            
            {localHorarios.length === 0 && (
                <p style={{ color: styles.colors.text_secondary, fontStyle: 'italic', textAlign: 'center' }}>
                    Nenhum horário definido
                </p>
            )}
        </div>
    );
};

// Componente de Seleção de Especialidades
const EspecialidadesSelector = ({ especialidades, selecionadas, onChange, styles }) => {
    const toggleEspecialidade = (id) => {
        const novasSelecionadas = selecionadas.includes(id)
            ? selecionadas.filter(e => e !== id)
            : [...selecionadas, id];
        onChange(novasSelecionadas);
    };

    return (
        <div style={{ border: `1px solid ${styles.colors.border}`, padding: '15px', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>Especialidades:</label>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '10px', 
                maxHeight: '150px', 
                overflowY: 'auto' 
            }}>
                {especialidades.map(esp => (
                    <label key={esp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                            type="checkbox"
                            checked={selecionadas.includes(esp.id)}
                            onChange={() => toggleEspecialidade(esp.id)}
                        />
                        {esp.nome}
                    </label>
                ))}
            </div>
        </div>
    );
};

// =================================================================
// 🎨 ESTILOS PARA MODAIS (MANTIDOS)
// =================================================================
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
};

const modalContentStyle = (styles) => ({
    backgroundColor: styles.colors.background,
    borderRadius: '10px',
    padding: '0',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'hidden',
    width: '600px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
});

const modalHeaderStyle = (styles) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: `1px solid ${styles.colors.border}`,
    backgroundColor: styles.colors.primary,
    color: 'white'
});

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'white'
};

const modalFooterStyle = (styles) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px 25px',
    borderTop: `1px solid ${styles.colors.border}`,
    backgroundColor: styles.colors.backgroundLight,
    marginTop: '20px'
});

const secondaryButtonStyle = (styles) => ({
    ...styles.app.button,
    backgroundColor: styles.colors.secondary
});

const primaryButtonStyle = (styles) => ({
    ...styles.app.button,
    backgroundColor: styles.colors.success
});

// =================================================================
// 📋 FUNÇÕES AUXILIARES (ATUALIZADAS)
// =================================================================
const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '-';
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
};

// 🆕 FUNÇÃO NOVA: Formatar CNPJ
const formatarCNPJ = (cnpj) => {
    if (!cnpj) return '-';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

// 🆕 FUNÇÃO PARA MOSTRAR TOAST
const mostrarToast = (message, type) => {
    // Esta função será implementada no componente pai
    console.log(`${type}: ${message}`);
};

export default GerenciarRoles;