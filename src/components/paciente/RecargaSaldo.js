import React, { useState } from 'react';
import api from '../../api/api'; // Ajuste o caminho conforme sua estrutura
import { useTheme } from '../../contexts/ThemeContext'; // Ajuste o caminho
import { generateStyles } from '../../styles/globalStyles'; // Ajuste o caminho
import { 
    FiDollarSign, 
    FiArrowRight, 
    FiShield, 
    FiTrendingUp, 
    FiZap // Usando o raio para representar o Pix (Instantâneo)
} from 'react-icons/fi'; 

const RecargaSaldo = () => {
    const { isDarkMode } = useTheme();
    const styles = generateStyles(isDarkMode);
    
    const [valor, setValor] = useState('');
    const [loading, setLoading] = useState(false);

    // Opções de valores rápidos para facilitar
    const opcoesRapidas = [20, 50, 100, 200, 500];

    const handleValorChange = (e) => {
        // Permite apenas números e um ponto decimal
        const v = e.target.value.replace(/[^0-9.]/g, '');
        setValor(v);
    };

    const handleCheckout = async () => {
        const valorNumerico = parseFloat(valor);
        
        if (!valor || valorNumerico < 5) {
            alert("O valor mínimo para recarga é R$ 5,00");
            return;
        }

        try {
            setLoading(true);
            
            // ⚠️ IMPORTANTE: Aqui você deve pegar o login real do usuário logado
            // Se estiver usando Context API ou JWT, pegue de lá.
            const loginUsuario = "login_do_usuario_atual"; 

            // Chama o Backend
            const response = await api.post(`/stripe/recarga`, { 
                loginUsuario: loginUsuario,
                valor: valorNumerico
            });

            // O Backend devolve a URL do Stripe (que agora aceita Pix e Cartão)
            window.location.href = response.data.url;

        } catch (error) {
            console.error("Erro ao iniciar recarga", error);
            alert("Erro ao conectar com o sistema de pagamento.");
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: styles.colors.background,
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                backgroundColor: styles.colors.white,
                borderRadius: '24px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                padding: '40px',
                border: `1px solid ${styles.colors.borderLight}`
            }}>
                {/* Cabeçalho */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        backgroundColor: '#ecfdf5', color: '#059669',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px auto', fontSize: '28px'
                    }}>
                        <FiTrendingUp />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: styles.colors.textDark, marginBottom: '10px' }}>
                        Adicionar Saldo
                    </h1>
                    <p style={{ color: styles.colors.textMuted }}>
                        Créditos instantâneos para usar na MedMais.
                    </p>
                </div>

                {/* Botões de Seleção Rápida */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: styles.colors.textDark, marginBottom: '10px', display: 'block' }}>
                        Escolha um valor
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {opcoesRapidas.map((v) => (
                            <button
                                key={v}
                                onClick={() => setValor(v.toString())}
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: valor === v.toString() ? `2px solid ${styles.colors.primary}` : `1px solid ${styles.colors.borderLight}`,
                                    backgroundColor: valor === v.toString() ? `${styles.colors.primary}10` : 'transparent',
                                    color: valor === v.toString() ? styles.colors.primary : styles.colors.textMuted,
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                R$ {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Personalizado */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: styles.colors.textDark, marginBottom: '10px', display: 'block' }}>
                        Ou digite outro valor
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: 'bold', color: styles.colors.textMuted }}>
                            R$
                        </span>
                        <input 
                            type="text"
                            value={valor}
                            onChange={handleValorChange}
                            placeholder="0.00"
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 60px',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: styles.colors.textDark,
                                borderRadius: '16px',
                                border: `2px solid ${styles.colors.borderLight}`,
                                outline: 'none',
                                backgroundColor: styles.colors.background
                            }}
                        />
                    </div>
                </div>

                {/* Botão de Pagar (Stripe: Cartão + Pix) */}
                <button
                    onClick={handleCheckout}
                    disabled={loading || !valor}
                    style={{
                        width: '100%',
                        padding: '18px',
                        backgroundColor: '#635bff', // Cor Roxo Stripe
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: loading || !valor ? 'not-allowed' : 'pointer',
                        opacity: loading || !valor ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'transform 0.2s',
                        boxShadow: '0 10px 20px -5px rgba(99, 91, 255, 0.4)'
                    }}
                >
                    {loading ? 'Gerando Pagamento...' : (
                        <>
                            Pagar com Pix ou Cartão <FiArrowRight />
                        </>
                    )}
                </button>

                {/* Badges de Segurança */}
                <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: styles.colors.textMuted, fontSize: '12px' }}>
                        <FiShield size={14} color="#10b981" /> Pagamento Seguro
                    </div>
                    <div style={{ height: '15px', width: '1px', backgroundColor: styles.colors.borderLight }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: styles.colors.textMuted, fontSize: '12px' }}>
                        <FiZap size={14} color="#f59e0b" /> Pix Instantâneo
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecargaSaldo;