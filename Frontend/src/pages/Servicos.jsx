import { useState } from "react";

function Servicos() {
  const adminLogado =
    sessionStorage.getItem("adminLogado") === "true";

  const [servicos, setServicos] = useState([
    {
      id: 1,
      nome: "Banho",
      descricao: "Banho completo para o pet",
      preco: "50,00"
    },
    {
      id: 2,
      nome: "Tosa",
      descricao: "Tosa completa",
      preco: "70,00"
    },
    {
      id: 3,
      nome: "Banho e Tosa",
      descricao: "Banho e tosa completa",
      preco: "100,00"
    }
  ]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [editando, setEditando] =
    useState(null);

  const [mensagemErro, setMensagemErro] =
    useState("");

  const [novoServico, setNovoServico] =
    useState({
      nome: "",
      descricao: "",
      preco: ""
    });

  function limparFormulario() {
    setNovoServico({
      nome: "",
      descricao: "",
      preco: ""
    });

    setMensagemErro("");

    setEditando(null);

    setMostrarFormulario(false);
  }

  function novoServicoFormulario() {
    setEditando(null);

    setMensagemErro("");

    setNovoServico({
      nome: "",
      descricao: "",
      preco: ""
    });

    setMostrarFormulario(true);
  }

  function editarServico(servico) {
    setEditando(servico.id);

    setMensagemErro("");

    setNovoServico({
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco
    });

    setMostrarFormulario(true);
  }

  function salvarServico(e) {
    e.preventDefault();

    setMensagemErro("");

    if (
      !novoServico.nome.trim() ||
      !novoServico.descricao.trim() ||
      !novoServico.preco.trim()
    ) {
      setMensagemErro(
        "Preencha todos os campos."
      );

      return;
    }

    if (editando !== null) {
      setServicos((listaAtual) =>
        listaAtual.map((servico) =>
          servico.id === editando
            ? {
                ...servico,
                ...novoServico
              }
            : servico
        )
      );
    } else {
      setServicos((listaAtual) => [
        ...listaAtual,
        {
          id: Date.now(),
          ...novoServico
        }
      ]);
    }

    limparFormulario();
  }

  function removerServico(id) {
    setMensagemErro("");

    setServicos((listaAtual) =>
      listaAtual.filter(
        (servico) =>
          servico.id !== id
      )
    );
  }

  return (
    <div>
      <div className="titulo-clientes">
        <h1>
          Serviços
        </h1>

        {adminLogado && (
          <button
            onClick={
              novoServicoFormulario
            }
          >
            + Novo Serviço
          </button>
        )}
      </div>

      {mensagemErro && (
        <p className="mensagem-erro">
          {mensagemErro}
        </p>
      )}

      {adminLogado &&
        mostrarFormulario && (
          <form
            className="formulario"
            onSubmit={salvarServico}
          >
            <input
              type="text"
              placeholder="Nome do serviço"
              value={novoServico.nome}
              onChange={(e) => {
                setMensagemErro("");

                setNovoServico({
                  ...novoServico,
                  nome: e.target.value
                });
              }}
            />

            <input
              type="text"
              placeholder="Descrição"
              value={
                novoServico.descricao
              }
              onChange={(e) => {
                setMensagemErro("");

                setNovoServico({
                  ...novoServico,
                  descricao:
                    e.target.value
                });
              }}
            />

            <input
              type="text"
              placeholder="Preço"
              value={novoServico.preco}
              onChange={(e) => {
                setMensagemErro("");

                setNovoServico({
                  ...novoServico,
                  preco: e.target.value
                });
              }}
            />

            <button type="submit">
              {editando !== null
                ? "Salvar Alterações"
                : "Salvar Serviço"}
            </button>

            <button
              type="button"
              className="botao-cancelar"
              onClick={
                limparFormulario
              }
            >
              Cancelar
            </button>
          </form>
        )}

      <div className="pets-container">
        {servicos.map((servico) => (
          <div
            className="pet-card"
            key={servico.id}
          >
            <h2>
              {servico.nome}
            </h2>

            <p>
              <span className="info-label">
                Descrição:
              </span>{" "}
              {servico.descricao}
            </p>

            <p>
              <span className="info-label">
                Preço:
              </span>{" "}
              R$ {servico.preco}
            </p>

            {adminLogado && (
              <>
                <button
                  className="botao-card"
                  onClick={() =>
                    editarServico(
                      servico
                    )
                  }
                >
                  Editar
                </button>

                <button
                  className="botao-card"
                  onClick={() =>
                    removerServico(
                      servico.id
                    )
                  }
                >
                  Remover
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Servicos;