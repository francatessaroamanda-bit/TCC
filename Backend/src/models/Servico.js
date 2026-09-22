const mongoose = require("mongoose");

// Modelo responsável por representar os serviços
// armazenados no MongoDB.
const servicoSchema = new mongoose.Schema(
  {
    // Nome do serviço
    nome: {
      type: String,
      required: true,
      trim: true
    },

    // Descrição do serviço
    descricao: {
      type: String,
      required: true,
      trim: true
    },

    // Preço do serviço
    preco: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    // Cria automaticamente createdAt e updatedAt
    timestamps: true
  }
);

module.exports = mongoose.model("Servico", servicoSchema);