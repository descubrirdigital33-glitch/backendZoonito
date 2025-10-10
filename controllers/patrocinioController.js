const Evento = require("../models/Evento");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const mongoose = require("mongoose");
// Configuración Multer para memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuración Cloudinary (asegurate de tener las variables de entorno)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------- CREAR EVENTO --------------------
exports.crearEvento = async (req, res) => {
  try {
    const {
      banda,
      disco,
      fecha,
      direccion,
      imagenUrl,
      promocionado,
      codigoPromocional,
      diseño,
      lanzar,
    } = req.body;

    const userId = req.params.userId; // <--- viene del frontend
    let finalImagenUrl = imagenUrl;

    // Subir archivo a Cloudinary si existe
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "eventos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      finalImagenUrl = result.secure_url;
    }

    // Validar código promocional
    const esPromocionado =
      promocionado === "true" && codigoPromocional === "CODIGO123";

    // Crear evento (idMusico como string)
    const nuevoEvento = new Evento({
      idMusico: userId,
      creadoPor: banda,
      banda,
      disco,
      fecha,
      direccion,
      imagenUrl: finalImagenUrl,
      promocionado: esPromocionado,
      lanzar: lanzar === "true" || false,
      codigoPromocional: esPromocionado ? codigoPromocional : undefined,
      diseño: diseño || "claro",
    });

    await nuevoEvento.save();
    res.status(201).json(nuevoEvento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el evento" });
  }
};

// -------------------- OBTENER EVENTOS POR USUARIO --------------------
exports.getEventosByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Solo convertir si es un string de 24 caracteres hex
    const objectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (!objectId)
      return res.status(400).json({ message: "ID de usuario inválido" });

    const eventos = await Evento.find({ idMusico: objectId }).sort({
      fecha: 1,
    });
    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los eventos" });
  }
};

// -------------------- ACTUALIZAR EVENTO --------------------
exports.actualizarEvento = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const banda = req.body?.banda || "";
    const disco = req.body?.disco || "";
    const fecha = req.body?.fecha || "";
    const direccion = req.body?.direccion || "";
    const diseño = req.body?.diseño || "claro";
    const promocionado = req.body?.promocionado === "true";
    const codigoPromocional = req.body?.codigoPromocional || "";
    const imagenUrl = req.body?.imagenUrl || "";

    const eventoExistente = await Evento.findById(eventId);
    if (!eventoExistente)
      return res.status(404).json({ message: "Evento no encontrado" });

    let finalImagenUrl = eventoExistente.imagenUrl;

    // Subir nueva imagen si se envía
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "eventos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      finalImagenUrl = result.secure_url;
    } else if (imagenUrl) {
      finalImagenUrl = imagenUrl;
    }

    const esPromocionado = promocionado && codigoPromocional === "CODIGO123";

    const eventoActualizado = await Evento.findByIdAndUpdate(
      eventId,
      {
        banda,
        disco,
        fecha,
        direccion,
        diseño,
        promocionado: esPromocionado,
        codigoPromocional: esPromocionado ? codigoPromocional : undefined,
        imagenUrl: finalImagenUrl,
      },
      { new: true }
    );

    res.json(eventoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el evento" });
  }
};

// -------------------- ELIMINAR EVENTO --------------------
exports.eliminarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.eventId);
    if (!evento)
      return res.status(404).json({ message: "Evento no encontrado" });
    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el evento" });
  }
};
// controllers/promocionController.js

// Obtener eventos según rol
exports.getEventosByUserOrAll = async (req, res) => {
  try {
    const { userId, role } = req.query; // enviamos role desde frontend (temporal)
    
    let eventos;
    if (role === "admin") {
      // Admin: trae todos los eventos
      eventos = await Evento.find().sort({ fecha: 1 });
    } else {
      // Usuario normal: trae solo los suyos
      if (!userId) return res.status(400).json({ message: "ID de usuario requerido" });

      const objectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null;

      if (!objectId) return res.status(400).json({ message: "ID de usuario inválido" });

      eventos = await Evento.find({ idMusico: objectId }).sort({ fecha: 1 });
    }

    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los eventos" });
  }
};


module.exports.upload = upload.single("imagen"); // middleware para rutas que suben imagen
