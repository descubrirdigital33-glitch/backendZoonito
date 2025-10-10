const mongoose = require("mongoose");

const listaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  nombre: { type: String, required: true },
  canciones: [
    {
      id: { type: String, required: true },
      titulo: { type: String, required: true },
      artista: { type: String, required: true },
      url: { type: String, required: true },
      cover: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Lista", listaSchema);
