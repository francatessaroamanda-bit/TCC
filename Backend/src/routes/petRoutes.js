const express = require("express");

const {
  listarPets,
  cadastrarPet,
  editarPet,
  removerPet
} = require("../controllers/petController");

const router = express.Router();


// GET - listar pets
router.get("/", listarPets);


// POST - cadastrar pet
router.post("/", cadastrarPet);


// PUT - editar pet
router.put("/:id", editarPet);


// DELETE - remover pet
router.delete("/:id", removerPet);


module.exports = router;