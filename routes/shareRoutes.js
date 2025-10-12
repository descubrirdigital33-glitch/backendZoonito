// const express = require('express');
// const router = express.Router();
// const Music = require('../models/Music');

// router.get('/:id', async (req, res) => {
//   const music = await Music.findById(req.params.id);
//   if (!music) return res.status(404).send('Canción no encontrada');

//   const title = `${music.title} - ${music.artist}`;
//   const description = `Escuchá "${music.title}" de ${music.artist}. ⭐ ${music.rating?.toFixed(1) || '0.0'}/5 - ❤️ ${music.likes || 0} likes`;
//   const imageUrl = music.coverUrl || 'https://front-zoonito.vercel.app/assets/zoonito.jpg';
//   const frontUrl = `https://front-zoonito.vercel.app/share?id=${music._id}`;

//   const html = `<!DOCTYPE html>
// <html lang="es">
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <meta property="og:type" content="music.song">
//   <meta property="og:title" content="${title}">
//   <meta property="og:description" content="${description}">
//   <meta property="og:image" content="${imageUrl}">
//   <meta property="og:url" content="${req.protocol}://${req.get('host')}/api/share/${music._id}">
// </head>
// <body style="font-family:sans-serif;text-align:center;margin-top:50px;">
//   <img src="${imageUrl}" alt="${title}" style="max-width:300px;">
//   <h1>${music.title}</h1>
//   <p>${music.artist}</p>
//   <p><a href="${frontUrl}">🔊 Escuchar en MusicAll</a></p>
// </body>
// </html>`;

//   res.setHeader('Content-Type', 'text/html; charset=utf-8');
//   res.send(html);
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const Music = require('../models/Music');

router.get('/:id', async (req, res) => {
  const music = await Music.findById(req.params.id);
  if (!music) return res.status(404).send('Canción no encontrada');

  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const title = escapeHtml(`${music.title} - ${music.artist}`);
  const description = escapeHtml(`Escucha "${music.title}" de ${music.artist}. ${music.rating?.toFixed(1) || '0.0'}/5 - ${music.likes || 0} likes`);
  const imageUrl = music.coverUrl || music.avatarArtist || 'https://front-zoonito.vercel.app/assets/zoonito.jpg';
  const frontUrl = `https://front-zoonito.vercel.app/share?id=${music._id}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Open Graph para WhatsApp/Facebook -->
  <meta property="og:type" content="music.song">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${frontUrl}">
  <meta property="og:site_name" content="MusicAll">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Auto-redirigir después de 3 segundos -->
  <meta http-equiv="refresh" content="3;url=${frontUrl}">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    img {
      max-width: 250px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      margin: 15px 0 5px 0;
      font-weight: 700;
    }
    .artist {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .album {
      font-size: 14px;
      opacity: 0.7;
      margin-bottom: 20px;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 20px 0;
      font-size: 16px;
    }
    .stat {
      background: rgba(255, 255, 255, 0.2);
      padding: 10px 20px;
      border-radius: 10px;
    }
    .link {
      display: inline-block;
      background: #1DB954;
      color: white;
      text-decoration: none;
      padding: 15px 30px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      margin-top: 20px;
      transition: transform 0.2s;
    }
    .link:hover {
      transform: scale(1.05);
      background: #1ed760;
    }
    .redirect {
      margin-top: 20px;
      font-size: 14px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="${title}" onerror="this.src='https://front-zoonito.vercel.app/assets/zoonito.jpg'">
    <h1>${music.title}</h1>
    <p class="artist">👤 ${music.artist}</p>
    ${music.album ? `<p class="album">💿 ${escapeHtml(music.album)}</p>` : ''}
    
    <div class="stats">
      <div class="stat">⭐ ${music.rating?.toFixed(1) || '0.0'}</div>
      <div class="stat">❤️ ${music.likes || 0}</div>
    </div>
    
    <a href="${frontUrl}" class="link">🔊 Escuchar en MusicAll</a>
    
    <p class="redirect">Redirigiendo automáticamente en 3 segundos...</p>
  </div>
  
  <script>
    // Redirección inmediata en móviles
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setTimeout(() => {
        window.location.href = '${frontUrl}';
      }, 2000);
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

module.exports = router;
