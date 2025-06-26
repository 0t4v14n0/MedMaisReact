import { Link } from "react-router-dom";
import { useAuth } from '../auth/AuthContext';

export default function Home() {

  const { user, roles } = useAuth();
  const role = roles.length > 0 ? roles[0] : null;

  return (
    <div>
      <section style={{
        backgroundColor: "#E5FFFD",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "2rem",
        flexWrap: "wrap",
        '@media (max-width: 768px)': {
          flexDirection: "column",
        }
      }}>
        <div style={{ 
          maxWidth: "600px",
          minWidth: "300px",
          width: "100%",
          color: "#3B3975", 
          fontSize: "1.2rem", 
          lineHeight: "1.8",
          '@media (min-width: 769px)': {
            textAlign: "left",
          }
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Agende sua consulta!</h1>
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
              backgroundColor: "#00C7B4",
              color: "white",
              padding: "0.8rem 2rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.3s",
              ":hover": {
                backgroundColor: "#009B7D",
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
            '@media (max-width: 768px)': {
              marginTop: "2rem",
            }
          }}
        />
      </section>

      {/* Seção Missão, Visão, Valores */}
      <section style={{
        backgroundColor: "#00C7B4",
        color: "white",
        padding: "3rem 2rem",
        textAlign: "center"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "2rem"
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
            <div key={index} style={{ maxWidth: "300px", backgroundColor: "#233975", padding: "1.5rem", borderRadius: "10px", margin: "1rem" }}>
              <div style={{ fontSize: "5rem", color: "#0F9AD1" }}>★</div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé */}
      <footer style={{
        backgroundColor: "white",
        color: "#015C91",
        textAlign: "center",
        padding: "0.5rem 0.5rem",
        fontSize: "0.80rem",
        lineHeight: "1.4"
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
