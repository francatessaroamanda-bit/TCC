const express = require("express");

const {
  listarServicos,
  cadastrarServico,
  editarServico,
  removerServico
} = require("../controllers/servicoController");

const router = express.Router();


// GET - listar serviços
router.get("/", listarServicos);


// POST - cadastrar serviço
router.post("/", cadastrarServico);


// PUT - editar serviço
router.put("/:id", editarServico);


// DELETE - remover serviço
router.delete("/:id", removerServico);


module.exports = router;