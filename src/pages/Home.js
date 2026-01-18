import { Link } from "react-router-dom";
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // Importe o hook do tema

function Home() {
  const { user, roles } = useAuth();
  const { isDarkMode } = useTheme(); // Obtenha o estado do tema
  const role = roles.length > 0 ? roles[0] : null;

  // Cores dinâmicas baseadas no tema
  const themeColors = {
    background: isDarkMode ? '#121212' : '#E5FFFD',
    primary: isDarkMode ? '#008e7a' : '#00C7B4',
    primaryDark: isDarkMode ? '#006b5a' : '#009B7D',
    text: isDarkMode ? '#f5f5f5' : '#3B3975',
    cardBg: isDarkMode ? '#1e1e1e' : '#233975',
    footerBg: isDarkMode ? '#1a1a1a' : 'white',
    footerText: isDarkMode ? '#f5f5f5' : '#015C91'
  };

  return (
    <div style={{ backgroundColor: themeColors.background, minHeight: '100vh' }}>
      <section style={{
        backgroundColor: themeColors.background,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "2rem",
        flexWrap: "wrap",
        transition: 'background-color 0.3s ease',
        '@media (max-width: 768px)': {
          flexDirection: "column",
        }
      }}>
        <div style={{ 
          maxWidth: "600px",
          minWidth: "300px",
          width: "100%",
          color: themeColors.text, 
          fontSize: "1.2rem", 
          lineHeight: "1.8",
          transition: 'color 0.3s ease',
          '@media (min-width: 769px)': {
            textAlign: "left",
          }
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: themeColors.text }}>
            Agende sua consulta!
          </h1>
          <p>
            Na MedMais, reunimos médicos, terapeutas e especialistas que trabalham juntos por um único propósito:
            acolher, cuidar e transformar a sua qualidade de vida.
          </p>

          <Link 
            to={
              user 
                ? role === "PACIENTE" 
                  ? "/paciente/dashboard" 
                  : "/agendamento"
                : "/login"
            }
            style={{
              display: "inline-block",
              backgroundColor: themeColors.primary,
              color: "white",
              padding: "0.8rem 2rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.3s",
              marginTop: "1rem",
              ":hover": {
                backgroundColor: themeColors.primaryDark,
                transform: "translateY(-2px)"
              }
            }}
          >
            {user ? "Agendar Consulta" : "Login para Agendar"}
          </Link>
          
        </div>
        <img
          src="/entrada-med-mais.jpg"
          alt="Entrada da MedMais"
          style={{ 
            width: "100%", 
            maxWidth: "400px", 
            borderRadius: "20px",
            boxShadow: isDarkMode ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.3s ease',
            '@media (max-width: 768px)': {
              marginTop: "2rem",
            }
          }}
        />
      </section>

      {/* Seção Missão, Visão, Valores */}
      <section style={{
        backgroundColor: themeColors.primary,
        color: "white",
        padding: "3rem 2rem",
        textAlign: "center",
        transition: 'background-color 0.3s ease'
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          flexWrap: "wrap",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {[
            {
              title: "MISSÃO",
              text: "Promover cuidado de forma sistêmica, oferecendo serviços de exames laboratoriais e atendimentos especializados. Contribuindo para a qualidade de vidas dos nossos clientes, proporcionando uma jornada de cuidado integral, personalizado e de excelência."
            },
            {
              title: "VISÃO",
              text: "Ser referência em saúde, bem-estar, inovação e atendimento de excelência. Buscamos constantemente aprimorar nossos serviços, investir em tecnologia e estratégias para o acesso à saúde de qualidade."
            },
            {
              title: "VALORES",
              text: "Integridade, Empatia, Inovação, Foco no cliente, Responsabilidade social e ambiental, Trabalho em equipe e Excelência."
            }
          ].map((item, index) => (
            <div 
              key={index} 
              style={{ 
                flex: "1",
                minWidth: "300px",
                maxWidth: "400px",
                backgroundColor: themeColors.cardBg, 
                padding: "2rem", 
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                transition: 'background-color 0.3s ease',
                boxShadow: isDarkMode ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: "3rem", color: "#0F9AD1", marginBottom: "1rem" }}>★</div>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>{item.title}</h2>
              <p style={{ lineHeight: "1.6", textAlign: "center" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé */}
      <footer style={{
        backgroundColor: themeColors.footerBg,
        color: themeColors.footerText,
        textAlign: "center",
        padding: "0.5rem 0.5rem",
        fontSize: "0.80rem",
        lineHeight: "1.4",
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        <p>Avenida Deputado José Mendonça Bezerra, 294, centro, Belo Jardim - PE</p>
        <p>
        Telefone: (81)2153-1912<br />
        Email: contato@clinicamedmais.com
        </p>        
        <p>CNPJ: 39.887.010/0001-26</p>
      </footer>
    </div>
  );
}

export default Home;