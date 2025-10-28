const { spawn } = require("child_process");

// Función para transmitir
exports.startIcecastStreamFromMongo = async (fileId) => {
  if (!gfs) return console.error("GridFS no inicializado");

  const readStream = gfs.createReadStream({ _id: fileId });

  const ffmpeg = spawn("ffmpeg", [
    "-i", "pipe:0",          // entrada desde stdin
    "-f", "mp3",             // formato de salida
    "-b:a", "128k",          // bitrate
    "-content_type", "audio/mpeg",
    `icecast://source:hackme@${ICECAST_HOST}:${ICECAST_PORT}${MOUNT}` // destino Icecast
  ]);

  readStream.pipe(ffmpeg.stdin);

  ffmpeg.stderr.on("data", data => console.log("ffmpeg:", data.toString()));
  ffmpeg.on("close", code => console.log("Transmisión finalizada con código", code));
};
