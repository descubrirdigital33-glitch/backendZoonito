// models/Track.js
const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
  {
    radioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Radio",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
      maxlength: [200, "El título no puede exceder 200 caracteres"]
    },
    artist: {
      type: String,
      required: [true, "El artista es requerido"],
      trim: true,
      maxlength: [200, "El artista no puede exceder 200 caracteres"]
    },
    url: {
      type: String,
      required: true
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    duration: {
      type: Number,
      default: 0,
      min: 0
    },
    order: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índice compuesto para búsquedas eficientes
trackSchema.index({ radioId: 1, order: 1 });

// Virtual para obtener el stream URL completo
trackSchema.virtual('streamUrl').get(function() {
  return `/api/radio/stream-audio/${this.fileId}`;
});

// Método para formatear duración
trackSchema.methods.getFormattedDuration = function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Middleware pre-save para validaciones adicionales
trackSchema.pre('save', function(next) {
  // Asegurar que order no sea negativo
  if (this.order < 0) {
    this.order = 0;
  }
  next();
});

module.exports = mongoose.model("Track", trackSchema);