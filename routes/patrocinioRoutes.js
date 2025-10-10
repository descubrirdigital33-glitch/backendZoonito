const express = require("express");
const router = express.Router();
const { crearEvento, getEventosByUser, actualizarEvento, eliminarEvento,getEventosByUserOrAll} = require("../controllers/patrocinioController");
const multer = require("multer");

// Multer en memoria
const upload = multer({ storage: multer.memoryStorage() });

// CRUD
router.post("/:userId", upload.single("imagen"), crearEvento); // Crear con archivo
router.get("/:userId", getEventosByUser); 

// Obtener todos los eventos (sin filtrar por usuario)
router.get("/", getEventosByUserOrAll);

router.put("/:userId/:eventId", upload.single("imagen"), actualizarEvento); // Editar con archivo
router.delete("/:userId/:eventId", eliminarEvento);            // Eliminar

module.exports = router;
