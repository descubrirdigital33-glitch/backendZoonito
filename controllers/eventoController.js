const Evento = require("../models/Evento");

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
        res.status(500).json({ error: "Error al obtener eventos del usuario" });
    }
};

// ✅ Crear evento
exports.crearEvento = async (req, res) => {
    try {
        const nuevoEvento = new Evento(req.body);
        await nuevoEvento.save();
        res.status(201).json(nuevoEvento);
    } catch (error) {
        res.status(400).json({ error: "Error al crear evento" });
    }
};

// ✅ Actualizar evento
exports.actualizarEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const eventoActualizado = await Evento.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
        
        if (!eventoActualizado) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        res.json(eventoActualizado);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar evento" });
    }
};

// ✅ Eliminar evento
exports.eliminarEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const eventoEliminado = await Evento.findByIdAndDelete(id);
        
        if (!eventoEliminado) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        res.json({ mensaje: "Evento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar evento" });
    }
};

// ✅ NUEVA FUNCIÓN: Toggle estado "lanzar"
exports.toggleLanzar = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar el evento
        const evento = await Evento.findById(id);
        
        if (!evento) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        // Toggle: si está en true, pasa a false; si está en false (o undefined), pasa a true
        evento.lanzar = !evento.lanzar;
        
        await evento.save();
        
        res.json({
            mensaje: `Evento ${evento.lanzar ? "lanzado" : "deslanzado"} correctamente`,
            evento
        });
    } catch (error) {
        console.error("Error en toggleLanzar:", error);
        res.status(500).json({ error: "Error al cambiar estado de lanzar" });
    }
};

// ✅ NUEVA FUNCIÓN: Toggle estado "congelar"
exports.toggleCongelar = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar el evento
        const evento = await Evento.findById(id);
        
        if (!evento) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        // Toggle: si está en true, pasa a false; si está en false (o undefined), pasa a true
        evento.congelar = !evento.congelar;
        
        await evento.save();
        
        res.json({
            mensaje: `Evento ${evento.congelar ? "congelado" : "descongelado"} correctamente`,
            evento
        });
    } catch (error) {
        console.error("Error en toggleCongelar:", error);
        res.status(500).json({ error: "Error al cambiar estado de congelar" });
    }
};