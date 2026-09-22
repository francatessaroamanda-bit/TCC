import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function HomeCliente() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [pets, setPets] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [mostrarAgendamento, setMostrarAgendamento] = useState(false);
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
      const usuario = JSON.parse(
        localStorage.getItem("usuarioCadastrado")
      );

      if (!usuario) {
        navigate("/login");
        return;
      }

      const [clientesRes, petsRes, servicosRes, agendamentosRes] =
        await Promise.all([
          fetch(`${API}/clientes`),
          fetch(`${API}/pets`),
          fetch(`${API}/servicos`),
          fetch(`${API}/agendamentos`)
        ]);

      const clientes = await clientesRes.json();
      const todosPets = await petsRes.json();
      const todosServicos = await servicosRes.json();
      const todosAgendamentos = await agendamentosRes.json();

      const clienteAtual = clientes.find(
        (item) =>
          item.email.toLowerCase() ===
          usuario.email.toLowerCase()
      );

      if (!clienteAtual) {
        localStorage.removeItem("usuarioCadastrado");
        navigate("/cadastro");
        return;
      }

      setCliente(clienteAtual);

      setPets(
        todosPets.filter((pet) => {
          const dono =
            typeof pet.dono === "object"
              ? pet.dono?._id
              : pet.dono;

          return dono === clienteAtual._id;
        })
      );

      setServicos(todosServicos);

      setAgendamentos(
        todosAgendamentos.filter((agendamento) => {
          const idCliente =
            typeof agendamento.cliente === "object"
              ? agendamento.cliente?._id
              : agendamento.cliente;

          return idCliente === clienteAtual._id;
        })
      );

    } catch (error) {
      console.error(error);
      setMensagemErro("Não foi possível carregar seus dados.");
    }
  }

  function abrirAgendamento() {
    if (pets.length === 0) {
      setMensagemErro(
        "Você ainda não possui pets cadastrados."
      );
      return;
    }

    setMensagemErro("");
    setForm({
      pet: "",
      servico: "",
      data: "",
      horario: ""
    });
    setMostrarAgendamento(true);
  }

  function horarioOcupado(horario) {
    return agendamentos.some(
      (item) =>
        item.data === form.data &&
        item.horario === horario
    );
  }

  function horarioPassou(horario) {
    if (!form.data) return false;

    const agora = new Date();
    const selecionado = new Date(
      `${form.data}T${horario}:00`
    );

    return selecionado <= agora;
  }

  async function fazerAgendamento(e) {
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
      const resposta = await fetch(
        `${API}/agendamentos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cliente: cliente._id,
            ...form,
            status: "Pendente"
          })
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem || "Erro ao realizar agendamento."
        );
        return;
      }

      setAgendamentos([
        ...agendamentos,
        dados
      ]);

      setForm({
        pet: "",
        servico: "",
        data: "",
        horario: ""
      });

      setMostrarAgendamento(false);

    } catch (error) {
      console.error(error);
      setMensagemErro("Erro ao conectar com o servidor.");
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


      <section className="cliente-secao">
        <h2>Meus pets</h2>

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
                <h2>{pet.nome}</h2>

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


      <section className="cliente-secao">

        <div className="cliente-titulo">
          <h2>Agendamento</h2>

          <button onClick={abrirAgendamento}>
            + Novo Agendamento
          </button>
        </div>

        {mostrarAgendamento && (
          <form
            className="formulario"
            onSubmit={fazerAgendamento}
          >

            <select
              value={form.pet}
              onChange={(e) =>
                setForm({
                  ...form,
                  pet: e.target.value
                })
              }
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
              value={form.servico}
              onChange={(e) =>
                setForm({
                  ...form,
                  servico: e.target.value
                })
              }
            >
              <option value="">
                Selecione o serviço
              </option>

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
              min={new Date()
                .toISOString()
                .split("T")[0]}
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

              {horarios.map((horario) => (
                <option
                  key={horario}
                  value={horario}
                  disabled={
                    horarioOcupado(horario) ||
                    horarioPassou(horario)
                  }
                >
                  {horario}

                  {horarioOcupado(horario)
                    ? " - Ocupado"
                    : horarioPassou(horario)
                    ? " - Encerrado"
                    : ""}
                </option>
              ))}
            </select>


            <button type="submit">
              Confirmar Agendamento
            </button>

            <button
              type="button"
              onClick={() => setMostrarAgendamento(false)}
            >
              Cancelar
            </button>

          </form>
        )}

      </section>

    </div>
  );
}

export default HomeCliente;