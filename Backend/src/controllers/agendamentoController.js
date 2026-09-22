// Importa o Mongoose para trabalhar com o MongoDB
const mongoose = require("mongoose");

// Importa os modelos usados pelo agendamento.
const Agendamento = require("../models/Agendamento");
const Cliente = require("../models/Cliente");
const Pet = require("../models/Pet");


// =====================================================
// LISTAR AGENDAMENTOS
// =====================================================
async function listarAgendamentos(req, res) {
  try {
    const agendamentos = await Agendamento.find()
      // O populate transforma o ID do cliente nos dados do cliente, mostrando o nome.
      .populate("cliente", "nome")

      // Traz os dados do pet relacionado ao agendamento.
      .populate("pet", "nome especie raca dono")

      // Ordena primeiro pela data e depois pelo horário.
      .sort({ data: 1, horario: 1 });

    res.status(200).json(agendamentos);

  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);

    res.status(500).json({
      mensagem: "Erro ao buscar agendamentos"
    });
  }
}


// =====================================================
// CADASTRAR AGENDAMENTO
// Faz as validações antes de salvar o agendamento.
// =====================================================
async function cadastrarAgendamento(req, res) {
  try {
    const {
      cliente,
      pet,
      servico,
      data,
      horario,
      status
    } = req.body;


    // Verifica se os campos obrigatórios foram preenchidos.
    if (!cliente || !pet || !servico || !data || !horario) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos."
      });
    }


    // Verifica se o ID do cliente é válido no formato do MongoDB.
    if (!mongoose.Types.ObjectId.isValid(cliente)) {
      return res.status(400).json({
        mensagem: "Cliente inválido."
      });
    }


    // Verifica se o ID do pet é válido.
    if (!mongoose.Types.ObjectId.isValid(pet)) {
      return res.status(400).json({
        mensagem: "Pet inválido."
      });
    }


    // Procura o cliente no banco.
    const clienteEncontrado =
      await Cliente.findById(cliente);


    // Impede o agendamento caso o cliente não exista.
    if (!clienteEncontrado) {
      return res.status(404).json({
        mensagem:
          "O cliente informado não está cadastrado."
      });
    }


    // Procura o pet no banco.
    const petEncontrado =
      await Pet.findById(pet);


    // Impede o agendamento caso o pet não exista.
    if (!petEncontrado) {
      return res.status(404).json({
        mensagem:
          "O pet informado não está cadastrado."
      });
    }


    // REGRA DE NEGÓCIO IMPORTANTE:
    // verifica se o pet realmente pertence ao cliente selecionado.
    if (
      petEncontrado.dono.toString() !==
      cliente.toString()
    ) {
      return res.status(400).json({
        mensagem:
          "Este pet não pertence ao cliente selecionado."
      });
    }


    // Verifica se já existe outro agendamento na mesma data e horário.
    const horarioOcupado =
      await Agendamento.findOne({
        data,
        horario
      });


    // Impede dois agendamentos no mesmo horário.
    if (horarioOcupado) {
      return res.status(409).json({
        mensagem:
          "Este horário já está ocupado. Escolha outro horário."
      });
    }


    // Depois de todas as validações, o agendamento é salvo no MongoDB.
    const novoAgendamento =
      await Agendamento.create({
        cliente,
        pet,
        servico,
        data,
        horario,
        status: status || "Pendente"
      });


    // Busca novamente o registro para devolver os dados completos ao frontend.
    const agendamentoCompleto =
      await Agendamento.findById(
        novoAgendamento._id
      )
        .populate("cliente", "nome")
        .populate("pet", "nome especie raca dono");


    res.status(201).json(
      agendamentoCompleto
    );

  } catch (error) {
    console.error(
      "Erro ao cadastrar agendamento:",
      error
    );

    res.status(500).json({
      mensagem:
        "Erro ao cadastrar agendamento."
    });
  }
}


// =====================================================
// EDITAR AGENDAMENTO
// Atualiza um agendamento existente, repetindo as principais validações para manter as regras do sistema.
// =====================================================
async function editarAgendamento(req, res) {
  try {
    const { id } = req.params;

    const {
      cliente,
      pet,
      servico,
      data,
      horario,
      status
    } = req.body;


    // Verifica os campos obrigatórios.
    if (!cliente || !pet || !servico || !data || !horario) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos."
      });
    }


    // Valida os IDs recebidos.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensagem: "Agendamento inválido."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(cliente)) {
      return res.status(400).json({
        mensagem: "Cliente inválido."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(pet)) {
      return res.status(400).json({
        mensagem: "Pet inválido."
      });
    }


    // Procura o agendamento que será editado.
    const agendamentoExistente =
      await Agendamento.findById(id);


    if (!agendamentoExistente) {
      return res.status(404).json({
        mensagem:
          "Agendamento não encontrado."
      });
    }


    // Garante que o agendamento continue pertencendo ao mesmo cliente.
    if (
      agendamentoExistente.cliente.toString() !==
      cliente.toString()
    ) {
      return res.status(403).json({
        mensagem:
          "Você não pode editar este agendamento."
      });
    }


    // Confirma que o cliente existe.
    const clienteEncontrado =
      await Cliente.findById(cliente);

    if (!clienteEncontrado) {
      return res.status(404).json({
        mensagem:
          "O cliente informado não está cadastrado."
      });
    }


    // Confirma que o pet existe.
    const petEncontrado =
      await Pet.findById(pet);

    if (!petEncontrado) {
      return res.status(404).json({
        mensagem:
          "O pet informado não está cadastrado."
      });
    }


    // Garante que o pet pertence ao cliente selecionado.
    if (
      petEncontrado.dono.toString() !==
      cliente.toString()
    ) {
      return res.status(400).json({
        mensagem:
          "Este pet não pertence ao cliente selecionado."
      });
    }


    // Verifica se o novo horário já está ocupado.
    const horarioOcupado =
      await Agendamento.findOne({
        data,
        horario,
        _id: { $ne: id }
      });


    if (horarioOcupado) {
      return res.status(409).json({
        mensagem:
          "Este horário já está ocupado. Escolha outro horário."
      });
    }


    // Atualiza o agendamento no MongoDB.
    const agendamentoAtualizado =
      await Agendamento.findByIdAndUpdate(
        id,
        {
          cliente,
          pet,
          servico,
          data,
          horario,
          status: status || "Pendente"
        },
        {
          new: true,
          runValidators: true
        }
      );


    // Busca os dados completos depois da alteração.
    const agendamentoCompleto =
      await Agendamento.findById(
        agendamentoAtualizado._id
      )
        .populate("cliente", "nome")
        .populate("pet", "nome especie raca dono");


    res.status(200).json(
      agendamentoCompleto
    );

  } catch (error) {
    console.error(
      "Erro ao editar agendamento:",
      error
    );

    res.status(500).json({
      mensagem:
        "Erro ao editar agendamento."
    });
  }
}


// =====================================================
// REMOVER AGENDAMENTO
// Exclui o agendamento do MongoDB pelo ID.
// =====================================================
async function removerAgendamento(req, res) {
  try {
    const { id } = req.params;


    // Verifica se o ID é válido.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensagem:
          "Agendamento inválido."
      });
    }


    // Procura o agendamento e remove do banco.
    const agendamentoRemovido =
      await Agendamento.findByIdAndDelete(id);


    if (!agendamentoRemovido) {
      return res.status(404).json({
        mensagem:
          "Agendamento não encontrado."
      });
    }


    res.status(200).json({
      mensagem:
        "Agendamento removido com sucesso."
    });

  } catch (error) {
    console.error(
      "Erro ao remover agendamento:",
      error
    );

    res.status(500).json({
      mensagem:
        "Erro ao remover agendamento."
    });
  }
}


// Exporta as funções para serem utilizadas nas rotas do sistema.
module.exports = {
  listarAgendamentos,
  cadastrarAgendamento,
  editarAgendamento,
  removerAgendamento
};