const dns = require("dns");

// Força o Node.js a usar os DNS do Google
// para resolver o endereço SRV do MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const conectarBanco = require("./config/database");

// Importa as rotas da API
const clienteRoutes = require("./routes/ClienteRoutes");
const petRoutes = require("./routes/petRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");
const servicoRoutes = require("./routes/servicoRoutes");

const app = express();

// Permite requisições do frontend
app.use(cors());

// Permite que o Express receba dados em JSON
app.use(express.json());

// Inicializa a conexão com o banco
conectarBanco();


// ===============================
// ROTAS DA API
// ===============================

app.use("/api/clientes", clienteRoutes);

app.use("/api/pets", petRoutes);

app.use("/api/agendamentos", agendamentoRoutes);

// Nova rota de serviços
app.use("/api/servicos", servicoRoutes);


// ===============================
// ROTA PRINCIPAL
// ===============================

app.get("/", (req, res) => {
  res.json({
    mensagem: "API Mundo Pet funcionando!"
  });
});


// ===============================
// INICIA O SERVIDOR
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});