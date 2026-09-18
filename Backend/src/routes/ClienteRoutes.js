const express = require("express");

const {
  listarClientes,
  cadastrarCliente,
  editarCliente,
  removerCliente
} = require("../controllers/ClienteController");

const router = express.Router();


// GET - listar todos
router.get("/", listarClientes);


// POST - cadastrar
router.post("/", cadastrarCliente);


// PUT - editar
router.put("/:id", editarCliente);


// DELETE - remover
router.delete("/:id", removerCliente);


module.exports = router;