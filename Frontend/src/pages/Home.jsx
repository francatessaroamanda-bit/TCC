function Home() {
  return (
    <div className="home-container">

      <div className="welcome-card">
        <div className="welcome-text">
          <h1>Bem-vindos ao Mundo Pet</h1>

          <p>
            Cuidando dos seus melhores amigos com carinho e dedicação.
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


      {/* =========================
          NOSSOS SERVIÇOS
      ========================= */}

      <section className="home-servicos">

        <h2>Nossos serviços</h2>

        <div className="servicos-home-container">

          <div className="servico-home-card">
            <h3>Banho</h3>

            <p>
              Banho completo para o pet.
            </p>

            <strong>R$ 50,00</strong>
          </div>

          <div className="servico-home-card">
            <h3>Tosa</h3>

            <p>
              Tosa completa para deixar seu pet bem cuidado.
            </p>

            <strong>R$ 70,00</strong>
          </div>

          <div className="servico-home-card">
            <h3>Banho e Tosa</h3>

            <p>
              Banho e tosa completa para o pet.
            </p>

            <strong>R$ 100,00</strong>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;