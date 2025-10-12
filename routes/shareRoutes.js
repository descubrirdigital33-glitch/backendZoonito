const express = require('express');
const router = express.Router();
const Music = require('../models/Music');

router.get('/:id', async (req, res) => {
  const music = await Music.findById(req.params.id);
  if (!music) return res.status(404).send('Canción no encontrada');

  const title = `${music.title} - ${music.artist}`;
  const description = `Escuchá "${music.title}" de ${music.artist}. ⭐ ${music.rating?.toFixed(1) || '0.0'}/5 - ❤️ ${music.likes || 0} likes`;
  const imageUrl = music.coverUrl || 'https://front-zoonito.vercel.app/assets/zoonito.jpg';
  const frontUrl = `https://front-zoonito.vercel.app/share?id=${music._id}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:type" content="music.song">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${req.protocol}://${req.get('host')}/api/share/${music._id}">
</head>
<body style="font-family:sans-serif;text-align:center;margin-top:50px;">
  <img src="${imageUrl}" alt="${title}" style="max-width:300px;">
  <h1>${music.title}</h1>
  <p>${music.artist}</p>
  <p><a href="${frontUrl}">🔊 Escuchar en MusicAll</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

module.exports = router;

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

//   // Detectar si es un bot (WhatsApp, Facebook, etc.)
//   const userAgent = req.get('user-agent') || '';
//   const isBot = /bot|crawler|spider|crawling|whatsapp|facebook/i.test(userAgent);

//   if (isBot) {
//     // Mostrar metadata para bots
//     const html = `<!DOCTYPE html>
// <html lang="es">
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <meta property="og:type" content="music.song">
//   <meta property="og:title" content="${title}">
//   <meta property="og:description" content="${description}">
//   <meta property="og:image" content="${imageUrl}">
//   <meta property="og:url" content="${frontUrl}">
//   <meta property="og:site_name" content="MusicAll">
//   <meta name="twitter:card" content="summary_large_image">
//   <meta name="twitter:title" content="${title}">
//   <meta name="twitter:description" content="${description}">
//   <meta name="twitter:image" content="${imageUrl}">
// </head>
// <body style="font-family:sans-serif;text-align:center;margin-top:50px;">
//   <img src="${imageUrl}" alt="${title}" style="max-width:300px;">
//   <h1>${music.title}</h1>
//   <p>${music.artist}</p>
//   <p><a href="${frontUrl}">🔊 Escuchar en MusicAll</a></p>
// </body>
// </html>`;

//     res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     res.send(html);
//   } else {
//     // Redirigir usuarios normales al frontend
//     res.redirect(frontUrl);
//   }
// });

// module.exports = router;

