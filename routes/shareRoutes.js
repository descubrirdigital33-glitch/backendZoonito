const express = require('express');
const router = express.Router();
const Music = require('../models/Music');

router.get('/:id', async (req, res) => {
  const music = await Music.findById(req.params.id);
  if (!music) return res.status(404).send('Canción no encontrada');

  const title = `${music.title} - ${music.artist}`;
  
  // Descripción corta y concisa (WhatsApp muestra máximo ~60-80 caracteres)
  const description = `Escuchá esto y mucho más"${music.title}" en MusicAll. ${music.rating?.toFixed(1) || '0.0'}⭐ - ${music.likes || 0}❤️`;
  
  const imageUrl = music.coverUrl || music.avatarArtist || 'https://front-zoonito.vercel.app/assets/zoonito.jpg';
  const frontUrl = `https://front-zoonito.vercel.app/fanpage/${music.artist.replace(/\s+/g, '-').toLowerCase()}`;

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
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      overflow: hidden;
    }
    
    .container {
      text-align: center;
      padding: 40px 20px;
      max-width: 500px;
      width: 100%;
      animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .cover-image {
      width: 200px;
      height: 200px;
      border-radius: 20px;
      object-fit: cover;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      margin: 0 auto 30px;
      display: block;
      animation: scaleIn 0.6s ease-out;
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .artist {
      font-size: 20px;
      opacity: 0.9;
      margin-bottom: 15px;
    }
    
    .album {
      font-size: 16px;
      opacity: 0.8;
      margin-bottom: 15px;
    }
    
    .stats {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .stat {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    
    .spinner-container {
      margin: 30px 0;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .redirect-text {
      font-size: 18px;
      margin-top: 20px;
      opacity: 0.9;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 0.7;
      }
      50% {
        opacity: 1;
      }
    }
    
    .countdown {
      font-size: 48px;
      font-weight: 700;
      margin: 20px 0;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    .manual-link {
      display: inline-block;
      margin-top: 30px;
      padding: 15px 35px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50px;
      color: white;
      text-decoration: none;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .manual-link:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    @media (max-width: 480px) {
      h1 {
        font-size: 24px;
      }
      .artist {
        font-size: 18px;
      }
      .cover-image {
        width: 150px;
        height: 150px;
      }
      .stats {
        gap: 10px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="${title}" class="cover-image" onerror="this.src='https://front-zoonito.vercel.app/assets/zoonito.jpg'">
    
    <h1>${music.title}</h1>
    <p class="artist">🎤 ${music.artist}</p>
    ${music.album ? `<p class="album">💿 ${music.album}</p>` : ''}
    
    <div class="stats">
      <span class="stat">⭐ ${music.rating?.toFixed(1) || '0.0'}</span>
      <span class="stat">❤️ ${music.likes || 0}</span>
    </div>
    
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
    
    <div class="countdown" id="countdown">3</div>
    <p class="redirect-text">Redirigiendo a MusicAll...</p>
    
    <a href="${frontUrl}" class="manual-link">
      🔊 Ir ahora
    </a>
  </div>

  <script>
    const frontUrl = '${frontUrl}';
    let count = 3;
    const countdownEl = document.getElementById('countdown');
    
    // Countdown
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
      } else {
        clearInterval(interval);
        countdownEl.textContent = '🎵';
      }
    }, 1000);
    
    // Redirección automática después de 3 segundos
    setTimeout(() => {
      window.location.href = frontUrl;
    }, 3000);
    
    // Si el usuario hace clic en cualquier parte, redirigir inmediatamente
    document.body.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') {
        window.location.href = frontUrl;
      }
    });
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

module.exports = router;





