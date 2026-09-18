const express = require("express");

const router = express.Router();

const {
  listarAgendamentos,
  cadastrarAgendamento,
  editarAgendamento,
  removerAgendamento
} = require("../controllers/agendamentoController");

// GET
router.get("/", listarAgendamentos);

// POST
router.post("/", cadastrarAgendamento);

// PUT
router.put("/:id", editarAgendamento);

// DELETE
router.delete("/:id", removerAgendamento);

module.exports = router;