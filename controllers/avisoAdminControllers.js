const AvisoAdmin = require("../models/AvisoAdmin");

// Crear nuevo aviso al administrador
exports.crearAviso = async (req, res) => {
  try {
    console.log("📨 Recibiendo petición de aviso al admin");
    console.log("Body recibido:", req.body);

    const {
      idMusico,
      nombreMusico,
      emailMusico,
      eventoId,
      banda,
      disco,
      fecha,
      hora,
      direccion,
      mensaje,
    } = req.body;

    // Validar campos requeridos
    if (!idMusico || !nombreMusico || !emailMusico || !eventoId || !banda || !fecha || !direccion || !mensaje) {
      console.error("❌ Faltan campos requeridos");
      return res.status(400).json({ 
        error: "Faltan campos requeridos",
        camposRecibidos: {
          idMusico: !!idMusico,
          nombreMusico: !!nombreMusico,
          emailMusico: !!emailMusico,
          eventoId: !!eventoId,
          banda: !!banda,
          fecha: !!fecha,
          direccion: !!direccion,
          mensaje: !!mensaje,
        }
      });
    }

    const nuevoAviso = new AvisoAdmin({
      idMusico,
      nombreMusico,
      emailMusico,
      eventoId,
      banda,
      disco: disco || "",
      fecha,
      hora: hora || "",
      direccion,
      mensaje,
    });

    await nuevoAviso.save();
    console.log("✅ Aviso guardado exitosamente:", nuevoAviso._id);

    res.status(201).json({
      mensaje: "Aviso enviado al administrador exitosamente",
      aviso: nuevoAviso,
    });
  } catch (error) {
    console.error("❌ Error al crear aviso:", error);
    res.status(500).json({ 
      error: "Error al enviar el aviso al administrador",
      detalles: error.message 
    });
  }
};

// Obtener todos los avisos
exports.obtenerAvisos = async (req, res) => {
  try {
    const avisos = await AvisoAdmin.find()
      .populate("idMusico", "name email")
      .populate("eventoId")
      .sort({ createdAt: -1 });

    res.status(200).json(avisos);
  } catch (error) {
    console.error("Error al obtener avisos:", error);
    res.status(500).json({ 
      error: "Error al obtener los avisos" 
    });
  }
};

// Obtener avisos por músico
exports.obtenerAvisosPorMusico = async (req, res) => {
  try {
    const { idMusico } = req.params;

    const avisos = await AvisoAdmin.find({ idMusico })
      .populate("eventoId")
      .sort({ createdAt: -1 });

    res.status(200).json(avisos);
  } catch (error) {
    console.error("Error al obtener avisos del músico:", error);
    res.status(500).json({ 
      error: "Error al obtener los avisos del músico" 
    });
  }
};

// Obtener un aviso específico
exports.obtenerAvisoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const aviso = await AvisoAdmin.findById(id)
      .populate("idMusico", "name email")
      .populate("eventoId");

    if (!aviso) {
      return res.status(404).json({ 
        error: "Aviso no encontrado" 
      });
    }

    res.status(200).json(aviso);
  } catch (error) {
    console.error("Error al obtener aviso:", error);
    res.status(500).json({ 
      error: "Error al obtener el aviso" 
    });
  }
};

// Actualizar estado del aviso (para el admin)
exports.actualizarEstadoAviso = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuestaAdmin } = req.body;

    const avisoActualizado = await AvisoAdmin.findByIdAndUpdate(
      id,
      { 
        estado, 
        respuestaAdmin: respuestaAdmin || "" 
      },
      { new: true }
    );

    if (!avisoActualizado) {
      return res.status(404).json({ 
        error: "Aviso no encontrado" 
      });
    }

    res.status(200).json({
      mensaje: "Aviso actualizado exitosamente",
      aviso: avisoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar aviso:", error);
    res.status(500).json({ 
      error: "Error al actualizar el aviso" 
    });
  }
};

// Eliminar un aviso
exports.eliminarAviso = async (req, res) => {
  try {
    const { id } = req.params;

    const avisoEliminado = await AvisoAdmin.findByIdAndDelete(id);

    if (!avisoEliminado) {
      return res.status(404).json({ 
        error: "Aviso no encontrado" 
      });
    }

    res.status(200).json({
      mensaje: "Aviso eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar aviso:", error);
    res.status(500).json({ 
      error: "Error al eliminar el aviso" 
    });
  }
};