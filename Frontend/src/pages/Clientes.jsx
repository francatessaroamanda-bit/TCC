import { useEffect, useState } from "react";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensagemErro, setMensagemErro] = useState("");
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    email: ""
  });

  useEffect(() => {
    buscarClientes();
  }, []);

  async function buscarClientes() {
    try {
      const resposta = await fetch("http://localhost:5000/api/clientes");
      if (!resposta.ok) throw new Error();
      setClientes(await resposta.json());
    } catch (error) {
      console.error(error);
      alert("Não foi possível carregar os clientes.");
    }
  }

  function limparFormulario() {
    setNovoCliente({
      nome: "",
      telefone: "",
      email: ""
    });
    setMensagemErro("");
    setEditando(null);
    setMostrarFormulario(false);
  }

  function novoClienteFormulario() {
    setEditando(null);
    setMensagemErro("");
    setNovoCliente({
      nome: "",
      telefone: "",
      email: ""
    });
    setMostrarFormulario(true);
  }

  function editarCliente(cliente) {
    setEditando(cliente._id);
    setMensagemErro("");
    setNovoCliente({
      nome: cliente.nome || "",
      telefone: cliente.telefone || "",
      email: cliente.email || ""
    });
    setMostrarFormulario(true);
  }

  async function salvarCliente(e) {
    e.preventDefault();
    setMensagemErro("");

    if (
      !novoCliente.nome.trim() ||
      !novoCliente.telefone.trim() ||
      !novoCliente.email.trim()
    ) {
      setMensagemErro("Preencha todos os campos.");
      return;
    }

    const editandoCliente = editando !== null;
    const url = editandoCliente
      ? `http://localhost:5000/api/clientes/${editando}`
      : "http://localhost:5000/api/clientes";

    try {
      const resposta = await fetch(url, {
        method: editandoCliente ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(novoCliente)
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem || "Erro ao salvar cliente."
        );
        return;
      }

      if (editandoCliente) {
        setClientes((listaAtual) =>
          listaAtual.map((cliente) =>
            cliente._id === editando ? dados : cliente
          )
        );
      } else {
        setClientes((listaAtual) => [
          dados,
          ...listaAtual
        ]);
      }

      limparFormulario();
    } catch (error) {
      console.error(error);
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  }

  async function removerCliente(id) {
    if (!window.confirm("Deseja remover este cliente?")) {
      return;
    }

    try {
      const resposta = await fetch(
        `http://localhost:5000/api/clientes/${id}`,
        {
          method: "DELETE"
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(
          dados.mensagem || "Erro ao remover cliente."
        );
        return;
      }

      setClientes((listaAtual) =>
        listaAtual.filter((cliente) => cliente._id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div>
      <div className="titulo-clientes">
        <h1>Clientes</h1>

        <button onClick={novoClienteFormulario}>
          + Novo Cliente
        </button>
      </div>

      {mostrarFormulario && (
        <form
          className="formulario"
          onSubmit={salvarCliente}
        >
          <input
            type="text"
            placeholder="Nome do cliente"
            value={novoCliente.nome}
            onChange={(e) => {
              setMensagemErro("");
              setNovoCliente({
                ...novoCliente,
                nome: e.target.value
              });
            }}
          />

          <input
            type="text"
            placeholder="Telefone"
            value={novoCliente.telefone}
            onChange={(e) => {
              setMensagemErro("");
              setNovoCliente({
                ...novoCliente,
                telefone: e.target.value
              });
            }}
          />

          <input
            type="email"
            placeholder="E-mail"
            value={novoCliente.email}
            onChange={(e) => {
              setMensagemErro("");
              setNovoCliente({
                ...novoCliente,
                email: e.target.value
              });
            }}
          />

          <button type="submit">
            {editando !== null
              ? "Salvar Alterações"
              : "Salvar Cliente"}
          </button>

          {mensagemErro && (
            <p className="mensagem-erro">
              {mensagemErro}
            </p>
          )}

          <button
            type="button"
            onClick={limparFormulario}
          >
            Cancelar
          </button>
        </form>
      )}

      <div className="pets-container">
        {clientes.map((cliente) => (
          <div
            className="pet-card"
            key={cliente._id}
          >
            <h2>{cliente.nome}</h2>

            <p>
              <span className="info-label">
                Telefone:
              </span>{" "}
              {cliente.telefone}
            </p>

            <p>
              <span className="info-label">
                Email:
              </span>{" "}
              {cliente.email}
            </p>

            <button
              className="botao-card"
              onClick={() => editarCliente(cliente)}
            >
              Editar
            </button>

            <button
              className="botao-card"
              onClick={() => removerCliente(cliente._id)}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clientes;