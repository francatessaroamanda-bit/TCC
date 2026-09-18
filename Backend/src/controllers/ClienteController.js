const Cliente = require("../models/Cliente");

// LISTAR CLIENTES
async function listarClientes(req, res) {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });

    res.status(200).json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);

    res.status(500).json({
      mensagem: "Erro ao buscar clientes"
    });
  }
}


// CADASTRAR CLIENTE
async function cadastrarCliente(req, res) {
  try {
    const { nome, telefone, email } = req.body;

    if (!nome || !telefone || !email) {
      return res.status(400).json({
        mensagem: "Nome, telefone e email são obrigatórios"
      });
    }

    const novoCliente = await Cliente.create({
      nome,
      telefone,
      email
    });

    res.status(201).json(novoCliente);
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);

    res.status(500).json({
      mensagem: "Erro ao cadastrar cliente"
    });
  }
}


// EDITAR CLIENTE
async function editarCliente(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;

    if (!nome || !telefone || !email) {
      return res.status(400).json({
        mensagem: "Nome, telefone e email são obrigatórios"
      });
    }

    const clienteAtualizado = await Cliente.findByIdAndUpdate(
      id,
      {
        nome,
        telefone,
        email
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!clienteAtualizado) {
      return res.status(404).json({
        mensagem: "Cliente não encontrado"
      });
    }

    res.status(200).json(clienteAtualizado);
  } catch (error) {
    console.error("Erro ao editar cliente:", error);

    res.status(500).json({
      mensagem: "Erro ao editar cliente"
    });
  }
}


// REMOVER CLIENTE
async function removerCliente(req, res) {
  try {
    const { id } = req.params;

    const clienteRemovido = await Cliente.findByIdAndDelete(id);

    if (!clienteRemovido) {
      return res.status(404).json({
        mensagem: "Cliente não encontrado"
      });
    }

    res.status(200).json({
      mensagem: "Cliente removido com sucesso"
    });
  } catch (error) {
    console.error("Erro ao remover cliente:", error);

    res.status(500).json({
      mensagem: "Erro ao remover cliente"
    });
  }
}


module.exports = {
  listarClientes,
  cadastrarCliente,
  editarCliente,
  removerCliente
};