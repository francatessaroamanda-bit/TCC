const mongoose = require("mongoose");

const agendamentoSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true
    },

    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true
    },

    servico: {
      type: String,
      required: true
    },

    data: {
      type: String,
      required: true
    },

    horario: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Pendente", "Confirmado", "Finalizado"],
      default: "Pendente"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Agendamento", agendamentoSchema);