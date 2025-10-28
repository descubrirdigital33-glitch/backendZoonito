// controllers/iceController.js
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const Radio = require('../models/Radio');
const Track = require('../models/track');
const IceStream = require('../models/iceModels');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const icy = require('icy');

// GridFS para archivos de audio
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'audioFiles' });
  console.log('✅ GridFS bucket inicializado para Icecast streaming');
});

// Streams activos
const activeStreams = new Map();

/**
 * Descargar archivo de GridFS a archivo temporal
 */
async function downloadFromGridFS(fileId) {
  return new Promise((resolve, reject) => {
    const objectId = new mongoose.Types.ObjectId(fileId);
    const tempFile = path.join(os.tmpdir(), `audio_${fileId}.mp3`);
    const writeStream = fs.createWriteStream(tempFile);
    const downloadStream = gfsBucket.openDownloadStream(objectId);

    downloadStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', () => resolve(tempFile));

    downloadStream.pipe(writeStream);
  });
}

/**
 * Conectar a Icecast usando icy
 */
function connectToIcecast(mountPoint) {
  return new Promise((resolve, reject) => {
    const url = `http://source:${process.env.ICECAST_PASSWORD}@${process.env.ICECAST_HOST}:${process.env.ICECAST_PORT}${mountPoint}`;
    icy.get(url, (res) => {
      resolve(res);
    }).on('error', reject);
  });
}

/**
 * Streamear archivo usando FFmpeg
 */
function streamToIcecast(inputFile, mountPoint, radio) {
  const icecastUrl = `icecast://source:${process.env.ICECAST_PASSWORD}@${process.env.ICECAST_HOST}:${process.env.ICECAST_PORT}${mountPoint}`;
  console.log(`🎙️ Stream FFmpeg a: ${icecastUrl}`);

  const ffmpegProcess = spawn('ffmpeg', [
    '-re',
    '-i', inputFile,
    '-acodec', 'libmp3lame',
    '-ab', '128k',
    '-ar', '44100',
    '-f', 'mp3',
    icecastUrl,
  ]);

  ffmpegProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.toLowerCase().includes('error')) console.error(`❌ FFmpeg: ${msg}`);
  });

  ffmpegProcess.on('close', () => {
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
  });

  return ffmpegProcess;
}

/**
 * Iniciar playlist completo
 */
async function startPlaylistStream(radioId, radio) {
  const tracks = await Track.find({ radioId }).sort({ order: 1 });
  if (!tracks.length) throw new Error('No hay tracks para transmitir');

  let index = 0;
  const nextTrack = async () => {
    if (!activeStreams.has(radioId)) return;

    const track = tracks[index];
    console.log(`▶️ Reproduciendo: ${track.title} - ${track.artist}`);

    try {
      const file = await downloadFromGridFS(track.fileId);
      const process = streamToIcecast(file, radio.icecastMount, radio);
      process.on('close', () => {
        index = (index + 1) % tracks.length;
        setTimeout(nextTrack, 1000);
      });
    } catch (err) {
      console.error('❌ Error streaming track:', err);
      index = (index + 1) % tracks.length;
      setTimeout(nextTrack, 2000);
    }
  };

  await nextTrack();
}

/**
 * START STREAM
 */
exports.startStream = async (req, res) => {
  try {
    const { radioId } = req.body;
    const userId = req.user?.id;
    if (!radioId) return res.status(400).json({ error: 'radioId es requerido' });

    const radio = await Radio.findById(radioId);
    if (!radio) return res.status(404).json({ error: 'Radio no encontrada' });
    if (radio.idMusico.toString() !== userId) return res.status(403).json({ error: 'No autorizado' });
    if (activeStreams.has(radioId)) return res.status(400).json({ error: 'Stream ya activo' });

    activeStreams.set(radioId, { startedAt: new Date() });
    radio.isLive = true;
    radio.isAutomated = true;
    await radio.save();

    const iceStream = new IceStream({ radioId, mountPoint: radio.icecastMount, isActive: true, startedAt: new Date(), listeners: 0 });
    await iceStream.save();

    startPlaylistStream(radioId, radio).catch(err => {
      console.error('❌ Error en stream continuo:', err);
      activeStreams.delete(radioId);
      radio.isLive = false;
      radio.save();
    });

    res.json({ message: '✅ Transmisión iniciada', mountPoint: radio.icecastMount, streamUrl: `${process.env.ICECAST_HOST}:${process.env.ICECAST_PORT}${radio.icecastMount}` });
  } catch (err) {
    console.error('❌ Error startStream:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * STOP STREAM
 */
exports.stopStream = async (req, res) => {
  try {
    const { radioId } = req.body;
    const userId = req.user?.id;
    if (!radioId) return res.status(400).json({ error: 'radioId es requerido' });

    const radio = await Radio.findById(radioId);
    if (!radio) return res.status(404).json({ error: 'Radio no encontrada' });
    if (radio.idMusico.toString() !== userId) return res.status(403).json({ error: 'No autorizado' });

    if (!activeStreams.has(radioId)) return res.status(400).json({ error: 'No hay stream activo' });

    activeStreams.delete(radioId);
    radio.isLive = false;
    radio.isAutomated = false;
    await radio.save();

    await IceStream.findOneAndUpdate({ radioId, isActive: true }, { isActive: false, stoppedAt: new Date() });

    res.json({ message: '✅ Transmisión detenida' });
  } catch (err) {
    console.error('❌ Error stopStream:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET STREAM STATUS
 */
exports.getStreamStatus = async (req, res) => {
  try {
    const { radioId } = req.params;
    const streamState = activeStreams.get(radioId);
    const dbStream = await IceStream.findOne({ radioId, isActive: true });

    res.json({
      isActive: !!streamState,
      startedAt: streamState?.startedAt || dbStream?.startedAt,
      mountPoint: dbStream?.mountPoint,
      listeners: dbStream?.listeners || 0,
    });
  } catch (err) {
    console.error('❌ Error getStreamStatus:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cleanup al cerrar el servidor
 */
process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando todos los streams activos...');
  for (const [radioId] of activeStreams.entries()) {
    await IceStream.findOneAndUpdate({ radioId, isActive: true }, { isActive: false, stoppedAt: new Date() });
  }
  activeStreams.clear();
  console.log('✅ Todos los streams cerrados');
});
