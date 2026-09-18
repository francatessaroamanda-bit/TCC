import { useEffect, useState } from "react";

function Pets() {
  const [pets, setPets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [novoPet, setNovoPet] = useState({
    nome: "",
    especie: "",
    raca: "",
    dono: ""
  });

  useEffect(() => {
    buscarPets();
    buscarClientes();
  }, []);

  async function buscarPets() {
    try {
      const resposta = await fetch("http://localhost:5000/api/pets");
      if (!resposta.ok) throw new Error();
      setPets(await resposta.json());
    } catch (error) {
      console.error(error);
      alert("Não foi possível carregar os pets.");
    }
  }

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
    setNovoPet({
      nome: "",
      especie: "",
      raca: "",
      dono: ""
    });
    setEditando(null);
    setMostrarFormulario(false);
  }

  function novoCadastro() {
    if (clientes.length === 0) {
      alert(
        "Não existem clientes cadastrados. Cadastre um cliente antes de cadastrar um pet."
      );
      return;
    }

    setEditando(null);
    setNovoPet({
      nome: "",
      especie: "",
      raca: "",
      dono: ""
    });
    setMostrarFormulario(true);
  }

  function editarPet(pet) {
    setEditando(pet._id);
    setNovoPet({
      nome: pet.nome || "",
      especie: pet.especie || "",
      raca: pet.raca || "",
      dono: pet.dono?._id || pet.dono || ""
    });
    setMostrarFormulario(true);
  }

  async function salvarPet(e) {
    e.preventDefault();

    if (
      !novoPet.nome.trim() ||
      !novoPet.especie.trim() ||
      !novoPet.raca.trim() ||
      !novoPet.dono
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    const editandoPet = editando !== null;
    const url = editandoPet
      ? `http://localhost:5000/api/pets/${editando}`
      : "http://localhost:5000/api/pets";

    try {
      const resposta = await fetch(url, {
        method: editandoPet ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(novoPet)
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(
          dados.mensagem || "Erro ao salvar pet."
        );
        return;
      }

      if (editandoPet) {
        setPets((listaAtual) =>
          listaAtual.map((pet) =>
            pet._id === editando ? dados : pet
          )
        );
      } else {
        setPets((listaAtual) => [
          dados,
          ...listaAtual
        ]);
      }

      limparFormulario();
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  async function removerPet(id) {
    if (!window.confirm("Deseja remover este pet?")) {
      return;
    }

    try {
      const resposta = await fetch(
        `http://localhost:5000/api/pets/${id}`,
        {
          method: "DELETE"
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(
          dados.mensagem || "Erro ao remover pet."
        );
        return;
      }

      setPets((listaAtual) =>
        listaAtual.filter((pet) => pet._id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div>
      <div className="titulo-clientes">
        <h1>Pets cadastrados</h1>

        <button onClick={novoCadastro}>
          + Novo Pet
        </button>
      </div>

      {mostrarFormulario && (
        <form
          className="formulario"
          onSubmit={salvarPet}
        >
          <input
            type="text"
            placeholder="Nome do pet"
            value={novoPet.nome}
            onChange={(e) =>
              setNovoPet({
                ...novoPet,
                nome: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Espécie"
            value={novoPet.especie}
            onChange={(e) =>
              setNovoPet({
                ...novoPet,
                especie: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Raça"
            value={novoPet.raca}
            onChange={(e) =>
              setNovoPet({
                ...novoPet,
                raca: e.target.value
              })
            }
          />

          <select
            value={novoPet.dono}
            onChange={(e) =>
              setNovoPet({
                ...novoPet,
                dono: e.target.value
              })
            }
          >
            <option value="">
              Selecione o cliente
            </option>

            {clientes.map((cliente) => (
              <option
                key={cliente._id}
                value={cliente._id}
              >
                {cliente.nome}
              </option>
            ))}
          </select>

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

            <p>
              <span className="info-label">
                Dono:
              </span>{" "}
              {pet.dono?.nome ||
                "Cliente não encontrado"}
            </p>

            <button
              className="botao-card"
              onClick={() => editarPet(pet)}
            >
              Editar
            </button>

            <button
              className="botao-card"
              onClick={() => removerPet(pet._id)}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pets;