// controllers/cancionesController.js
const Cancion = require('../models/cancionModel');
const mongoose = require('mongoose');

// Obtener todas las canciones
const obtenerTodas = async (req, res) => {
  try {
    const canciones = await Cancion.find()
      .select('-letra') // No incluir letra en listado (optimización)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: canciones.length,
      data: canciones
    });
  } catch (error) {
    console.error('Error obteniendo canciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener canciones',
      mensaje: error.message
    });
  }
};

// Obtener canción por ID (incluye letra)
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    const cancion = await Cancion.findById(id);

    if (!cancion) {
      return res.status(404).json({
        success: false,
        error: 'Canción no encontrada'
      });
    }

    res.json({
      success: true,
      data: cancion
    });
  } catch (error) {
    console.error('Error obteniendo canción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener canción',
      mensaje: error.message
    });
  }
};

// Crear nueva canción
const crear = async (req, res) => {
  try {
    const { titulo, artista, audioUrl, letra, cover, duracion, genero, año } = req.body;

    // Validaciones
    if (!titulo || !artista || !audioUrl) {
      return res.status(400).json({
        success: false,
        error: 'Título, artista y audioUrl son requeridos'
      });
    }

    // Extraer el ID de GridFS del audioUrl si existe
    let audioGridFsId = null;
    if (audioUrl.includes('/api/audio/')) {
      audioGridFsId = audioUrl.split('/api/audio/')[1];
    }

    // Crear canción
    const nuevaCancion = new Cancion({
      titulo,
      artista,
      audioUrl,
      audioGridFsId,
      letra: letra || [],
      cover: cover || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
      duracion: duracion || 0,
      genero: genero || '',
      año: año || new Date().getFullYear()
    });

    await nuevaCancion.save();

    res.status(201).json({
      success: true,
      message: 'Canción creada exitosamente',
      data: nuevaCancion
    });
  } catch (error) {
    console.error('Error creando canción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear canción',
      mensaje: error.message
    });
  }
};

// Actualizar canción
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // No permitir actualizar el ID de GridFS directamente
    if (actualizaciones.audioGridFsId) {
      delete actualizaciones.audioGridFsId;
    }

    const cancionActualizada = await Cancion.findByIdAndUpdate(
      id,
      actualizaciones,
      { new: true, runValidators: true }
    );

    if (!cancionActualizada) {
      return res.status(404).json({
        success: false,
        error: 'Canción no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Canción actualizada exitosamente',
      data: cancionActualizada
    });
  } catch (error) {
    console.error('Error actualizando canción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar canción',
      mensaje: error.message
    });
  }
};

// Eliminar canción
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    const cancion = await Cancion.findById(id);

    if (!cancion) {
      return res.status(404).json({
        success: false,
        error: 'Canción no encontrada'
      });
    }

    // Eliminar archivo de audio de GridFS si existe
    if (cancion.audioGridFsId && global.gfsBucket) {
      try {
        await global.gfsBucket.delete(new mongoose.Types.ObjectId(cancion.audioGridFsId));
        console.log(`✅ Audio eliminado de GridFS: ${cancion.audioGridFsId}`);
      } catch (error) {
        console.error('Error eliminando audio de GridFS:', error);
        // Continuar con la eliminación de la canción aunque falle el audio
      }
    }

    await Cancion.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Canción eliminada exitosamente',
      data: { id }
    });
  } catch (error) {
    console.error('Error eliminando canción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar canción',
      mensaje: error.message
    });
  }
};

// Obtener solo la letra de una canción
const obtenerLetra = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    const cancion = await Cancion.findById(id).select('letra titulo artista');

    if (!cancion) {
      return res.status(404).json({
        success: false,
        error: 'Canción no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        titulo: cancion.titulo,
        artista: cancion.artista,
        letra: cancion.letra || []
      }
    });
  } catch (error) {
    console.error('Error obteniendo letra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener letra',
      mensaje: error.message
    });
  }
};

// Actualizar solo la letra de una canción
const actualizarLetra = async (req, res) => {
  try {
    const { id } = req.params;
    const { letra } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    if (!letra || !Array.isArray(letra)) {
      return res.status(400).json({
        success: false,
        error: 'Letra debe ser un array de objetos con formato: [{ texto, tiempoInicio, tiempoFin }]'
      });
    }

    // Validar estructura de cada línea
    for (let i = 0; i < letra.length; i++) {
      const linea = letra[i];
      if (!linea.texto || typeof linea.tiempoInicio !== 'number' || typeof linea.tiempoFin !== 'number') {
        return res.status(400).json({
          success: false,
          error: `Línea ${i + 1} tiene formato inválido. Debe contener: texto (string), tiempoInicio (number), tiempoFin (number)`
        });
      }
      if (linea.tiempoFin <= linea.tiempoInicio) {
        return res.status(400).json({
          success: false,
          error: `Línea ${i + 1}: tiempoFin debe ser mayor que tiempoInicio`
        });
      }
    }

    const cancion = await Cancion.findByIdAndUpdate(
      id,
      { letra },
      { new: true, runValidators: true }
    );

    if (!cancion) {
      return res.status(404).json({
        success: false,
        error: 'Canción no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Letra actualizada exitosamente',
      data: cancion
    });
  } catch (error) {
    console.error('Error actualizando letra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar letra',
      mensaje: error.message
    });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerLetra,
  actualizarLetra
};