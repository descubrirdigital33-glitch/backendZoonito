// models/ChatMessage.js
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    radioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Radio",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    userAvatar: {
      type: String,
      default: null
    },
    text: {
      type: String,
      required: [true, "El mensaje no puede estar vacío"],
      trim: true,
      maxlength: [500, "El mensaje no puede exceder 500 caracteres"]
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto para búsquedas eficientes
chatMessageSchema.index({ radioId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

// Método para marcar como eliminado (soft delete)
chatMessageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Query helper para obtener solo mensajes no eliminados
chatMessageSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

// Virtual para tiempo relativo
chatMessageSchema.virtual('timeAgo').get(function() {
  const seconds = Math.floor((new Date() - this.createdAt) / 1000);
  
  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);