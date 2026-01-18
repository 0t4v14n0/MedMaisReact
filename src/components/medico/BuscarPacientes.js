import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { useTheme } from '../../contexts/ThemeContext';
import { generateStyles } from '../../styles/globalStyles';
import { 
    FiSearch, FiUser, FiFileText, FiClock, FiPhone, FiMail, 
    FiMapPin, FiActivity, FiX, FiFilter, FiAlertCircle, FiCalendar 
} from 'react-icons/fi';

// =================================================================
// 🎨 UI COMPONENTS (WELLNESS DESIGN SYSTEM)
// =================================================================

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);
    return matches;
};

const SearchInput = ({ value, onChange, placeholder, styles }) => (
    <div style={{ position: 'relative', width: '100%' }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: styles.colors.textMuted, fontSize: '18px' }} />
        <input 
            type="text" value={value} onChange={onChange} placeholder={placeholder}
            style={{
                width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px',
                border: `1px solid ${styles.colors.border}`, backgroundColor: styles.colors.white,
                color: styles.colors.textDark, fontSize: '15px', outline: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s',
                boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = styles.colors.primary; e.target.style.boxShadow = `0 0 0 4px ${styles.colors.primary}15`; }}
            onBlur={(e) => { e.target.style.borderColor = styles.colors.border; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
        />
    </div>
);

const FilterChip = ({ label, active, onClick, styles }) => (
    <button 
        onClick={onClick}
        style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none',
            backgroundColor: active ? styles.colors.primary : styles.colors.lightGray,
            color: active ? '#fff' : styles.colors.textMuted,
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
        }}
    >
        {label}
    </button>
);

// Helpers de Data
const calculateAge = (d) => {
    if (!d) return null;
    const ageDifMs = Date.now() - new Date(d).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const formatDate = (d) => {
    if (!d) return '-';
    // Adiciona T12:00:00 para evitar problemas de timezone ao exibir datas simples
    return new Date(d.includes('T') ? d : d + 'T12:00:00').toLocaleDateString('pt-BR');
};

// Card de Paciente (ATUALIZADO PARA NOVO DTO)
const PatientCard = ({ paciente, onClick, styles, isMobile }) => {
    // Agora pegamos direto do objeto, pois o DTO PacienteBuscaResumoDTO traz esses campos na raiz
    const nome = paciente.nome;
    const cpf = paciente.cpf;
    const foto = paciente.fotoPerfilUrl; 
    const idade = calculateAge(paciente.dataNascimento);
    
    const initials = nome ? nome.charAt(0).toUpperCase() : '?';

    return (
        <div 
            onClick={onClick}
            style={{
                backgroundColor: styles.colors.white, borderRadius: '16px', padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: `1px solid ${styles.colors.borderLight}`,
                cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '16px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'; }}
        >
            {/* Foto de Perfil */}
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: styles.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: styles.colors.primary, fontSize: '20px', fontWeight: 'bold' }}>
                {foto ? <img src={foto} alt={nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            
            {/* Informações */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: styles.colors.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nome}</h4>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: styles.colors.textMuted }}>
                    <span title="CPF">🆔 {cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')}</span>
                    {idade !== null && (
                        <span title="Idade" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiCalendar size={12} /> {idade} anos
                        </span>
                    )}
                </div>
            </div>
            <div style={{ color: styles.colors.primary }}>➔</div>
        </div>
    );
};

const DetailModal = ({ isOpen, onClose, title, children, styles, width = '800px' }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px'
        }}>
            <div style={{
                backgroundColor: styles.colors.background, borderRadius: '24px', width: '100%', maxWidth: width,
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden', animation: 'scaleUp 0.3s ease-out'
            }}>
                <div style={{ padding: '20px 24px', backgroundColor: styles.colors.white, borderBottom: `1px solid ${styles.colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: styles.colors.textDark }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: styles.colors.textMuted, fontSize: '20px' }}><FiX /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>{children}</div>
                <style>{`@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            </div>
        </div>
    );
};

const InfoRow = ({ icon, label, value, styles }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid ${styles.colors.borderLight}` }}>
        <div style={{ color: styles.colors.primary, fontSize: '18px' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: styles.colors.textMuted }}>{label}</div>
            <div style={{ fontSize: '14px', color: styles.colors.textDark, fontWeight: '500' }}>{value || '-'}</div>
        </div>
    </div>
);

// =================================================================
// 🩺 COMPONENTE PRINCIPAL: BUSCAR PACIENTES
// =================================================================

const BuscarPacientes = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // States
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    
    // Modal & Detalhes
    const [modalOpen, setModalOpen] = useState(false);
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [detalhes, setDetalhes] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState('dados');

    // --- FUNÇÃO CRÍTICA: NORMALIZAR DADOS DETALHADOS ---
    const normalizarDadosPaciente = (dadosApi) => {
        if (!dadosApi) return null;

        // Tenta pegar de 'pessoa' (novo padrão) ou 'dataDetalhesPessoa' (legado) ou raiz
        const pessoa = dadosApi.pessoa || dadosApi.dataDetalhesPessoa || {};
        
        // O endereço pode vir como "endereco" ou "dataDetalhesEndereco"
        const end = pessoa.endereco || pessoa.dataDetalhesEndereco || {};

        return {
            id: dadosApi.id,
            
            // Dados Pessoais (Extraídos do objeto 'pessoa')
            nome: pessoa.nome || "Nome não disponível",
            cpf: pessoa.cpf || "-",
            email: pessoa.email || "-",
            telefone: pessoa.telefone || "-",
            dataNascimento: pessoa.dataNascimento,
            fotoPerfilUrl: pessoa.fotoPerfilUrl,
            
            // Dados Médicos (Raiz do DTO)
            tipoSanguineo: dadosApi.tipoSanguineo || "-",
            contatoEmergencia: dadosApi.contatoEmergencia || "-",
            peso: dadosApi.peso,
            altura: dadosApi.altura,
            imc: dadosApi.imc,
            
            // Endereço
            endereco: {
                logradouro: end.endereco || end.logradouro, 
                cidade: end.cidade,
                estado: end.estado || end.uf,
                cep: end.cep
            }
        };
    };

    // --- BUSCA ---
    const buscar = useCallback(async (termo, tipo) => {
        if (!termo.trim()) { setPacientes([]); return; }
        setLoading(true);
        try {
            const params = { termo, tipo: tipo === 'TODOS' ? 'TODOS' : tipo };
            const res = await api.get('/medico/pacientes/buscar', { params });
            // O endpoint de busca retorna PacienteBuscaResumoDTO (plano, sem aninhamento complexo)
            setPacientes(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { if (busca.trim()) buscar(busca, filtroTipo); }, 500);
        return () => clearTimeout(timer);
    }, [busca, filtroTipo, buscar]);

    // --- CARREGAR DETALHES ---
    const abrirDetalhes = async (pacienteResumo) => {
        // Usa os dados do resumo para preencher o modal enquanto carrega o resto
        setPacienteSelecionado({
            ...pacienteResumo,
            // Fallback imediato
            nome: pacienteResumo.nome
        });
        
        setModalOpen(true);
        setLoadingDetalhes(true);
        setAbaAtiva('dados');
        
        try {
            const [detalhesRes, historicoRes] = await Promise.all([
                api.get(`/medico/pacientes/${pacienteResumo.id}/detalhes`),
                api.get(`/medico/pacientes/${pacienteResumo.id}/consultas`)
            ]);
            
            setDetalhes(normalizarDadosPaciente(detalhesRes.data));
            setHistorico(historicoRes.data || []);
        } catch (e) { 
            console.error("Erro ao carregar detalhes:", e); 
        } finally { 
            setLoadingDetalhes(false); 
        }
    };

    return (
        <div style={{ padding: isMobile ? '20px' : '40px', backgroundColor: styles.colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: styles.colors.textDark, letterSpacing: '-0.5px' }}>
                        Buscar <span style={{ color: styles.colors.primary }}>Pacientes</span>
                    </h1>
                    <p style={{ margin: 0, color: styles.colors.textMuted }}>Encontre pacientes pelo nome, CPF ou e-mail.</p>
                </div>

                <div style={{ backgroundColor: styles.colors.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px', border: `1px solid ${styles.colors.borderLight}` }}>
                    <div style={{ marginBottom: '20px' }}>
                        <SearchInput value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite o nome, CPF ou e-mail..." styles={styles} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: styles.colors.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}><FiFilter /> Filtros:</span>
                        {['TODOS', 'NOME', 'CPF', 'EMAIL'].map(tipo => (
                            <FilterChip key={tipo} label={tipo === 'TODOS' ? 'Todos' : tipo.charAt(0) + tipo.slice(1).toLowerCase()} active={filtroTipo === tipo} onClick={() => setFiltroTipo(tipo)} styles={styles} />
                        ))}
                    </div>
                </div>

                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: styles.colors.textMuted }}>Carregando...</div>
                    ) : pacientes.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {pacientes.map(p => <PatientCard key={p.id} paciente={p} onClick={() => abrirDetalhes(p)} styles={styles} isMobile={isMobile} />)}
                        </div>
                    ) : busca.trim() ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: styles.colors.textMuted, backgroundColor: styles.colors.white, borderRadius: '20px', border: `2px dashed ${styles.colors.border}` }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div><p>Nenhum paciente encontrado.</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', color: styles.colors.textMuted }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div><p>Comece a digitar para buscar...</p>
                        </div>
                    )}
                </div>
            </div>

            <DetailModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Prontuário do Paciente" styles={styles}>
                {loadingDetalhes ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: styles.colors.textMuted }}>Carregando dados...</div>
                ) : detalhes ? (
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px' }}>
                        <div style={{ flex: '0 0 280px', textAlign: 'center' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: styles.colors.primaryLight, margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: styles.colors.primary, overflow: 'hidden' }}>
                                {detalhes.fotoPerfilUrl ? <img src={detalhes.fotoPerfilUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : detalhes.nome?.charAt(0)}
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: styles.colors.textDark, margin: '0 0 5px 0' }}>{detalhes.nome}</h2>
                            <p style={{ color: styles.colors.textMuted, fontSize: '14px', margin: 0 }}>{calculateAge(detalhes.dataNascimento)} anos • {formatDate(detalhes.dataNascimento)}</p>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <button style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', backgroundColor: styles.colors.success, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone /> Ligar</button>
                                <button style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', backgroundColor: styles.colors.primary, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FiMail /> Email</button>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '20px', borderBottom: `1px solid ${styles.colors.borderLight}`, marginBottom: '20px' }}>
                                {['dados', 'historico'].map(aba => (
                                    <button key={aba} onClick={() => setAbaAtiva(aba)} style={{ background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: abaAtiva === aba ? styles.colors.primary : styles.colors.textMuted, borderBottom: `2px solid ${abaAtiva === aba ? styles.colors.primary : 'transparent'}` }}>
                                        {aba === 'dados' ? '📋 Dados Pessoais' : '📊 Histórico Clínico'}
                                    </button>
                                ))}
                            </div>

                            {abaAtiva === 'dados' && (
                                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                    <InfoRow icon={<FiUser />} label="CPF" value={detalhes.cpf} styles={styles} />
                                    <InfoRow icon={<FiMail />} label="E-mail" value={detalhes.email} styles={styles} />
                                    <InfoRow icon={<FiPhone />} label="Telefone" value={detalhes.telefone} styles={styles} />
                                    <InfoRow icon={<FiMapPin />} label="Endereço" value={detalhes.endereco.logradouro ? `${detalhes.endereco.logradouro}, ${detalhes.endereco.cidade} - ${detalhes.endereco.estado}` : '-'} styles={styles} />
                                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: styles.colors.lightGray, borderRadius: '12px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: styles.colors.textDark, display: 'flex', alignItems: 'center', gap: '8px' }}><FiActivity /> Informações Médicas</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div><small style={{ color: styles.colors.textMuted, fontWeight: '700' }}>TIPO SANGUÍNEO</small><div style={{ fontWeight: '500' }}>{detalhes.tipoSanguineo || '-'}</div></div>
                                            <div><small style={{ color: styles.colors.textMuted, fontWeight: '700' }}>IMC ATUAL</small><div style={{ fontWeight: '500' }}>{detalhes.imc?.toFixed(2) || '-'}</div></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {abaAtiva === 'historico' && (
                                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                    {historico.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {historico.map(h => (
                                                <div key={h.id} style={{ padding: '15px', borderRadius: '12px', border: `1px solid ${styles.colors.borderLight}`, backgroundColor: styles.colors.white }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <span style={{ fontWeight: '700', color: styles.colors.textDark }}>{new Date(h.data).toLocaleDateString()}</span>
                                                        <span style={{ fontSize: '12px', fontWeight: '600', color: styles.colors.primary, backgroundColor: `${styles.colors.primary}15`, padding: '2px 8px', borderRadius: '8px' }}>{h.statusConsula}</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '13px', color: styles.colors.textMuted }}>{h.medicoNome || 'Médico'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p style={{ textAlign: 'center', color: styles.colors.textMuted, fontStyle: 'italic', padding: '20px' }}>Nenhum histórico encontrado.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                ) : <div style={{ padding: '40px', color: styles.colors.danger, textAlign: 'center' }}><FiAlertCircle /> Erro ao carregar</div>}
            </DetailModal>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default BuscarPacientes;