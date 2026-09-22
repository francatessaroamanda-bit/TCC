import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AgendamentosCliente() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [pets, setPets] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensagemErro, setMensagemErro] = useState("");

  const [form, setForm] = useState({
    pet: "",
    servico: "",
    data: "",
    horario: ""
  });

  const horarios = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const usuarioSalvo =
        localStorage.getItem("usuarioCadastrado");

      if (!usuarioSalvo) {
        navigate("/login", { replace: true });
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      const [clientesRes, petsRes, servicosRes, agendamentosRes] =
        await Promise.all([
          fetch(`${API}/clientes`),
          fetch(`${API}/pets`),
          fetch(`${API}/servicos`),
          fetch(`${API}/agendamentos`)
        ]);

      if (
        !clientesRes.ok ||
        !petsRes.ok ||
        !servicosRes.ok ||
        !agendamentosRes.ok
      ) {
        throw new Error();
      }

      const clientes = await clientesRes.json();
      const todosPets = await petsRes.json();
      const servicosBanco = await servicosRes.json();
      const todosAgendamentos = await agendamentosRes.json();

      const clienteEncontrado = clientes.find(
        (item) =>
          item.email.toLowerCase() ===
          usuario.email.toLowerCase()
      );

      if (!clienteEncontrado) {
        localStorage.removeItem("usuarioCadastrado");
        navigate("/cadastro", { replace: true });
        return;
      }

      const meusPets = todosPets.filter((pet) => {
        const dono =
          typeof pet.dono === "object"
            ? pet.dono?._id
            : pet.dono;

        return dono === clienteEncontrado._id;
      });

      const meusAgendamentos =
        todosAgendamentos.filter((item) => {
          const clienteId =
            typeof item.cliente === "object"
              ? item.cliente?._id
              : item.cliente;

          return clienteId === clienteEncontrado._id;
        });

      setCliente(clienteEncontrado);
      setPets(meusPets);
      setServicos(servicosBanco);
      setAgendamentos(meusAgendamentos);
    } catch (error) {
      console.error(error);
      setMensagemErro(
        "Não foi possível carregar seus dados."
      );
    }
  }

  function limparFormulario() {
    setForm({
      pet: "",
      servico: "",
      data: "",
      horario: ""
    });
    setEditando(null);
    setMostrarFormulario(false);
    setMensagemErro("");
  }

  function abrirNovo() {
    if (pets.length === 0) {
      setMensagemErro(
        "Cadastre um pet antes de realizar um agendamento."
      );
      return;
    }

    if (servicos.length === 0) {
      setMensagemErro(
        "Nenhum serviço disponível no momento."
      );
      return;
    }

    limparFormulario();
    setMostrarFormulario(true);
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
    if (!form.data) return false;

    const agora = new Date();
    const selecionado = new Date(
      `${form.data}T${horario}:00`
    );

    return selecionado < agora;
  }

  async function salvar(e) {
    e.preventDefault();

    setMensagemErro("");

    if (
      !form.pet ||
      !form.servico ||
      !form.data ||
      !form.horario
    ) {
      setMensagemErro("Preencha todos os campos.");
      return;
    }

    if (horarioOcupado(form.horario)) {
      setMensagemErro("Esse horário já está ocupado.");
      return;
    }

    if (horarioPassou(form.horario)) {
      setMensagemErro("Esse horário já passou.");
      return;
    }

    try {
      const url = editando
        ? `${API}/agendamentos/${editando}`
        : `${API}/agendamentos`;

      const resposta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cliente: cliente._id,
          pet: form.pet,
          servico: form.servico,
          data: form.data,
          horario: form.horario,
          status: "Pendente"
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Erro ao salvar agendamento."
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
        setAgendamentos((lista) => [
          ...lista,
          dados
        ]);
      }

      limparFormulario();
    } catch (error) {
      console.error(error);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  }

  function editar(agendamento) {
    const pet =
      typeof agendamento.pet === "object"
        ? agendamento.pet?._id
        : agendamento.pet;

    setEditando(agendamento._id);

    setForm({
      pet: pet || "",
      servico: agendamento.servico || "",
      data: agendamento.data || "",
      horario: agendamento.horario || ""
    });

    setMensagemErro("");
    setMostrarFormulario(true);
  }

  async function excluir(id) {
    try {
      const resposta = await fetch(
        `${API}/agendamentos/${id}`,
        { method: "DELETE" }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Erro ao excluir agendamento."
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

  return (
    <div>
      <div className="titulo-clientes">
        <h1>Meus Agendamentos</h1>

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
            value={form.pet}
            onChange={(e) =>
              setForm({
                ...form,
                pet: e.target.value
              })
            }
          >
            <option value="">Selecione seu pet</option>

            {pets.map((pet) => (
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
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
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
            <option value="">
              Selecione o horário
            </option>

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
                    ? " - Indisponível"
                    : ""}
                </option>
              );
            })}
          </select>

          <button type="submit">
            {editando
              ? "Salvar Alterações"
              : "Agendar"}
          </button>

          <button
            type="button"
            onClick={limparFormulario}
          >
            Cancelar
          </button>
        </form>
      )}

      {agendamentos.length === 0 ? (
        <div className="cliente-vazio">
          <p>Você ainda não possui agendamentos.</p>
          <small>
            Clique em "+ Novo Agendamento" para marcar um horário.
          </small>
        </div>
      ) : (
        <div className="pets-container">
          {agendamentos.map((agendamento) => {
            const pet =
              typeof agendamento.pet === "object"
                ? agendamento.pet
                : null;

            return (
              <div
                className="pet-card"
                key={agendamento._id}
              >
                <h2>{pet?.nome || "Pet"}</h2>

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

                <button
                  onClick={() =>
                    editar(agendamento)
                  }
                >
                  Editar
                </button>

                <button
                  className="botao-excluir"
                  onClick={() =>
                    excluir(agendamento._id)
                  }
                >
                  Excluir
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AgendamentosCliente;