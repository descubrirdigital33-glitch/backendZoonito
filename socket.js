// // api/socket.js (Vercel Serverless Function)
// import { Server } from 'socket.io';

// export default function handler(req, res) {
//   if (res.socket.server.io) {
//     console.log('Socket.IO ya está corriendo');
//     res.end();
//     return;
//   }

//   console.log('Iniciando Socket.IO...');
//   const io = new Server(res.socket.server, {
//     path: '/api/socket',
//     addTrailingSlash: false,
//     cors: {
//       origin: process.env.FRONTEND_URL || '*',
//       methods: ['GET', 'POST']
//     }
//   });

//   res.socket.server.io = io;

//   // Manejo de conexiones
//   io.on('connection', (socket) => {
//     console.log('Cliente conectado:', socket.id);

//     // Cliente se une a una sesión de radio
//     socket.on('join-radio', async ({ sessionId }) => {
//       socket.join(`radio-${sessionId}`);
//       console.log(`Cliente ${socket.id} se unió a radio-${sessionId}`);
      
//       // Incrementar contador de listeners
//       io.to(`radio-${sessionId}`).emit('listener-count', 
//         io.sockets.adapter.rooms.get(`radio-${sessionId}`)?.size || 0
//       );
//     });

//     // Cliente abandona la sesión
//     socket.on('leave-radio', ({ sessionId }) => {
//       socket.leave(`radio-${sessionId}`);
      
//       // Actualizar contador de listeners
//       io.to(`radio-${sessionId}`).emit('listener-count', 
//         io.sockets.adapter.rooms.get(`radio-${sessionId}`)?.size || 0
//       );
//     });

//     // Recibir audio del micrófono (chunks binarios)
//     socket.on('live-audio-chunk', ({ sessionId, audioChunk }) => {
//       // Broadcast a todos los listeners excepto el emisor
//       socket.to(`radio-${sessionId}`).emit('receive-live-audio', audioChunk);
//     });

//     // Control de reproducción
//     socket.on('play-control', ({ sessionId, action }) => {
//       io.to(`radio-${sessionId}`).emit('playback-control', action);
//     });

//     // Track cambió
//     socket.on('track-changed', ({ sessionId, track }) => {
//       io.to(`radio-${sessionId}`).emit('current-track', track);
//     });

//     socket.on('disconnect', () => {
//       console.log('Cliente desconectado:', socket.id);
//     });
//   });

//   res.end();

// }




// api/socket.js (Backend - Vercel Serverless Function)
const { Server } = require('socket.io');

module.exports = (req, res) => {
  if (res.socket.server.io) {
    console.log('✅ Socket.IO ya está corriendo');
    res.end();
    return;
  }

  console.log('🚀 Iniciando Socket.IO...');
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: [
        'http://localhost:3000',
        'https://front-zoonito.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('✅ Cliente conectado:', socket.id);

    socket.on('join-radio', ({ sessionId }) => {
      socket.join(`radio-${sessionId}`);
      console.log(`📻 Cliente ${socket.id} se unió a radio-${sessionId}`);
      
      const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
      const listenerCount = room ? room.size : 0;
      
      io.to(`radio-${sessionId}`).emit('listener-count', listenerCount);
    });

    socket.on('leave-radio', ({ sessionId }) => {
      socket.leave(`radio-${sessionId}`);
      console.log(`👋 Cliente ${socket.id} salió de radio-${sessionId}`);
      
      const room = io.sockets.adapter.rooms.get(`radio-${sessionId}`);
      const listenerCount = room ? room.size : 0;
      
      io.to(`radio-${sessionId}`).emit('listener-count', listenerCount);
    });

    socket.on('live-audio-chunk', ({ sessionId, audioChunk }) => {
      socket.to(`radio-${sessionId}`).emit('receive-live-audio', audioChunk);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Cliente desconectado:', socket.id, 'Razón:', reason);
    });
  });

  console.log('✅ Socket.IO configurado correctamente');
  res.end();
};
