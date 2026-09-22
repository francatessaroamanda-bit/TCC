import { useEffect, useState } from "react";

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensagemErro, setMensagemErro] = useState("");

  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente: "",
    pet: "",
    servico: "",
    data: "",
    horario: "",
    status: "Pendente"
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

  function obterDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  const dataHoje = obterDataHoje();

  useEffect(() => {
    buscarAgendamentos();
    buscarClientes();
    buscarPets();
  }, []);

  async function buscarAgendamentos() {
    try {
      const resposta = await fetch(
        "http://localhost:5000/api/agendamentos"
      );

      if (!resposta.ok) {
        throw new Error();
      }

      setAgendamentos(await resposta.json());
    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Não foi possível carregar os agendamentos."
      );
    }
  }

  async function buscarClientes() {
    try {
      const resposta = await fetch(
        "http://localhost:5000/api/clientes"
      );

      if (!resposta.ok) {
        throw new Error();
      }

      setClientes(await resposta.json());
    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Não foi possível carregar os clientes."
      );
    }
  }

  async function buscarPets() {
    try {
      const resposta = await fetch(
        "http://localhost:5000/api/pets"
      );

      if (!resposta.ok) {
        throw new Error();
      }

      setPets(await resposta.json());
    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Não foi possível carregar os pets."
      );
    }
  }

  function limparFormulario() {
    setNovoAgendamento({
      cliente: "",
      pet: "",
      servico: "",
      data: "",
      horario: "",
      status: "Pendente"
    });

    setMensagemErro("");
    setEditando(null);
    setMostrarFormulario(false);
  }

  function novoAgendamentoFormulario() {
    setMensagemErro("");

    if (clientes.length === 0) {
      setMensagemErro(
        "Não existem clientes cadastrados. Cadastre um cliente antes de realizar um agendamento."
      );
      return;
    }

    if (pets.length === 0) {
      setMensagemErro(
        "Não existem pets cadastrados. Cadastre um pet antes de realizar um agendamento."
      );
      return;
    }

    setEditando(null);

    setNovoAgendamento({
      cliente: "",
      pet: "",
      servico: "",
      data: "",
      horario: "",
      status: "Pendente"
    });

    setMostrarFormulario(true);
  }

  function alterarCliente(cliente) {
    setMensagemErro("");

    setNovoAgendamento({
      ...novoAgendamento,
      cliente,
      pet: ""
    });
  }

  function petsDoCliente() {
    return pets.filter((pet) => {
      const dono =
        typeof pet.dono === "object"
          ? pet.dono?._id
          : pet.dono;

      return dono === novoAgendamento.cliente;
    });
  }

  function horarioOcupado(horario) {
    if (!novoAgendamento.data) {
      return false;
    }

    return agendamentos.some(
      (agendamento) =>
        agendamento.data === novoAgendamento.data &&
        agendamento.horario === horario &&
        agendamento._id !== editando
    );
  }

  function horarioJaPassou(horario) {
    if (novoAgendamento.data !== dataHoje) {
      return false;
    }

    const agora = new Date();

    const [hora, minuto] =
      horario.split(":");

    const horarioSelecionado = new Date();

    horarioSelecionado.setHours(
      Number(hora),
      Number(minuto),
      0,
      0
    );

    return horarioSelecionado <= agora;
  }

  function validarAgendamento() {
    if (
      !novoAgendamento.cliente ||
      !novoAgendamento.pet ||
      !novoAgendamento.servico ||
      !novoAgendamento.data ||
      !novoAgendamento.horario
    ) {
      setMensagemErro(
        "Preencha todos os campos."
      );

      return false;
    }

    if (
      horarioOcupado(
        novoAgendamento.horario
      )
    ) {
      setMensagemErro(
        "Esse horário já está ocupado. Escolha outro horário."
      );

      return false;
    }

    if (
      horarioJaPassou(
        novoAgendamento.horario
      )
    ) {
      setMensagemErro(
        "Esse horário já passou. Escolha outro horário."
      );

      return false;
    }

    return true;
  }

  async function salvarAgendamento(e) {
    e.preventDefault();

    setMensagemErro("");

    if (!validarAgendamento()) {
      return;
    }

    const editandoAgendamento =
      editando !== null;

    const url = editandoAgendamento
      ? `http://localhost:5000/api/agendamentos/${editando}`
      : "http://localhost:5000/api/agendamentos";

    try {
      const resposta = await fetch(
        url,
        {
          method: editandoAgendamento
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            novoAgendamento
          )
        }
      );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Erro ao salvar agendamento."
        );

        return;
      }

      if (editandoAgendamento) {
        setAgendamentos(
          (listaAtual) =>
            listaAtual.map(
              (agendamento) =>
                agendamento._id === editando
                  ? dados
                  : agendamento
            )
        );
      } else {
        setAgendamentos(
          (listaAtual) => [
            ...listaAtual,
            dados
          ]
        );
      }

      limparFormulario();
    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Erro ao conectar com o servidor."
      );
    }
  }

  function editarAgendamento(
    agendamento
  ) {
    const cliente =
      typeof agendamento.cliente ===
      "object"
        ? agendamento.cliente?._id
        : agendamento.cliente;

    const pet =
      typeof agendamento.pet ===
      "object"
        ? agendamento.pet?._id
        : agendamento.pet;

    setEditando(
      agendamento._id
    );

    setMensagemErro("");

    setNovoAgendamento({
      cliente: cliente || "",
      pet: pet || "",
      servico:
        agendamento.servico ||
        "",
      data:
        agendamento.data ||
        "",
      horario:
        agendamento.horario ||
        "",
      status:
        agendamento.status ||
        "Pendente"
    });

    setMostrarFormulario(true);
  }

  async function removerAgendamento(
    id
  ) {
    setMensagemErro("");

    try {
      const resposta = await fetch(
        `http://localhost:5000/api/agendamentos/${id}`,
        {
          method: "DELETE"
        }
      );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Erro ao remover agendamento."
        );

        return;
      }

      setAgendamentos(
        (listaAtual) =>
          listaAtual.filter(
            (agendamento) =>
              agendamento._id !== id
          )
      );
    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Erro ao conectar com o servidor."
      );
    }
  }

  const agendamentosFuturos =
    agendamentos.filter(
      (agendamento) =>
        agendamento.data >= dataHoje
    );

  return (
    <div>
      <div className="titulo-clientes">
        <h1>
          Agendamentos
        </h1>

        <button
          onClick={
            novoAgendamentoFormulario
          }
        >
          + Novo Agendamento
        </button>
      </div>

      {mensagemErro && (
        <p className="mensagem-erro">
          {mensagemErro}
        </p>
      )}

      {mostrarFormulario && (
        <form
          className="formulario"
          onSubmit={
            salvarAgendamento
          }
        >
          <select
            value={
              novoAgendamento.cliente
            }
            onChange={(e) =>
              alterarCliente(
                e.target.value
              )
            }
          >
            <option value="">
              Selecione o cliente
            </option>

            {clientes.map(
              (cliente) => (
                <option
                  key={
                    cliente._id
                  }
                  value={
                    cliente._id
                  }
                >
                  {cliente.nome}
                </option>
              )
            )}
          </select>

          <select
            value={
              novoAgendamento.pet
            }
            onChange={(e) => {
              setMensagemErro("");

              setNovoAgendamento({
                ...novoAgendamento,
                pet: e.target.value
              });
            }}
            disabled={
              !novoAgendamento.cliente
            }
          >
            <option value="">
              {!novoAgendamento.cliente
                ? "Escolha primeiro o cliente"
                : petsDoCliente()
                    .length === 0
                ? "Este cliente não possui pets"
                : "Selecione o pet"}
            </option>

            {petsDoCliente().map(
              (pet) => (
                <option
                  key={pet._id}
                  value={pet._id}
                >
                  {pet.nome}
                </option>
              )
            )}
          </select>

          <select
            value={
              novoAgendamento.servico
            }
            onChange={(e) => {
              setMensagemErro("");

              setNovoAgendamento({
                ...novoAgendamento,
                servico:
                  e.target.value
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
            value={
              novoAgendamento.data
            }
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
            value={
              novoAgendamento.horario
            }
            onChange={(e) => {
              setMensagemErro("");

              setNovoAgendamento({
                ...novoAgendamento,
                horario:
                  e.target.value
              });
            }}
            disabled={
              !novoAgendamento.data
            }
          >
            <option value="">
              {!novoAgendamento.data
                ? "Escolha primeiro a data"
                : "Escolha um horário"}
            </option>

            {horarios.map(
              (horario) => (
                <option
                  key={horario}
                  value={horario}
                  disabled={
                    horarioOcupado(
                      horario
                    ) ||
                    horarioJaPassou(
                      horario
                    )
                  }
                >
                  {horario}

                  {horarioOcupado(
                    horario
                  )
                    ? " - Ocupado"
                    : horarioJaPassou(
                        horario
                      )
                    ? " - Horário encerrado"
                    : " - Disponível"}
                </option>
              )
            )}
          </select>

          <select
            value={
              novoAgendamento.status
            }
            onChange={(e) => {
              setMensagemErro("");

              setNovoAgendamento({
                ...novoAgendamento,
                status:
                  e.target.value
              });
            }}
          >
            <option value="Pendente">
              Pendente
            </option>

            <option value="Confirmado">
              Confirmado
            </option>
          </select>

          <button type="submit">
            {editando !== null
              ? "Salvar Alterações"
              : "Salvar Agendamento"}
          </button>

          <button
            type="button"
            onClick={
              limparFormulario
            }
          >
            Cancelar
          </button>
        </form>
      )}

      <h2>
        Agendamentos
      </h2>

      <div className="pets-container">
        {agendamentosFuturos.length ===
        0 ? (
          <p>
            Nenhum agendamento
            encontrado.
          </p>
        ) : (
          agendamentosFuturos.map(
            (agendamento) => {
              const pet =
                typeof agendamento.pet ===
                "object"
                  ? agendamento.pet
                      ?.nome
                  : agendamento.pet;

              const cliente =
                typeof agendamento.cliente ===
                "object"
                  ? agendamento
                      .cliente?.nome
                  : "Cliente não encontrado";

              return (
                <div
                  className="pet-card"
                  key={
                    agendamento._id
                  }
                >
                  <h2>
                    {pet ||
                      "Pet não encontrado"}
                  </h2>

                  <p>
                    <span className="info-label">
                      Cliente:
                    </span>{" "}
                    {cliente}
                  </p>

                  <p>
                    <span className="info-label">
                      Serviço:
                    </span>{" "}
                    {
                      agendamento.servico
                    }
                  </p>

                  <p>
                    <span className="info-label">
                      Data:
                    </span>{" "}
                    {
                      agendamento.data
                    }
                  </p>

                  <p>
                    <span className="info-label">
                      Horário:
                    </span>{" "}
                    {
                      agendamento.horario
                    }
                  </p>

                  <p>
                    <span className="info-label">
                      Status:
                    </span>{" "}
                    {
                      agendamento.status
                    }
                  </p>

                  <button
                    className="botao-card"
                    onClick={() =>
                      editarAgendamento(
                        agendamento
                      )
                    }
                  >
                    Editar
                  </button>

                  <button
                    className="botao-card"
                    onClick={() =>
                      removerAgendamento(
                        agendamento._id
                      )
                    }
                  >
                    Remover
                  </button>
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
}

export default Agendamentos;