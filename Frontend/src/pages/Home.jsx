import { useEffect, useState } from "react";

function Home() {
  const [servicos, setServicos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    buscarServicos();
  }, []);

  async function buscarServicos() {
    try {
      const resposta = await fetch(
        "http://localhost:5000/api/servicos"
      );

      if (!resposta.ok) {
        throw new Error();
      }

      setServicos(await resposta.json());
    } catch (error) {
      console.error(error);
      setMensagemErro(
        "Não foi possível carregar os serviços."
      );
    }
  }

  return (
    <div className="home-container">

      <div className="welcome-card">
        <div className="welcome-text">
          <h1>Bem-vindos ao Mundo Pet</h1>

          <p>
            Cuidando dos seus melhores amigos
            com carinho e dedicação.
          </p>
        </div>
      </div>

      <div className="home-imagens">

        <div className="imagem-card">
          <img
            src="https://itpetblog.com.br/wp-content/uploads/2023/06/banho_no_inverno.jpg"
            alt="Banho em pet"
          />
        </div>

        <div className="imagem-card">
          <img
            src="https://site.docg.com.br/wp-content/uploads/2019/07/298372-passo-a-passo-aprenda-como-montar-um-banho-e-tosa-a-domicilio.jpg"
            alt="Cachorro recebendo cuidados"
          />
        </div>

        <div className="imagem-card">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ1eWQ7ax4hEp-T9xtBRxTc8k7xUP51dt29DkP8ortcWAErqn0_tFSlFoJ&s=10"
            alt="Cachorros"
          />
        </div>

        <div className="imagem-card">
          <img
            src="https://conteudo.imguol.com.br/c/entretenimento/5e/2016/12/08/banho-cachorro-1481227592481_v2_1x1.jpg"
            alt="Pet"
          />
        </div>

      </div>

      <section className="home-servicos">
        <h2>Nossos serviços</h2>

        {mensagemErro && (
          <p className="mensagem-erro">
            {mensagemErro}
          </p>
        )}

        <div className="servicos-home-container">
          {servicos.length === 0 ? (
            <p>Nenhum serviço cadastrado.</p>
          ) : (
            servicos.map((servico) => (
              <div
                className="servico-home-card"
                key={servico._id}
              >
                <h3>{servico.nome}</h3>

                <p>{servico.descricao}</p>

                <strong>
                  R${" "}
                  {Number(servico.preco)
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}

export default Home;