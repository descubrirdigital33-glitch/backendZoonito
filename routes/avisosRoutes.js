const express = require("express");
const router = express.Router();
const avisoAdminController = require("../controllers/avisoAdminControllers");


router.post("/", avisoAdminController.crearAviso);
router.get("/", avisoAdminController.obtenerAvisos);
router.get("/:idMusico", avisoAdminController.obtenerAvisosPorMusico);
router.get("/detalle/:id", avisoAdminController.obtenerAvisoPorId);

module.exports = router;
