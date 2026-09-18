const mongoose = require("mongoose");

const Agendamento = require("../models/Agendamento");
const Cliente = require("../models/Cliente");
const Pet = require("../models/Pet");


// =====================================
// LISTAR AGENDAMENTOS
// =====================================

async function listarAgendamentos(req, res) {
  try {
    const agendamentos = await Agendamento.find()
      .populate("cliente", "nome")
      .populate("pet", "nome especie raca dono")
      .sort({ data: 1, horario: 1 });

    res.json(agendamentos);

  } catch (error) {

    console.error("Erro ao listar agendamentos:", error);

    res.status(500).json({
      mensagem: "Erro ao buscar agendamentos"
    });
  }
}


// =====================================
// CADASTRAR AGENDAMENTO
// =====================================

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


    // =====================================
    // VERIFICAR CAMPOS
    // =====================================

    if (!cliente || !pet || !servico || !data || !horario) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos."
      });
    }


    // =====================================
    // VERIFICAR IDs
    // =====================================

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


    // =====================================
    // VERIFICAR SE O CLIENTE EXISTE
    // =====================================

    const clienteEncontrado = await Cliente.findById(cliente);

    if (!clienteEncontrado) {
      return res.status(404).json({
        mensagem: "O cliente informado não está cadastrado."
      });
    }


    // =====================================
    // VERIFICAR SE O PET EXISTE
    // =====================================

    const petEncontrado = await Pet.findById(pet);

    if (!petEncontrado) {
      return res.status(404).json({
        mensagem: "O pet informado não está cadastrado."
      });
    }


    // =====================================
    // VERIFICAR SE O PET PERTENCE AO CLIENTE
    // =====================================

    if (petEncontrado.dono.toString() !== cliente) {
      return res.status(400).json({
        mensagem: "Este pet não pertence ao cliente selecionado."
      });
    }


    // =====================================
    // VERIFICAR HORÁRIO OCUPADO
    // =====================================

    const horarioOcupado = await Agendamento.findOne({
      data: data,
      horario: horario
    });


    if (horarioOcupado) {
      return res.status(409).json({
        mensagem: "Este horário já está ocupado. Escolha outro horário."
      });
    }


    // =====================================
    // CRIAR AGENDAMENTO
    // =====================================

    const novoAgendamento = await Agendamento.create({
      cliente,
      pet,
      servico,
      data,
      horario,
      status: status || "Pendente"
    });


    // =====================================
    // RETORNAR AGENDAMENTO COMPLETO
    // =====================================

    const agendamentoCompleto =
      await Agendamento.findById(novoAgendamento._id)
        .populate("cliente", "nome")
        .populate("pet", "nome especie raca dono");


    res.status(201).json(agendamentoCompleto);

  } catch (error) {

    console.error("Erro ao cadastrar agendamento:", error);

    res.status(500).json({
      mensagem: "Erro ao cadastrar agendamento."
    });
  }
}


// =====================================
// EDITAR AGENDAMENTO
// =====================================

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


    // =====================================
    // VERIFICAR CAMPOS
    // =====================================

    if (!cliente || !pet || !servico || !data || !horario) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos."
      });
    }


    // =====================================
    // VERIFICAR IDs
    // =====================================

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


    // =====================================
    // VERIFICAR SE O CLIENTE EXISTE
    // =====================================

    const clienteEncontrado = await Cliente.findById(cliente);

    if (!clienteEncontrado) {
      return res.status(404).json({
        mensagem: "O cliente informado não está cadastrado."
      });
    }


    // =====================================
    // VERIFICAR SE O PET EXISTE
    // =====================================

    const petEncontrado = await Pet.findById(pet);

    if (!petEncontrado) {
      return res.status(404).json({
        mensagem: "O pet informado não está cadastrado."
      });
    }


    // =====================================
    // VERIFICAR SE O PET PERTENCE AO CLIENTE
    // =====================================

    if (petEncontrado.dono.toString() !== cliente) {
      return res.status(400).json({
        mensagem: "Este pet não pertence ao cliente selecionado."
      });
    }


    // =====================================
    // VERIFICAR HORÁRIO OCUPADO
    // =====================================

    const horarioOcupado = await Agendamento.findOne({
      data: data,
      horario: horario,
      _id: { $ne: id }
    });


    if (horarioOcupado) {
      return res.status(409).json({
        mensagem: "Este horário já está ocupado. Escolha outro horário."
      });
    }


    // =====================================
    // ATUALIZAR AGENDAMENTO
    // =====================================

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


    if (!agendamentoAtualizado) {
      return res.status(404).json({
        mensagem: "Agendamento não encontrado."
      });
    }


    // =====================================
    // RETORNAR AGENDAMENTO COMPLETO
    // =====================================

    const agendamentoCompleto =
      await Agendamento.findById(agendamentoAtualizado._id)
        .populate("cliente", "nome")
        .populate("pet", "nome especie raca dono");


    res.json(agendamentoCompleto);

  } catch (error) {

    console.error("Erro ao editar agendamento:", error);

    res.status(500).json({
      mensagem: "Erro ao editar agendamento."
    });
  }
}


// =====================================
// REMOVER AGENDAMENTO
// =====================================

async function removerAgendamento(req, res) {

  try {

    const { id } = req.params;

    const agendamentoRemovido =
      await Agendamento.findByIdAndDelete(id);


    if (!agendamentoRemovido) {
      return res.status(404).json({
        mensagem: "Agendamento não encontrado."
      });
    }


    res.json({
      mensagem: "Agendamento removido com sucesso."
    });

  } catch (error) {

    console.error("Erro ao remover agendamento:", error);

    res.status(500).json({
      mensagem: "Erro ao remover agendamento."
    });
  }
}


module.exports = {
  listarAgendamentos,
  cadastrarAgendamento,
  editarAgendamento,
  removerAgendamento
};