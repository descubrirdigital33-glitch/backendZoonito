// const express = require("express");
// const router = express.Router();
// const eventoController = require("../controllers/eventoController");

// // Rutas base
// router.get("/", eventoController.obtenerEventos);
// router.get("/:userId", eventoController.obtenerEventosPorUsuario);

// // ✅ Crear evento (con userId en la ruta)
// router.post("/:userId", eventoController.crearEvento);

// // ✅ Actualizar evento (con userId en la ruta)
// router.put("/:userId/:id", eventoController.actualizarEvento);

// // ✅ Eliminar evento (con userId en la ruta)
// router.delete("/:userId/:id", eventoController.eliminarEvento);

// // ✅ Toggle lanzar (solo necesita ID del evento)
// router.put("/lanzar/:id", eventoController.toggleLanzar);

// // ✅ Toggle congelar (solo necesita ID del evento)
// router.put("/congelar/:id", eventoController.toggleCongelar);

// module.exports = router;

const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/eventoController")

router.get("/", eventoController.getAllEventos);;
 
router.get("/musico/:idMusico", eventoController.getEventosByMusico);
// Rutas base
router.get("/", eventoController.obtenerEventos);

router.get("/:userId", eventoController.obtenerEventosPorUsuario);

// ✅ Crear evento (con userId en la ruta)
router.post("/:userId", eventoController.crearEvento);

// ✅ Actualizar evento (con userId en la ruta)
router.put("/:userId/:id", eventoController.actualizarEvento);

// ✅ Eliminar evento (con userId en la ruta)
router.delete("/:userId/:id", eventoController.eliminarEvento);

// ✅ Toggle lanzar (solo necesita ID del evento)
router.put("/lanzar/:id", eventoController.toggleLanzar);

// ✅ Toggle congelar (solo necesita ID del evento)
router.put("/congelar/:id", eventoController.toggleCongelar);

module.exports = router;
