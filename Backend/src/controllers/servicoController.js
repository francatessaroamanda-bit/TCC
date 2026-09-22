const mongoose = require("mongoose");
const Servico = require("../models/Servico");


// =====================================================
// LISTAR SERVIÇOS
// Busca todos os serviços cadastrados no MongoDB.
// =====================================================
async function listarServicos(req, res) {
  try {
    const servicos = await Servico.find()
      .sort({ createdAt: -1 });

    res.status(200).json(servicos);

  } catch (error) {
    console.error("Erro ao listar serviços:", error);

    res.status(500).json({
      mensagem: "Erro ao buscar serviços"
    });
  }
}


// =====================================================
// CADASTRAR SERVIÇO
// Recebe os dados do frontend, valida e salva
// o novo serviço no MongoDB.
// =====================================================
async function cadastrarServico(req, res) {
  try {
    const {
      nome,
      descricao,
      preco
    } = req.body;


    // Verifica se todos os campos foram preenchidos.
    if (
      !nome ||
      !descricao ||
      preco === undefined ||
      preco === null ||
      preco === ""
    ) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos."
      });
    }


    // Converte o preço para número.
    // Exemplo: "50,00" vira 50.
    const precoConvertido =
      Number(String(preco).replace(",", "."));


    // Verifica se o preço realmente é um número.
    if (
      Number.isNaN(precoConvertido) ||
      precoConvertido < 0
    ) {
      return res.status(400).json({
        mensagem: "Informe um preço válido."
      });
    }


    // Cria o serviço no MongoDB.
    const novoServico =
      await Servico.create({
        nome,
        descricao,
        preco: precoConvertido
      });


    // Retorna o serviço criado.
    res.status(201).json(novoServico);

  } catch (error) {
    console.error(
      "Erro ao cadastrar serviço:",
      error
    );

    res.status(500).json({
      mensagem: "Erro ao cadastrar serviço"
    });
  }
}


// =====================================================
// EDITAR SERVIÇO
// Atualiza um serviço já existente.
// =====================================================
async function editarServico(req, res) {
  try {
    const { id } = req.params;

    const {
      nome,
      descricao,
      preco
    } = req.body;


    // Verifica se todos os campos foram preenchidos.
    if (
      !nome ||
      !descricao ||
      preco === undefined ||
      preco === null ||
      preco === ""
    ) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos."
      });
    }


    // Verifica se o ID possui formato válido.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensagem: "Serviço inválido."
      });
    }


    // Converte o preço para número.
    const precoConvertido =
      Number(String(preco).replace(",", "."));


    // Verifica se o preço é válido.
    if (
      Number.isNaN(precoConvertido) ||
      precoConvertido < 0
    ) {
      return res.status(400).json({
        mensagem: "Informe um preço válido."
      });
    }


    // Procura o serviço e atualiza seus dados.
    const servicoAtualizado =
      await Servico.findByIdAndUpdate(
        id,
        {
          nome,
          descricao,
          preco: precoConvertido
        },
        {
          new: true,
          runValidators: true
        }
      );


    // Caso o serviço não exista.
    if (!servicoAtualizado) {
      return res.status(404).json({
        mensagem: "Serviço não encontrado."
      });
    }


    // Retorna o serviço atualizado.
    res.status(200).json(
      servicoAtualizado
    );

  } catch (error) {
    console.error(
      "Erro ao editar serviço:",
      error
    );

    res.status(500).json({
      mensagem: "Erro ao editar serviço"
    });
  }
}


// =====================================================
// REMOVER SERVIÇO
// Exclui um serviço do MongoDB.
// =====================================================
async function removerServico(req, res) {
  try {
    const { id } = req.params;


    // Verifica se o ID é válido.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensagem: "Serviço inválido."
      });
    }


    // Procura o serviço e remove do banco.
    const servicoRemovido =
      await Servico.findByIdAndDelete(id);


    // Caso o serviço não seja encontrado.
    if (!servicoRemovido) {
      return res.status(404).json({
        mensagem: "Serviço não encontrado."
      });
    }


    // Confirma a remoção.
    res.status(200).json({
      mensagem:
        "Serviço removido com sucesso."
    });

  } catch (error) {
    console.error(
      "Erro ao remover serviço:",
      error
    );

    res.status(500).json({
      mensagem: "Erro ao remover serviço"
    });
  }
}


module.exports = {
  listarServicos,
  cadastrarServico,
  editarServico,
  removerServico
};