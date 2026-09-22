import { useEffect, useState } from "react";

function Servicos() {
  // Verifica se quem está usando o sistema é o administrador.
  const adminLogado =
    sessionStorage.getItem("adminLogado") === "true";

  // Guarda a lista de serviços vindos do banco.
  const [servicos, setServicos] = useState([]);

  // Controla a exibição do formulário.
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  // Guarda o ID do serviço que está sendo editado.
  // Quando for null, significa que é um novo serviço.
  const [editando, setEditando] =
    useState(null);

  // Guarda mensagens de erro.
  const [mensagemErro, setMensagemErro] =
    useState("");

  // Dados do formulário.
  const [novoServico, setNovoServico] =
    useState({
      nome: "",
      descricao: "",
      preco: ""
    });


  // =====================================================
  // BUSCAR SERVIÇOS
  // Executado quando a página é carregada.
  // =====================================================
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


      const dados = await resposta.json();

      setServicos(dados);

    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Não foi possível carregar os serviços."
      );
    }
  }


  // =====================================================
  // LIMPAR FORMULÁRIO
  // Volta o formulário para o estado inicial.
  // =====================================================
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


  // =====================================================
  // ABRIR FORMULÁRIO DE NOVO SERVIÇO
  // =====================================================
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


  // =====================================================
  // EDITAR SERVIÇO
  // Preenche o formulário com os dados do serviço.
  // =====================================================
  function editarServico(servico) {
    setEditando(servico._id);

    setMensagemErro("");

    setNovoServico({
      nome: servico.nome || "",
      descricao: servico.descricao || "",
      preco:
        servico.preco !== undefined
          ? String(servico.preco).replace(".", ",")
          : ""
    });

    setMostrarFormulario(true);
  }


  // =====================================================
  // SALVAR SERVIÇO
  // Faz POST para novo serviço ou PUT para edição.
  // =====================================================
  async function salvarServico(e) {
    e.preventDefault();

    setMensagemErro("");


    // Verifica se todos os campos foram preenchidos.
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


    // Define se estamos cadastrando ou editando.
    const editandoServico =
      editando !== null;


    // Define a URL da requisição.
    const url = editandoServico
      ? `http://localhost:5000/api/servicos/${editando}`
      : "http://localhost:5000/api/servicos";


    try {
      const resposta = await fetch(
        url,
        {
          // PUT para editar
          // POST para cadastrar
          method: editandoServico
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          // Envia os dados para o backend.
          body: JSON.stringify({
            nome: novoServico.nome,
            descricao: novoServico.descricao,
            preco: novoServico.preco
          })
        }
      );


      const dados =
        await resposta.json();


      // Caso o backend retorne erro.
      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Erro ao salvar serviço."
        );

        return;
      }


      // Se estiver editando,
      // substitui o serviço antigo pelo atualizado.
      if (editandoServico) {
        setServicos((listaAtual) =>
          listaAtual.map((servico) =>
            servico._id === editando
              ? dados
              : servico
          )
        );

      } else {
        // Se for cadastro,
        // adiciona o novo serviço no início da lista.
        setServicos((listaAtual) => [
          dados,
          ...listaAtual
        ]);
      }


      // Limpa e fecha o formulário.
      limparFormulario();

    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Erro ao conectar com o servidor."
      );
    }
  }


  // =====================================================
  // REMOVER SERVIÇO
  // Exclui o serviço do MongoDB.
  // =====================================================
  async function removerServico(id) {
    setMensagemErro("");


    try {
      const resposta = await fetch(
        `http://localhost:5000/api/servicos/${id}`,
        {
          method: "DELETE"
        }
      );


      const dados =
        await resposta.json();


      // Caso aconteça algum erro no backend.
      if (!resposta.ok) {
        setMensagemErro(
          dados.mensagem ||
            "Erro ao remover serviço."
        );

        return;
      }


      // Remove o serviço da tela.
      setServicos((listaAtual) =>
        listaAtual.filter(
          (servico) =>
            servico._id !== id
        )
      );

    } catch (error) {
      console.error(error);

      setMensagemErro(
        "Erro ao conectar com o servidor."
      );
    }
  }


  return (
    <div>

      {/* Título e botão de novo serviço */}
      <div className="titulo-clientes">

        <h1>
          Serviços
        </h1>


        {/* Somente o administrador pode cadastrar */}
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


      {/* Mensagem de erro */}
      {mensagemErro && (
        <p className="mensagem-erro">
          {mensagemErro}
        </p>
      )}


      {/* Formulário somente para o administrador */}
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


      {/* Lista de serviços */}
      <div className="pets-container">

        {servicos.map((servico) => (

          <div
            className="pet-card"
            key={servico._id}
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
              R${" "}
              {Number(servico.preco)
                .toFixed(2)
                .replace(".", ",")}
            </p>


            {/* Somente o administrador pode editar/remover */}
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
                      servico._id
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