const mongoose = require("mongoose");

const eventoSchema = new mongoose.Schema(
  {
    idMusico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    imagenUrl: {
      type: String,
      required: true,
    },
    promocionado: {
      type: Boolean,
      default: false,
    },
    codigoPromocional: {
      type: String,
      default: "",
    },
    diseño: {
      type: String,
      enum: ["claro", "oscuro"],
      default: "claro",
    },
    congelar: {
      type: Boolean,
      default: false,
    },
    lanzar: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evento", eventoSchema);