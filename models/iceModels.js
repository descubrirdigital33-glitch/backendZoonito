// models/iceModel.js
const mongoose = require('mongoose');

const iceStreamSchema = new mongoose.Schema({
  // Radio asociada
  radioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Radio',
    required: true,
    index: true,
  },

  // Punto de montaje en Icecast
  mountPoint: {
    type: String,
    required: true,
  },

  // Estado de la transmisión
  isActive: {
    type: Boolean,
    default: false,
    index: true,
  },

  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now,
  },

  stoppedAt: {
    type: Date,
  },

  // Estadísticas
  listeners: {
    type: Number,
    default: 0,
  },

  peakListeners: {
    type: Number,
    default: 0,
  },

  totalStreamTime: {
    type: Number, // en segundos
    default: 0,
  },

  // Configuración de Icecast
  icecastConfig: {
    host: String,
    port: Number,
    password: String,
    bitrate: {
      type: Number,
      default: 128,
    },
  },

  // Track actual siendo reproducido
  currentTrack: {
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
    },
    title: String,
    artist: String,
    startedAt: Date,
  },

  // Historial de tracks reproducidos en esta sesión
  playHistory: [{
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
    },
    title: String,
    artist: String,
    playedAt: Date,
    duration: Number, // segundos
  }],

  // Errores y logs
  errors: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  }],

  // Metadata adicional
  metadata: {
    genre: String,
    description: String,
    url: String,
    name: String,
  },
}, {
  timestamps: true,
});

// Índices compuestos
iceStreamSchema.index({ radioId: 1, isActive: 1 });
iceStreamSchema.index({ startedAt: -1 });

// Método para agregar error
iceStreamSchema.methods.addError = function(message, severity = 'medium') {
  this.errors.push({
    message,
    severity,
    timestamp: new Date(),
  });
  
  // Mantener solo los últimos 50 errores
  if (this.errors.length > 50) {
    this.errors = this.errors.slice(-50);
  }
  
  return this.save();
};

// Método para actualizar track actual
iceStreamSchema.methods.updateCurrentTrack = function(trackData) {
  this.currentTrack = {
    trackId: trackData._id,
    title: trackData.title,
    artist: trackData.artist,
    startedAt: new Date(),
  };
  
  // Agregar al historial
  if (this.currentTrack.trackId) {
    this.playHistory.push({
      trackId: trackData._id,
      title: trackData.title,
      artist: trackData.artist,
      playedAt: new Date(),
      duration: trackData.duration || 0,
    });
    
    // Mantener solo los últimos 100 tracks del historial
    if (this.playHistory.length > 100) {
      this.playHistory = this.playHistory.slice(-100);
    }
  }
  
  return this.save();
};

// Método para actualizar listeners
iceStreamSchema.methods.updateListeners = function(count) {
  this.listeners = count;
  
  if (count > this.peakListeners) {
    this.peakListeners = count;
  }
  
  return this.save();
};

// Método para calcular tiempo total de stream
iceStreamSchema.methods.calculateStreamTime = function() {
  if (this.isActive && this.startedAt) {
    const now = new Date();
    const diffMs = now - this.startedAt;
    this.totalStreamTime = Math.floor(diffMs / 1000);
  } else if (this.stoppedAt && this.startedAt) {
    const diffMs = this.stoppedAt - this.startedAt;
    this.totalStreamTime = Math.floor(diffMs / 1000);
  }
  
  return this.totalStreamTime;
};

// Middleware pre-save
iceStreamSchema.pre('save', function(next) {
  // Calcular tiempo de stream antes de guardar
  if (this.isModified('stoppedAt') || this.isModified('startedAt')) {
    this.calculateStreamTime();
  }
  next();
});

// Método estático para obtener streams activos
iceStreamSchema.statics.getActiveStreams = function() {
  return this.find({ isActive: true })
    .populate('radioId', 'name logo streamUrl')
    .sort({ startedAt: -1 });
};

// Método estático para obtener historial de una radio
iceStreamSchema.statics.getRadioHistory = function(radioId, limit = 10) {
  return this.find({ radioId })
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean();
};

// Método estático para cleanup de streams antiguos inactivos
iceStreamSchema.statics.cleanupOldStreams = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await this.deleteMany({
    isActive: false,
    stoppedAt: { $lt: cutoffDate },
  });
  
  console.log(`🧹 Limpieza: ${result.deletedCount} streams antiguos eliminados`);
  return result;
};

const IceStream = mongoose.model('IceStream', iceStreamSchema);

module.exports = IceStream;