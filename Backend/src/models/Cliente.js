const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },

    telefone: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Cliente", clienteSchema);