import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomeCliente() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [pets, setPets] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [mostrarAgendamento, setMostrarAgendamento] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const [novoAgendamento, setNovoAgendamento] = useState({
    pet: "",
    servico: "",
    data: "",
    horario: ""
  });

  const horarios = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00"
  ];

  const servicos = [
    {
      nome: "Banho",
      descricao: "Banho completo para o pet.",
      preco: "50,00"
    },
    {
      nome: "Tosa",
      descricao: "Tosa completa para deixar seu pet bem cuidado.",
      preco: "70,00"
    },
    {
      nome: "Banho e Tosa",
      descricao: "Banho e tosa completa para o pet.",
      preco: "100,00"
    }
  ];

  function obterDataHoje() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  const dataHoje = obterDataHoje();

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const usuarioSalvo =
        localStorage.getItem("usuarioCadastrado");

      if (!usuarioSalvo) {
        navigate("/login", {
          replace: true
        });
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      const respostaClientes = await fetch(
        "http://localhost:5000/api/clientes"
      );

      if (!respostaClientes.ok) {
        throw new Error();
      }

      const clientes = await respostaClientes.json();

      const clienteEncontrado = clientes.find(
        (cliente) =>
          cliente.email.toLowerCase() ===
          usuario.email.toLowerCase()
      );

      if (!clienteEncontrado) {
        setMensagemErro(
          "Seu cadastro ainda não foi encontrado no sistema."
        );
        return;
      }

      setCliente(clienteEncontrado);

      const respostaPets = await fetch(
        "http://localhost:5000/api/pets"
      );

      if (!respostaPets.ok) {
        throw new Error();
      }

      const todosPets = await respostaPets.json();

      const meusPets = todosPets.filter((pet) => {
        const dono =
          typeof pet.dono === "object"
            ? pet.dono?._id
            : pet.dono;

        return dono === clienteEncontrado._id;
      });

      setPets(meusPets);

      const respostaAgendamentos = await fetch(
        "http://localhost:5000/api/agendamentos"
      );

      if (respostaAgendamentos.ok) {
        const todosAgendamentos =
          await respostaAgendamentos.json();

        const meusAgendamentos =
          todosAgendamentos.filter((agendamento) => {
            const idCliente =
              typeof agendamento.cliente === "object"
                ? agendamento.cliente?._id
                : agendamento.cliente;

            return idCliente === clienteEncontrado._id;
          });

        setAgendamentos(meusAgendamentos);
      }

    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Não foi possível carregar seus dados."
      );
    }
  }

  function abrirAgendamento() {
    if (pets.length === 0) {
      alert(
        "Você ainda não possui nenhum pet cadastrado. Entre em contato com o administrador para cadastrar seu pet."
      );
      return;
    }

    setMensagemErro("");

    setNovoAgendamento({
      pet: "",
      servico: "",
      data: "",
      horario: ""
    });

    setMostrarAgendamento(true);
  }

  function limparAgendamento() {
    setNovoAgendamento({
      pet: "",
      servico: "",
      data: "",
      horario: ""
    });

    setMensagemErro("");
    setMostrarAgendamento(false);
  }

  function horarioOcupado(horario) {
    if (!novoAgendamento.data) {
      return false;
    }

    return agendamentos.some(
      (agendamento) =>
        agendamento.data === novoAgendamento.data &&
        agendamento.horario === horario
    );
  }

  function horarioJaPassou(horario) {
    if (novoAgendamento.data !== dataHoje) {
      return false;
    }

    const agora = new Date();

    const [hora, minuto] = horario.split(":");

    const horarioSelecionado = new Date();

    horarioSelecionado.setHours(
      Number(hora),
      Number(minuto),
      0,
      0
    );

    return horarioSelecionado <= agora;
  }

  async function fazerAgendamento(e) {
    e.preventDefault();

    setMensagemErro("");

    if (
      !novoAgendamento.pet ||
      !novoAgendamento.servico ||
      !novoAgendamento.data ||
      !novoAgendamento.horario
    ) {
      setMensagemErro(
        "Preencha todos os campos."
      );
      return;
    }

    if (
      horarioOcupado(novoAgendamento.horario)
    ) {
      setMensagemErro(
        "Esse horário já está ocupado. Escolha outro horário."
      );
      return;
    }

    if (
      horarioJaPassou(novoAgendamento.horario)
    ) {
      setMensagemErro(
        "Esse horário já passou. Escolha outro horário."
      );
      return;
    }

    try {
      const resposta = await fetch(
        "http://localhost:5000/api/agendamentos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cliente: cliente._id,
            pet: novoAgendamento.pet,
            servico: novoAgendamento.servico,
            data: novoAgendamento.data,
            horario: novoAgendamento.horario,
            status: "Pendente"
          })
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Não foi possível realizar o agendamento."
        );
        return;
      }

      setAgendamentos((listaAtual) => [
        ...listaAtual,
        dados
      ]);

      alert(
        "Agendamento realizado com sucesso!"
      );

      limparAgendamento();

    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Erro ao conectar com o servidor."
      );
    }
  }

  return (
    <div className="cliente-home">

      <div className="welcome-card">
        <div className="welcome-text">

          <h1>
            Olá, {cliente?.nome || "Cliente"}!
          </h1>

          <p>
            Bem-vindo ao Mundo Pet.
            Cuide do seu melhor amigo com carinho!
          </p>

        </div>
      </div>


      {/* MEUS PETS */}

      <section className="cliente-secao">

        <div className="cliente-titulo">

          <h2>
            Meus pets
          </h2>

        </div>

        {mensagemErro && (
          <p className="mensagem-erro">
            {mensagemErro}
          </p>
        )}

        {pets.length === 0 ? (

          <div className="cliente-vazio">

            <p>
              Você ainda não possui pets cadastrados.
            </p>

            <small>
              Entre em contato com o administrador
              para cadastrar seu pet.
            </small>

          </div>

        ) : (

          <div className="pets-container">

            {pets.map((pet) => (

              <div
                className="pet-card"
                key={pet._id}
              >

                <h2>
                  {pet.nome}
                </h2>

                <p>
                  <span className="info-label">
                    Espécie:
                  </span>{" "}
                  {pet.especie}
                </p>

                <p>
                  <span className="info-label">
                    Raça:
                  </span>{" "}
                  {pet.raca}
                </p>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* AGENDAMENTO */}

      <section className="cliente-secao">

        <div className="cliente-titulo">

          <h2>
            Agendamento
          </h2>

          <button
            onClick={abrirAgendamento}
          >
            + Novo Agendamento
          </button>

        </div>


        {mostrarAgendamento && (

          <form
            className="formulario"
            onSubmit={fazerAgendamento}
          >

            <select
              value={novoAgendamento.pet}
              onChange={(e) => {
                setMensagemErro("");

                setNovoAgendamento({
                  ...novoAgendamento,
                  pet: e.target.value
                });
              }}
            >

              <option value="">
                Selecione o pet
              </option>

              {pets.map((pet) => (

                <option
                  key={pet._id}
                  value={pet._id}
                >
                  {pet.nome}
                </option>

              ))}

            </select>


            <select
              value={novoAgendamento.servico}
              onChange={(e) => {
                setMensagemErro("");

                setNovoAgendamento({
                  ...novoAgendamento,
                  servico: e.target.value
                });
              }}
            >

              <option value="">
                Selecione o serviço
              </option>

              <option value="Banho">
                Banho - R$ 50,00
              </option>

              <option value="Tosa">
                Tosa - R$ 70,00
              </option>

              <option value="Banho e Tosa">
                Banho e Tosa - R$ 100,00
              </option>

            </select>


            <input
              type="date"
              min={dataHoje}
              value={novoAgendamento.data}
              onChange={(e) => {

                setMensagemErro("");

                setNovoAgendamento({
                  ...novoAgendamento,
                  data: e.target.value,
                  horario: ""
                });

              }}
            />


            <select
              value={novoAgendamento.horario}
              disabled={!novoAgendamento.data}
              onChange={(e) => {

                setMensagemErro("");

                setNovoAgendamento({
                  ...novoAgendamento,
                  horario: e.target.value
                });

              }}
            >

              <option value="">
                {!novoAgendamento.data
                  ? "Escolha primeiro a data"
                  : "Escolha um horário"}
              </option>

              {horarios.map((horario) => (

                <option
                  key={horario}
                  value={horario}
                  disabled={
                    horarioOcupado(horario) ||
                    horarioJaPassou(horario)
                  }
                >

                  {horario}

                  {horarioOcupado(horario)
                    ? " - Ocupado"
                    : horarioJaPassou(horario)
                    ? " - Horário encerrado"
                    : " - Disponível"}

                </option>

              ))}

            </select>


            <button type="submit">
              Confirmar Agendamento
            </button>


            {mensagemErro && (
              <p className="mensagem-erro">
                {mensagemErro}
              </p>
            )}


            <button
              type="button"
              onClick={limparAgendamento}
            >
              Cancelar
            </button>

          </form>

        )}

      </section>


      {/* SERVIÇOS */}

      <section className="cliente-secao">

        <div className="cliente-titulo">

          <h2>
            Nossos serviços
          </h2>

        </div>

        <div className="servicos-home-container">

          {servicos.map((servico) => (

            <div
              className="servico-home-card"
              key={servico.nome}
            >

              <h3>
                {servico.nome}
              </h3>

              <p>
                {servico.descricao}
              </p>

              <strong>
                R$ {servico.preco}
              </strong>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default HomeCliente;