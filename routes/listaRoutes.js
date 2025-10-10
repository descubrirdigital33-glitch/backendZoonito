const express = require("express");
const router = express.Router();
const listaController = require("../controllers/listaController");

router.use(listaController.authMiddleware);

router.post("/", listaController.guardarLista);
router.get("/", listaController.getListasUsuario);
router.get("/:id", listaController.getLista);
router.put("/:id", listaController.actualizarLista); // ⚡ NUEVA RUTA
router.delete("/:id", listaController.eliminarLista);

module.exports = router;