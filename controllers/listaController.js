const Lista = require("../models/Lista");
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader); // 🔹 debug

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Usuario no autenticado (cabecera faltante)" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extraído:", token); // 🔹 debug

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Error verificando JWT:", err.message);
      return res.status(401).json({ message: "Token inválido o expirado aca no se por que me da esto" });
    }

    console.log("Decoded JWT:", decoded); // 🔹 debug

    if (!decoded.id) return res.status(401).json({ message: "Token inválido, no tiene id" });

    const user = await Usuario.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Error en authMiddleware:", err);
    res.status(401).json({ message: "Usuario no autenticado (error interno)" });
  }
};

// Crear o actualizar lista
const guardarLista = async (req, res) => {
  try {
    const { nombre, canciones } = req.body;
    const userId = req.user._id;

    if (!nombre || !canciones) return res.status(400).json({ message: "Datos incompletos" });

    let lista = await Lista.findOne({ userId, nombre });
    if (lista) {
      lista.canciones = canciones;
      await lista.save();
      return res.json({ message: "Lista actualizada correctamente", lista });
    }

    lista = new Lista({ userId, nombre, canciones });
    await lista.save();
    res.status(201).json({ message: "Lista guardada correctamente", lista });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al guardar la lista" });
  }
};

// Traer todas las listas de un usuario
const getListasUsuario = async (req, res) => {
  try {
    const listas = await Lista.find({ userId: req.user._id });
    res.json({ listas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener las listas" });
  }
};

// Traer lista individual
const getLista = async (req, res) => {
  try {
    const { id } = req.params;
    const lista = await Lista.findOne({ _id: id, userId: req.user._id });
    if (!lista) return res.status(404).json({ message: "Lista no encontrada" });
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener la lista" });
  }
};

// Eliminar lista
const eliminarLista = async (req, res) => {
  try {
    const { id } = req.params;
    const lista = await Lista.findOne({ _id: id, userId: req.user._id });
    if (!lista) return res.status(404).json({ message: "Lista no encontrada" });
    await lista.deleteOne();
    res.json({ message: "Lista eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar la lista" });
  }
};

// Actualizar nombre de lista existente
const actualizarLista = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, canciones } = req.body;
    
    const lista = await Lista.findOne({ _id: id, userId: req.user._id });
    if (!lista) return res.status(404).json({ message: "Lista no encontrada" });

    if (nombre) lista.nombre = nombre;
    if (canciones) lista.canciones = canciones;
    
    await lista.save();
    res.json({ message: "Lista actualizada correctamente", lista });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar la lista" });
  }
};

module.exports = {
  authMiddleware,
  guardarLista,
  getListasUsuario,
  getLista,
  actualizarLista, // ⚡ EXPORTAR
  eliminarLista
};