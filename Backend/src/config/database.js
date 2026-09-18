const mongoose = require("mongoose");

const conectarBanco = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado com sucesso!");
  } catch (erro) {
    console.error("Erro ao conectar MongoDB:", erro.message);
    // Encerra o processo caso não consiga conectar
    process.exit(1);
  }
};

module.exports = conectarBanco;