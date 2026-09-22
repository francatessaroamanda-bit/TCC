import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensagemErro, setMensagemErro] = useState("");

  const [form, setForm] = useState({
    cliente: "",
    pet: "",
    servico: "",
    data: "",
    horario: "",
    status: "Pendente"
  });

  const horarios = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const hoje = new Date();
  const dataHoje = hoje.toISOString().split("T")[0];

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [a, c, p, s] = await Promise.all([
        fetch(`${API}/agendamentos`),
        fetch(`${API}/clientes`),
        fetch(`${API}/pets`),
        fetch(`${API}/servicos`)
      ]);

      if (!a.ok || !c.ok || !p.ok || !s.ok) {
        throw new Error();
      }

      setAgendamentos(await a.json());
      setClientes(await c.json());
      setPets(await p.json());
      setServicos(await s.json());
    } catch (error) {
      console.error(error);
      setMensagemErro("Não foi possível carregar os dados.");
    }
  }

  function limparFormulario() {
    setForm({
      cliente: "",
      pet: "",
      servico: "",
      data: "",
      horario: "",
      status: "Pendente"
    });
    setEditando(null);
    setMostrarFormulario(false);
    setMensagemErro("");
  }

  function abrirNovo() {
    if (clientes.length === 0) {
      setMensagemErro("Cadastre um cliente antes.");
      return;
    }

    if (pets.length === 0) {
      setMensagemErro("Cadastre um pet antes.");
      return;
    }

    if (servicos.length === 0) {
      setMensagemErro("Cadastre um serviço antes.");
      return;
    }

    limparFormulario();
    setMostrarFormulario(true);
  }

  function petsDoCliente() {
    return pets.filter((pet) => {
      const dono = typeof pet.dono === "object"
        ? pet.dono?._id
        : pet.dono;

      return dono === form.cliente;
    });
  }

  function horarioOcupado(horario) {
    return agendamentos.some(
      (item) =>
        item.data === form.data &&
        item.horario === horario &&
        item._id !== editando
    );
  }

  function horarioPassou(horario) {
    if (form.data !== dataHoje) return false;

    const agora = new Date();
    const selecionado = new Date(
      `${form.data}T${horario}:00`
    );

    return selecionado <= agora;
  }

  function validar() {
    if (
      !form.cliente ||
      !form.pet ||
      !form.servico ||
      !form.data ||
      !form.horario
    ) {
      setMensagemErro("Preencha todos os campos.");
      return false;
    }

    if (horarioOcupado(form.horario)) {
      setMensagemErro("Esse horário já está ocupado.");
      return false;
    }

    if (horarioPassou(form.horario)) {
      setMensagemErro("Esse horário já passou.");
      return false;
    }

    return true;
  }

  async function salvar(e) {
    e.preventDefault();

    setMensagemErro("");

    if (!validar()) return;

    const url = editando
      ? `${API}/agendamentos/${editando}`
      : `${API}/agendamentos`;

    const metodo = editando ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem || "Erro ao salvar agendamento."
        );
        return;
      }

      if (editando) {
        setAgendamentos((lista) =>
          lista.map((item) =>
            item._id === editando ? dados : item
          )
        );
      } else {
        setAgendamentos((lista) => [...lista, dados]);
      }

      limparFormulario();
    } catch (error) {
      console.error(error);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  }

  function editar(agendamento) {
    const cliente =
      typeof agendamento.cliente === "object"
        ? agendamento.cliente?._id
        : agendamento.cliente;

    const pet =
      typeof agendamento.pet === "object"
        ? agendamento.pet?._id
        : agendamento.pet;

    setEditando(agendamento._id);
    setForm({
      cliente: cliente || "",
      pet: pet || "",
      servico: agendamento.servico || "",
      data: agendamento.data || "",
      horario: agendamento.horario || "",
      status: agendamento.status || "Pendente"
    });
    setMensagemErro("");
    setMostrarFormulario(true);
  }

  async function remover(id) {
    try {
      const resposta = await fetch(
        `${API}/agendamentos/${id}`,
        { method: "DELETE" }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem || "Erro ao remover agendamento."
        );
        return;
      }

      setAgendamentos((lista) =>
        lista.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error(error);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  }

  const futuros = agendamentos.filter(
    (item) => item.data >= dataHoje
  );

  return (
    <div>
      <div className="titulo-clientes">
        <h1>Agendamentos</h1>

        <button onClick={abrirNovo}>
          + Novo Agendamento
        </button>
      </div>

      {mensagemErro && (
        <p className="mensagem-erro">{mensagemErro}</p>
      )}

      {mostrarFormulario && (
        <form className="formulario" onSubmit={salvar}>
          <select
            value={form.cliente}
            onChange={(e) =>
              setForm({
                ...form,
                cliente: e.target.value,
                pet: ""
              })
            }
          >
            <option value="">Selecione o cliente</option>

            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nome}
              </option>
            ))}
          </select>

          <select
            value={form.pet}
            disabled={!form.cliente}
            onChange={(e) =>
              setForm({
                ...form,
                pet: e.target.value
              })
            }
          >
            <option value="">
              {!form.cliente
                ? "Escolha primeiro o cliente"
                : "Selecione o pet"}
            </option>

            {petsDoCliente().map((pet) => (
              <option key={pet._id} value={pet._id}>
                {pet.nome}
              </option>
            ))}
          </select>

          <select
            value={form.servico}
            onChange={(e) =>
              setForm({
                ...form,
                servico: e.target.value
              })
            }
          >
            <option value="">Selecione o serviço</option>

            {servicos.map((servico) => (
              <option
                key={servico._id}
                value={servico.nome}
              >
                {servico.nome} - R${" "}
                {Number(servico.preco)
                  .toFixed(2)
                  .replace(".", ",")}
              </option>
            ))}
          </select>

          <input
            type="date"
            min={dataHoje}
            value={form.data}
            onChange={(e) =>
              setForm({
                ...form,
                data: e.target.value,
                horario: ""
              })
            }
          />

          <select
            value={form.horario}
            disabled={!form.data}
            onChange={(e) =>
              setForm({
                ...form,
                horario: e.target.value
              })
            }
          >
            <option value="">Selecione o horário</option>

            {horarios.map((horario) => {
              const ocupado = horarioOcupado(horario);
              const passado = horarioPassou(horario);

              return (
                <option
                  key={horario}
                  value={horario}
                  disabled={ocupado || passado}
                >
                  {horario}
                  {ocupado
                    ? " - Ocupado"
                    : passado
                    ? " - Encerrado"
                    : " - Disponível"}
                </option>
              );
            })}
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value
              })
            }
          >
            <option value="Pendente">Pendente</option>
            <option value="Confirmado">Confirmado</option>
          </select>

          <button type="submit">
            {editando
              ? "Salvar Alterações"
              : "Salvar Agendamento"}
          </button>

          <button type="button" onClick={limparFormulario}>
            Cancelar
          </button>
        </form>
      )}

      <h2>Agendamentos</h2>

      <div className="pets-container">
        {futuros.length === 0 ? (
          <p>Nenhum agendamento encontrado.</p>
        ) : (
          futuros.map((agendamento) => {
            const pet =
              typeof agendamento.pet === "object"
                ? agendamento.pet?.nome
                : agendamento.pet;

            const cliente =
              typeof agendamento.cliente === "object"
                ? agendamento.cliente?.nome
                : "Cliente não encontrado";

            return (
              <div
                className="pet-card"
                key={agendamento._id}
              >
                <h2>{pet || "Pet não encontrado"}</h2>

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
                  {agendamento.servico}
                </p>

                <p>
                  <span className="info-label">Data:</span>{" "}
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

                <button
                  className="botao-card"
                  onClick={() => editar(agendamento)}
                >
                  Editar
                </button>

                <button
                  className="botao-card"
                  onClick={() =>
                    remover(agendamento._id)
                  }
                >
                  Remover
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Agendamentos;