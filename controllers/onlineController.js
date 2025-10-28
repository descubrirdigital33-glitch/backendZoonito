// controllers/onlineController.js
const StreamingSession = require('../models/onlineModels');
const Track = require('../models/track'); // Tu modelo de tracks
const { Readable } = require('stream');

class RadioStreamController {
  constructor() {
    // Almacenamos sesiones activas en memoria (por sesión serverless)
    this.activeSessions = new Map();
  }

  /**
   * Inicia una sesión de streaming
   * POST /api/radio/start
   */
  async startStreaming(req, res) {
    try {
      const { trackId, playlistId, userId } = req.body;
      
      // Validar que existe el track o playlist
      let tracks = [];
      if (trackId) {
        const track = await Track.findById(trackId);
        if (!track) return res.status(404).json({ error: 'Track no encontrado' });
        tracks = [track];
      } else if (playlistId) {
        tracks = await Track.find({ playlistId });
      }

      if (tracks.length === 0) return res.status(400).json({ error: 'No hay tracks disponibles' });

      // Crear sesión de streaming en MongoDB
      const session = new StreamingSession({
        userId,
        trackQueue: tracks.map(t => t._id),
        currentTrackIndex: 0,
        isActive: true,
        listeners: 0,
        startedAt: new Date()
      });
      
      await session.save();

      // Guardar en memoria para acceso rápido
      this.activeSessions.set(session._id.toString(), {
        session,
        tracks,
        currentIndex: 0
      });

      res.json({
        success: true,
        sessionId: session._id,
        currentTrack: tracks[0],
        totalTracks: tracks.length
      });

    } catch (error) {
      console.error('Error iniciando streaming:', error);
      res.status(500).json({ error: 'Error al iniciar streaming' });
    }
  }

  /**
   * Detiene una sesión de streaming
   * POST /api/radio/stop
   */
  async stopStreaming(req, res) {
    try {
      const { sessionId } = req.body;

      await StreamingSession.findByIdAndUpdate(sessionId, {
        isActive: false,
        endedAt: new Date()
      });

      this.activeSessions.delete(sessionId);

      res.json({ success: true, message: 'Streaming detenido' });

    } catch (error) {
      console.error('Error deteniendo streaming:', error);
      res.status(500).json({ error: 'Error al detener streaming' });
    }
  }

  /**
   * Obtiene el estado actual del streaming
   * GET /api/radio/status/:sessionId
   */
  async getStreamingStatus(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await StreamingSession.findById(sessionId).populate('trackQueue');
      if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

      const currentTrack = session.trackQueue[session.currentTrackIndex];

      res.json({
        isActive: session.isActive,
        currentTrack,
        currentIndex: session.currentTrackIndex,
        totalTracks: session.trackQueue.length,
        listeners: session.listeners,
        startedAt: session.startedAt
      });

    } catch (error) {
      console.error('Error obteniendo estado:', error);
      res.status(500).json({ error: 'Error al obtener estado' });
    }
  }

  /**
   * Stream de audio - envía chunks del archivo desde MongoDB
   * GET /api/radio/stream/:trackId
   */
  async streamTrack(req, res) {
    try {
      const { trackId } = req.params;
      const track = await Track.findById(trackId);

      if (!track || !track.audioData) return res.status(404).json({ error: 'Audio no encontrado' });

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', track.audioData.length);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache');

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : track.audioData.length - 1;
        const chunksize = (end - start) + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${track.audioData.length}`);
        res.setHeader('Content-Length', chunksize);

        const audioChunk = track.audioData.slice(start, end + 1);
        res.end(audioChunk);
      } else {
        res.end(track.audioData);
      }

    } catch (error) {
      console.error('Error streaming track:', error);
      res.status(500).json({ error: 'Error al hacer streaming' });
    }
  }

  /**
   * Siguiente track en la cola
   * POST /api/radio/next
   */
  async nextTrack(req, res) {
    try {
      const { sessionId } = req.body;
      const sessionData = this.activeSessions.get(sessionId);
      if (!sessionData) return res.status(404).json({ error: 'Sesión no encontrada' });

      const nextIndex = sessionData.currentIndex + 1;
      sessionData.currentIndex = nextIndex >= sessionData.tracks.length ? 0 : nextIndex;

      await StreamingSession.findByIdAndUpdate(sessionId, { currentTrackIndex: sessionData.currentIndex });

      const currentTrack = sessionData.tracks[sessionData.currentIndex];

      res.json({
        success: true,
        currentTrack,
        currentIndex: sessionData.currentIndex
      });

    } catch (error) {
      console.error('Error cambiando track:', error);
      res.status(500).json({ error: 'Error al cambiar track' });
    }
  }
}

module.exports = new RadioStreamController();
