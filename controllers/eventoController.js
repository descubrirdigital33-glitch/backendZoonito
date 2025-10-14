// const Evento = require("../models/Evento");

// // ✅ Obtener todos los eventos o filtrados por rol
// exports.obtenerEventos = async (req, res) => {
//     try {
//         const { role } = req.query;
        
//         let eventos;
//         if (role === "admin") {
//             eventos = await Evento.find();
//         } else {
//             eventos = await Evento.find({ promocionado: true });
//         }
        
//         res.json(eventos);
//     } catch (error) {
//         res.status(500).json({ error: "Error al obtener eventos" });
//     }
// };

// // ✅ Obtener eventos por usuario
// exports.obtenerEventosPorUsuario = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const eventos = await Evento.find({ idMusico: userId });
//         res.json(eventos);
//     } catch (error) {
//         res.status(500).json({ error: "Error al obtener eventos del usuario" });
//     }
// };

// // ✅ Crear evento
// exports.crearEvento = async (req, res) => {
//     try {
//         const nuevoEvento = new Evento(req.body);
//         await nuevoEvento.save();
//         res.status(201).json(nuevoEvento);
//     } catch (error) {
//         res.status(400).json({ error: "Error al crear evento" });
//     }
// };

// // ✅ Actualizar evento
// exports.actualizarEvento = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const eventoActualizado = await Evento.findByIdAndUpdate(
//             id,
//             req.body,
//             { new: true }
//         );
        
//         if (!eventoActualizado) {
//             return res.status(404).json({ error: "Evento no encontrado" });
//         }
        
//         res.json(eventoActualizado);
//     } catch (error) {
//         res.status(400).json({ error: "Error al actualizar evento" });
//     }
// };

// // ✅ Eliminar evento
// exports.eliminarEvento = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const eventoEliminado = await Evento.findByIdAndDelete(id);
        
//         if (!eventoEliminado) {
//             return res.status(404).json({ error: "Evento no encontrado" });
//         }
        
//         res.json({ mensaje: "Evento eliminado correctamente" });
//     } catch (error) {
//         res.status(500).json({ error: "Error al eliminar evento" });
//     }
// };

// // ✅ NUEVA FUNCIÓN: Toggle estado "lanzar"
// exports.toggleLanzar = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         // Buscar el evento
//         const evento = await Evento.findById(id);
        
//         if (!evento) {
//             return res.status(404).json({ error: "Evento no encontrado" });
//         }
        
//         // Toggle: si está en true, pasa a false; si está en false (o undefined), pasa a true
//         evento.lanzar = !evento.lanzar;
        
//         await evento.save();
        
//         res.json({
//             mensaje: `Evento ${evento.lanzar ? "lanzado" : "deslanzado"} correctamente`,
//             evento
//         });
//     } catch (error) {
//         console.error("Error en toggleLanzar:", error);
//         res.status(500).json({ error: "Error al cambiar estado de lanzar" });
//     }
// };

// // ✅ NUEVA FUNCIÓN: Toggle estado "congelar"
// exports.toggleCongelar = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         // Buscar el evento
//         const evento = await Evento.findById(id);
        
//         if (!evento) {
//             return res.status(404).json({ error: "Evento no encontrado" });
//         }
        
//         // Toggle: si está en true, pasa a false; si está en false (o undefined), pasa a true
//         evento.congelar = !evento.congelar;
        
//         await evento.save();
        
//         res.json({
//             mensaje: `Evento ${evento.congelar ? "congelado" : "descongelado"} correctamente`,
//             evento
//         });
//     } catch (error) {
//         console.error("Error en toggleCongelar:", error);
//         res.status(500).json({ error: "Error al cambiar estado de congelar" });
//     }

// };




const Evento = require("../models/Evento");

// ✅ Código promocional válido (debe coincidir con el frontend)
const CODIGO_VALIDO = "PROMO2025";

// ✅ Obtener todos los eventos o filtrados por rol
exports.obtenerEventos = async (req, res) => {
    try {
        const { role } = req.query;
        
        let eventos;
        if (role === "admin") {
            eventos = await Evento.find();
        } else {
            eventos = await Evento.find({ promocionado: true });
        }
        
        res.json(eventos);
    } catch (error) {
        console.error("Error al obtener eventos:", error);
        res.status(500).json({ error: "Error al obtener eventos" });
    }
};

// ✅ Obtener eventos por usuario
exports.obtenerEventosPorUsuario = async (req, res) => {
    try {
        const { userId } = req.params;
        const eventos = await Evento.find({ idMusico: userId });
        res.json(eventos);
    } catch (error) {
        console.error("Error al obtener eventos del usuario:", error);
        res.status(500).json({ error: "Error al obtener eventos del usuario" });
    }
};

// ✅ Crear evento con validación de código promocional
exports.crearEvento = async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            banda, 
            disco, 
            fecha, 
            hora, 
            direccion, 
            imagenUrl, 
            promocionado, 
            codigoPromocional, 
            diseño 
        } = req.body;

        console.log("📝 Creando evento con datos:", req.body);

        // ✅ Validar campos obligatorios
        if (!banda || !fecha || !direccion || !imagenUrl) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios: banda, fecha, direccion, imagenUrl" 
            });
        }

        // ✅ Validar código promocional si se marcó como promocionado
        let esPromocionado = false;
        if (promocionado) {
            if (codigoPromocional === CODIGO_VALIDO) {
                esPromocionado = true;
                console.log("✅ Código promocional válido");
            } else {
                console.log("❌ Código promocional inválido:", codigoPromocional);
                return res.status(400).json({ 
                    error: "Código promocional inválido. No se puede promocionar el evento." 
                });
            }
        }

        // ✅ Crear el evento
        const nuevoEvento = new Evento({
            idMusico: userId,
            banda,
            disco: disco || "",
            fecha,
            hora: hora || "",
            direccion,
            imagenUrl,
            promocionado: esPromocionado,
            codigoPromocional: esPromocionado ? codigoPromocional : "",
            diseño: diseño || "claro",
            congelar: false,
            lanzar: false
        });

        await nuevoEvento.save();
        
        console.log("✅ Evento creado exitosamente:", nuevoEvento._id);
        res.status(201).json(nuevoEvento);
    } catch (error) {
        console.error("❌ Error al crear evento:", error);
        res.status(400).json({ 
            error: "Error al crear evento",
            detalle: error.message 
        });
    }
};

// ✅ Actualizar evento con validación de código promocional
exports.actualizarEvento = async (req, res) => {
    try {
        const { userId, id } = req.params;
        const { 
            banda, 
            disco, 
            fecha, 
            hora, 
            direccion, 
            imagenUrl, 
            promocionado, 
            codigoPromocional, 
            diseño 
        } = req.body;

        console.log("📝 Actualizando evento:", id);

        // ✅ Buscar el evento y verificar que pertenezca al usuario
        const eventoExistente = await Evento.findById(id);
        
        if (!eventoExistente) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        if (eventoExistente.idMusico.toString() !== userId) {
            return res.status(403).json({ error: "No tienes permiso para editar este evento" });
        }

        // ✅ Validar código promocional si se marca como promocionado
        let esPromocionado = eventoExistente.promocionado; // Mantener estado actual
        
        if (promocionado) {
            if (codigoPromocional === CODIGO_VALIDO) {
                esPromocionado = true;
                console.log("✅ Código promocional válido");
            } else {
                console.log("❌ Código promocional inválido:", codigoPromocional);
                return res.status(400).json({ 
                    error: "Código promocional inválido. No se puede promocionar el evento." 
                });
            }
        } else {
            esPromocionado = false; // Si desmarca promocionado, remover promoción
        }

        // ✅ Actualizar el evento
        eventoExistente.banda = banda || eventoExistente.banda;
        eventoExistente.disco = disco || "";
        eventoExistente.fecha = fecha || eventoExistente.fecha;
        eventoExistente.hora = hora || "";
        eventoExistente.direccion = direccion || eventoExistente.direccion;
        eventoExistente.imagenUrl = imagenUrl || eventoExistente.imagenUrl;
        eventoExistente.promocionado = esPromocionado;
        eventoExistente.codigoPromocional = esPromocionado ? codigoPromocional : "";
        eventoExistente.diseño = diseño || eventoExistente.diseño;

        await eventoExistente.save();
        
        console.log("✅ Evento actualizado exitosamente");
        res.json(eventoExistente);
    } catch (error) {
        console.error("❌ Error al actualizar evento:", error);
        res.status(400).json({ 
            error: "Error al actualizar evento",
            detalle: error.message 
        });
    }
};

// ✅ Eliminar evento
exports.eliminarEvento = async (req, res) => {
    try {
        const { userId, id } = req.params;
        
        // ✅ Verificar que el evento pertenezca al usuario
        const evento = await Evento.findById(id);
        
        if (!evento) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        if (evento.idMusico.toString() !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este evento" });
        }
        
        await Evento.findByIdAndDelete(id);
        
        console.log("✅ Evento eliminado correctamente");
        res.json({ mensaje: "Evento eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar evento:", error);
        res.status(500).json({ error: "Error al eliminar evento" });
    }
};

// ✅ Toggle estado "lanzar"
exports.toggleLanzar = async (req, res) => {
    try {
        const { id } = req.params;
        
        const evento = await Evento.findById(id);
        
        if (!evento) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        evento.lanzar = !evento.lanzar;
        await evento.save();
        
        console.log(`✅ Evento ${evento.lanzar ? "lanzado" : "deslanzado"}`);
        res.json({
            mensaje: `Evento ${evento.lanzar ? "lanzado" : "deslanzado"} correctamente`,
            evento
        });
    } catch (error) {
        console.error("❌ Error en toggleLanzar:", error);
        res.status(500).json({ error: "Error al cambiar estado de lanzar" });
    }
};

// ✅ Toggle estado "congelar"
exports.toggleCongelar = async (req, res) => {
    try {
        const { id } = req.params;
        
        const evento = await Evento.findById(id);
        
        if (!evento) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        evento.congelar = !evento.congelar;
        await evento.save();
        
        console.log(`✅ Evento ${evento.congelar ? "congelado" : "descongelado"}`);
        res.json({
            mensaje: `Evento ${evento.congelar ? "congelado" : "descongelado"} correctamente`,
            evento
        });
    } catch (error) {
        console.error("❌ Error en toggleCongelar:", error);
        res.status(500).json({ error: "Error al cambiar estado de congelar" });
    }
};
