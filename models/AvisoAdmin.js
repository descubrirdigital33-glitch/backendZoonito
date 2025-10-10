const mongoose = require("mongoose");

const avisoAdminSchema = new mongoose.Schema(
  {
    idMusico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nombreMusico: {
      type: String,
      required: true,
    },
    emailMusico: {
      type: String,
      required: true,
    },
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
    },
    banda: {
      type: String,
      required: true,
    },
    disco: {
      type: String,
      default: "",
    },
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      default: "",
    },
    direccion: {
      type: String,
      required: true,
    },
    mensaje: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en_proceso", "resuelto"],
      default: "pendiente",
    },
    respuestaAdmin: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AvisoAdmin", avisoAdminSchema);