const express = require('express');
const router = express.Router();
const Music = require('../models/Music');

/**
 * Convierte una URL de Cloudinary a JPG y optimiza para compartir
 * @param {string} imageUrl - URL original de Cloudinary
 * @returns {string} - URL optimizada en formato JPG
 */
function optimizeCloudinaryImage(imageUrl) {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  try {
    // Extraer el public_id y otras partes de la URL
    const urlParts = imageUrl.split('/upload/');
    
    if (urlParts.length !== 2) {
      return imageUrl;
    }

    const baseUrl = urlParts[0];
    const resourcePath = urlParts[1];

    // Remover la extensión actual del archivo
    const pathWithoutExtension = resourcePath.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '');

    // Aplicar transformaciones de Cloudinary:
    // f_jpg - formato JPG
    // q_auto:good - calidad automática buena
    // w_1200,h_630,c_fill - tamaño óptimo para OG tags
    // fl_progressive - carga progresiva
    const transformations = 'f_jpg,q_auto:good,w_1200,h_630,c_fill,fl_progressive';

    return `${baseUrl}/upload/${transformations}/${pathWithoutExtension}.jpg`;
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    return imageUrl;
  }
}

/**
 * Genera un timestamp para cache busting
 * @returns {string}
 */
function getCacheBuster() {
  return `?v=${Date.now()}`;
}

router.get('/:id', async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    
    if (!music) {
      return res.status(404).send('Canción no encontrada');
    }

    const title = `${music.title} - ${music.artist}`;
    const description = `Escuchá la música que más te gusta y compartila con Zoonito. ❤️"${music.title}" de ${music.artist}. ⭐ ${music.rating?.toFixed(1) || '0.0'}/5 - ❤️ ${music.likes || 0} likes`;
    
    // Optimizar imagen de cover a JPG
    const originalImageUrl = music.coverUrl || 'https://front-zoonito.vercel.app/assets/zoonito.jpg';
    const imageUrl = optimizeCloudinaryImage(originalImageUrl);
    
    // URL del front con slug limpio
    const artistSlug = music.artist.replace(/\s+/g, '-').toLowerCase();
    const frontUrl = `https://front-zoonito.vercel.app/fanpage/${artistSlug}`;
    
    // URL canónica con cache buster para forzar actualización en WhatsApp
    const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="music.song">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="MusicAll">
  <meta property="og:locale" content="es_ES">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${title}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Preload imagen para mejor rendimiento -->
  <link rel="preload" as="image" href="${imageUrl}">
  
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
      margin-bottom: 30px;
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
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" 
         alt="${title}" 
         class="cover-image" 
         onerror="this.src='https://front-zoonito.vercel.app/assets/zoonito.jpg'">
    
    <h1>${music.title}</h1>
    <p class="artist">🎤 ${music.artist}</p>
    
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

    // Headers optimizados para compartir en redes sociales
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    res.send(html);
    
  } catch (error) {
    console.error('Error al procesar la canción:', error);
    res.status(500).send('Error al cargar la canción');
  }
});

module.exports = router;





