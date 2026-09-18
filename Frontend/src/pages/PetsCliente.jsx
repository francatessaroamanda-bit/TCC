import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PetsCliente() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [pets, setPets] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [editando, setEditando] = useState(null);

  const [mensagemErro, setMensagemErro] =
    useState("");

  const [novoPet, setNovoPet] = useState({
    nome: "",
    especie: "",
    raca: ""
  });


  // ==========================================
  // CARREGAR DADOS
  // ==========================================

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


      // ========================================
      // BUSCAR CLIENTE
      // ========================================

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


      // ========================================
      // BUSCAR PETS
      // ========================================

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

    } catch (error) {

      console.error(error);

      setMensagemErro(
        "Não foi possível carregar seus pets."
      );

    }
  }


  // ==========================================
  // LIMPAR FORMULÁRIO
  // ==========================================

  function limparFormulario() {

    setNovoPet({
      nome: "",
      especie: "",
      raca: ""
    });

    setMensagemErro("");

    setEditando(null);

    setMostrarFormulario(false);
  }


  // ==========================================
  // NOVO PET
  // ==========================================

  function novoPetFormulario() {

    setEditando(null);

    setMensagemErro("");

    setNovoPet({
      nome: "",
      especie: "",
      raca: ""
    });

    setMostrarFormulario(true);
  }


  // ==========================================
  // EDITAR PET
  // ==========================================

  function editarPet(pet) {

    setEditando(pet._id);

    setMensagemErro("");

    setNovoPet({
      nome: pet.nome || "",
      especie: pet.especie || "",
      raca: pet.raca || ""
    });

    setMostrarFormulario(true);
  }


  // ==========================================
  // SALVAR PET
  // ==========================================

  async function salvarPet(e) {

    e.preventDefault();

    setMensagemErro("");


    if (
      !novoPet.nome.trim() ||
      !novoPet.especie.trim() ||
      !novoPet.raca.trim()
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


    const editandoPet =
      editando !== null;


    const url = editandoPet
      ? `http://localhost:5000/api/pets/${editando}`
      : "http://localhost:5000/api/pets";


    try {

      const resposta = await fetch(
        url,
        {
          method: editandoPet
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            nome: novoPet.nome,
            especie: novoPet.especie,
            raca: novoPet.raca,

            // O dono sempre será o
            // cliente logado
            dono: cliente._id
          })
        }
      );


      const dados =
        await resposta.json();


      if (!resposta.ok) {

        setMensagemErro(
          dados.mensagem ||
            "Erro ao salvar pet."
        );

        return;
      }


      // ======================================
      // EDITAR
      // ======================================

      if (editandoPet) {

        setPets((listaAtual) =>
          listaAtual.map((pet) =>
            pet._id === editando
              ? dados
              : pet
          )
        );

        alert(
          "Pet alterado com sucesso!"
        );

      }


      // ======================================
      // NOVO PET
      // ======================================

      else {

        setPets((listaAtual) => [
          dados,
          ...listaAtual
        ]);

        alert(
          "Pet cadastrado com sucesso!"
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


  // ==========================================
  // REMOVER PET
  // ==========================================

  async function removerPet(id) {

    const confirmar =
      window.confirm(
        "Deseja realmente remover este pet?"
      );


    if (!confirmar) {
      return;
    }


    try {

      const resposta =
        await fetch(
          `http://localhost:5000/api/pets/${id}`,
          {
            method: "DELETE"
          }
        );


      const dados =
        await resposta.json();


      if (!resposta.ok) {

        alert(
          dados.mensagem ||
            "Erro ao remover pet."
        );

        return;
      }


      setPets((listaAtual) =>
        listaAtual.filter(
          (pet) =>
            pet._id !== id
        )
      );


      alert(
        "Pet removido com sucesso!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao conectar com o servidor."
      );

    }
  }


  // ==========================================
  // TELA
  // ==========================================

  return (
    <div>

      <div className="titulo-clientes">

        <h1>
          Meus Pets
        </h1>

        <button
          onClick={novoPetFormulario}
        >
          + Novo Pet
        </button>

      </div>


      {/* ======================================
          MENSAGEM DE ERRO
      ====================================== */}

      {mensagemErro && (
        <p className="mensagem-erro">
          {mensagemErro}
        </p>
      )}


      {/* ======================================
          FORMULÁRIO
      ====================================== */}

      {mostrarFormulario && (

        <form
          className="formulario"
          onSubmit={salvarPet}
        >

          <input
            type="text"
            placeholder="Nome do pet"
            value={novoPet.nome}
            onChange={(e) => {

              setMensagemErro("");

              setNovoPet({
                ...novoPet,
                nome: e.target.value
              });

            }}
          />


          <input
            type="text"
            placeholder="Espécie"
            value={novoPet.especie}
            onChange={(e) => {

              setMensagemErro("");

              setNovoPet({
                ...novoPet,
                especie: e.target.value
              });

            }}
          />


          <input
            type="text"
            placeholder="Raça"
            value={novoPet.raca}
            onChange={(e) => {

              setMensagemErro("");

              setNovoPet({
                ...novoPet,
                raca: e.target.value
              });

            }}
          />


          <button type="submit">

            {editando !== null
              ? "Salvar Alterações"
              : "Salvar Pet"}

          </button>


          <button
            type="button"
            onClick={limparFormulario}
          >
            Cancelar
          </button>

        </form>

      )}


      {/* ======================================
          LISTA DOS PETS
      ====================================== */}

      {pets.length === 0 ? (

        <div className="cliente-vazio">

          <p>
            Você ainda não possui pets cadastrados.
          </p>

          <small>
            Clique em "+ Novo Pet" para cadastrar
            seu pet.
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


              <button
                className="botao-card"
                onClick={() =>
                  editarPet(pet)
                }
              >
                Editar
              </button>


              <button
                className="botao-card"
                onClick={() =>
                  removerPet(pet._id)
                }
              >
                Remover
              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default PetsCliente;