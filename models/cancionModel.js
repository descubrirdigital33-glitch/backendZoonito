// models/cancionModel.js
const mongoose = require('mongoose');

// Schema para cada línea de letra
const lineaLetraSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true,
    trim: true
  },
  tiempoInicio: {
    type: Number,
    required: true,
    min: 0
  },
  tiempoFin: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Schema principal de Canción
const cancionSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  artista: {
    type: String,
    required: [true, 'El artista es requerido'],
    trim: true,
    maxlength: [200, 'El artista no puede exceder 200 caracteres']
  },
  audioUrl: {
    type: String,
    required: [true, 'La URL del audio es requerida']
  },
  audioGridFsId: {
    type: String,
    default: null
  },
  cover: {
    type: String,
    default: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  letra: {
    type: [lineaLetraSchema],
    default: []
  },
  duracion: {
    type: Number,
    default: 0,
    min: 0
  },
  genero: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  año: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  reproducciones: {
    type: Number,
    default: 0,
    min: 0
  },
  favorita: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas más rápidas
cancionSchema.index({ titulo: 'text', artista: 'text' });
cancionSchema.index({ createdAt: -1 });
cancionSchema.index({ reproducciones: -1 });
cancionSchema.index({ favorita: 1 });

// Virtual para obtener el ID como string
cancionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Método de instancia: incrementar reproducciones
cancionSchema.methods.incrementarReproducciones = async function() {
  this.reproducciones += 1;
  return await this.save();
};

// Método de instancia: marcar como favorita
cancionSchema.methods.toggleFavorita = async function() {
  this.favorita = !this.favorita;
  return await this.save();
};

// Método estático: buscar canciones por término
cancionSchema.statics.buscar = function(termino) {
  return this.find({
    $or: [
      { titulo: { $regex: termino, $options: 'i' } },
      { artista: { $regex: termino, $options: 'i' } },
      { genero: { $regex: termino, $options: 'i' } }
    ]
  });
};

// Método estático: obtener canciones populares
cancionSchema.statics.populares = function(limite = 10) {
  return this.find()
    .sort({ reproducciones: -1 })
    .limit(limite);
};

// Método estático: obtener favoritas
cancionSchema.statics.favoritas = function() {
  return this.find({ favorita: true })
    .sort({ createdAt: -1 });
};

// Método estático: obtener por género
cancionSchema.statics.porGenero = function(genero) {
  return this.find({ genero: { $regex: genero, $options: 'i' } })
    .sort({ titulo: 1 });
};

// Middleware pre-save: validaciones adicionales
cancionSchema.pre('save', function(next) {
  // Validar que tiempoFin sea mayor que tiempoInicio en cada línea
  if (this.letra && this.letra.length > 0) {
    for (let i = 0; i < this.letra.length; i++) {
      const linea = this.letra[i];
      if (linea.tiempoFin <= linea.tiempoInicio) {
        return next(new Error(`Línea ${i + 1}: tiempoFin debe ser mayor que tiempoInicio`));
      }
    }
  }
  
  // Si no hay año, usar el actual
  if (!this.año) {
    this.año = new Date().getFullYear();
  }
  
  next();
});

// Middleware post-save: logging
cancionSchema.post('save', function(doc) {
  console.log(`✅ Canción guardada: ${doc.titulo} - ${doc.artista} (ID: ${doc._id})`);
});

// Middleware pre-remove: logging
cancionSchema.pre('remove', function(next) {
  console.log(`🗑️ Eliminando canción: ${this.titulo} - ${this.artista}`);
  next();
});

const Cancion = mongoose.model('Cancion', cancionSchema);

module.exports = Cancion;