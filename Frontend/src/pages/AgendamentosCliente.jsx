import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AgendamentosCliente() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [pets, setPets] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [mensagemErro, setMensagemErro] =
    useState("");

  const [novoAgendamento, setNovoAgendamento] =
    useState({
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
    "Banho - R$ 50,00",
    "Tosa - R$ 70,00",
    "Banho e Tosa - R$ 100,00"
  ];

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

      // =========================================
      // BUSCAR CLIENTE
      // =========================================

      const respostaClientes = await fetch(
        "http://localhost:5000/api/clientes"
      );

      if (!respostaClientes.ok) {
        throw new Error();
      }

      const clientes =
        await respostaClientes.json();

      const clienteEncontrado = clientes.find(
        (item) =>
          item.email.toLowerCase() ===
          usuario.email.toLowerCase()
      );

      if (!clienteEncontrado) {
        setMensagemErro(
          "Seu cadastro ainda não foi encontrado no sistema."
        );
        return;
      }

      setCliente(clienteEncontrado);

      // =========================================
      // BUSCAR PETS
      // =========================================

      const respostaPets = await fetch(
        "http://localhost:5000/api/pets"
      );

      if (!respostaPets.ok) {
        throw new Error();
      }

      const todosPets =
        await respostaPets.json();

      const meusPets = todosPets.filter((pet) => {
        const dono =
          typeof pet.dono === "object"
            ? pet.dono?._id
            : pet.dono;

        return dono === clienteEncontrado._id;
      });

      setPets(meusPets);

      // =========================================
      // BUSCAR AGENDAMENTOS
      // =========================================

      const respostaAgendamentos =
        await fetch(
          "http://localhost:5000/api/agendamentos"
        );

      if (!respostaAgendamentos.ok) {
        throw new Error();
      }

      const todosAgendamentos =
        await respostaAgendamentos.json();

      const meusAgendamentos =
        todosAgendamentos.filter((agendamento) => {
          const clienteId =
            typeof agendamento.cliente === "object"
              ? agendamento.cliente?._id
              : agendamento.cliente;

          return (
            clienteId ===
            clienteEncontrado._id
          );
        });

      setAgendamentos(meusAgendamentos);

    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Não foi possível carregar seus dados."
      );
    }
  }

  // =========================================
  // ABRIR FORMULÁRIO
  // =========================================

  function novoAgendamentoFormulario() {
    setMensagemErro("");

    setNovoAgendamento({
      pet: "",
      servico: "",
      data: "",
      horario: ""
    });

    setMostrarFormulario(true);
  }

  // =========================================
  // LIMPAR FORMULÁRIO
  // =========================================

  function limparFormulario() {
    setNovoAgendamento({
      pet: "",
      servico: "",
      data: "",
      horario: ""
    });

    setMensagemErro("");
    setMostrarFormulario(false);
  }

  // =========================================
  // VERIFICAR HORÁRIO OCUPADO
  // =========================================

  function horarioOcupado(horario) {
    if (!novoAgendamento.data) {
      return false;
    }

    return agendamentos.some(
      (agendamento) =>
        agendamento.data ===
          novoAgendamento.data &&
        agendamento.horario === horario
    );
  }

  // =========================================
  // VERIFICAR HORÁRIO PASSADO
  // =========================================

  function horarioPassado(horario) {
    if (!novoAgendamento.data) {
      return false;
    }

    const hoje =
      new Date();

    const dataSelecionada =
      new Date(
        `${novoAgendamento.data}T${horario}:00`
      );

    return dataSelecionada < hoje;
  }

  // =========================================
  // SALVAR AGENDAMENTO
  // =========================================

  async function salvarAgendamento(e) {
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

    if (!cliente) {
      setMensagemErro(
        "Cliente não encontrado."
      );
      return;
    }

    if (horarioOcupado(novoAgendamento.horario)) {
      setMensagemErro(
        "Este horário já está ocupado. Escolha outro horário."
      );
      return;
    }

    try {
      const resposta = await fetch(
        "http://localhost:5000/api/agendamentos",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
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

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Erro ao criar agendamento."
        );
        return;
      }

      setAgendamentos(
        (listaAtual) => [
          ...listaAtual,
          dados
        ]
      );

      alert(
        "Agendamento realizado com sucesso!"
      );

      limparFormulario();

    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Erro ao conectar com o servidor."
      );
    }
  }

  return (
    <div>

      {/* =========================================
          TÍTULO
      ========================================= */}

      <div className="titulo-clientes">

        <h1>
          Meus Agendamentos
        </h1>

        <button
          onClick={
            novoAgendamentoFormulario
          }
        >
          + Novo Agendamento
        </button>

      </div>

      {/* =========================================
          MENSAGEM DE ERRO
      ========================================= */}

      {mensagemErro && (
        <p className="mensagem-erro">
          {mensagemErro}
        </p>
      )}

      {/* =========================================
          FORMULÁRIO
      ========================================= */}

      {mostrarFormulario && (

        <form
          className="formulario"
          onSubmit={salvarAgendamento}
        >

          {/* PET */}

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
              Selecione seu pet
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

          {/* SERVIÇO */}

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

            {servicos.map((servico) => (

              <option
                key={servico}
                value={servico}
              >
                {servico}
              </option>

            ))}

          </select>

          {/* DATA */}

          <input
            type="date"
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
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

          {/* HORÁRIO */}

          <select
            value={novoAgendamento.horario}
            onChange={(e) => {
              setMensagemErro("");

              setNovoAgendamento({
                ...novoAgendamento,
                horario: e.target.value
              });
            }}
          >

            <option value="">
              Selecione o horário
            </option>

            {horarios.map((horario) => {

              const ocupado =
                horarioOcupado(horario);

              const passado =
                horarioPassado(horario);

              return (
                <option
                  key={horario}
                  value={horario}
                  disabled={
                    ocupado || passado
                  }
                >
                  {horario}
                  {ocupado
                    ? " - Ocupado"
                    : passado
                    ? " - Indisponível"
                    : ""}
                </option>
              );

            })}

          </select>

          {/* BOTÃO SALVAR */}

          <button type="submit">
            Agendar
          </button>

          {/* BOTÃO CANCELAR */}

          <button
            type="button"
            className="botao-cancelar"
            onClick={limparFormulario}
          >
            Cancelar
          </button>

        </form>

      )}

      {/* =========================================
          LISTA DE AGENDAMENTOS
      ========================================= */}

      {agendamentos.length === 0 ? (

        <div className="cliente-vazio">

          <p>
            Você ainda não possui
            agendamentos.
          </p>

          <small>
            Clique em "+ Novo Agendamento"
            para marcar um horário.
          </small>

        </div>

      ) : (

        <div className="pets-container">

          {agendamentos.map(
            (agendamento) => {

              const pet =
                typeof agendamento.pet ===
                "object"
                  ? agendamento.pet
                  : null;

              return (

                <div
                  className="pet-card"
                  key={
                    agendamento._id
                  }
                >

                  <h2>
                    {pet?.nome ||
                      "Pet"}
                  </h2>

                  <p>
                    <span className="info-label">
                      Serviço:
                    </span>{" "}
                    {agendamento.servico}
                  </p>

                  <p>
                    <span className="info-label">
                      Data:
                    </span>{" "}
                    {agendamento.data}
                  </p>

                  <p>
                    <span className="info-label">
                      Horário:
                    </span>{" "}
                    {agendamento.horario}
                  </p>

                  <p>
                    <span className="info-label">
                      Status:
                    </span>{" "}
                    {agendamento.status}
                  </p>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
}

export default AgendamentosCliente;