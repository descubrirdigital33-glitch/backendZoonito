const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/eventoController");

// Rutas existentes (mantén las que ya tienes)
router.get("/", eventoController.obtenerEventos);
router.get("/:userId", eventoController.obtenerEventosPorUsuario);
router.post("/", eventoController.crearEvento);
router.put("/:id", eventoController.actualizarEvento);
router.delete("/:id", eventoController.eliminarEvento);

// ✅ NUEVAS RUTAS para toggle de lanzar y congelar
router.put("/lanzar/:id", eventoController.toggleLanzar);
router.put("/congelar/:id", eventoController.toggleCongelar);

module.exports = router;