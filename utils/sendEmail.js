// const nodemailer = require("nodemailer");

// const sendEmail = async (to, subject, text = "", html = "") => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || "587", 10),
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"MusicApp" <${process.env.SMTP_USER}>`,
//       to,
//       subject,
//       text,
//       html, // ahora html está definido
//     });

//     console.log(`Correo enviado a ${to}`);
//   } catch (error) {
//     console.error("Error enviando correo:", error);
//   }
// };

// module.exports = sendEmail;



const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {  // ⬅️ Agrega 'html' como parámetro
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.gmail.com
      port: parseInt(process.env.SMTP_PORT || '587', 10), // 587
      secure: false, // true si usas 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"MusicApp" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || '',  // ⬅️ Texto plano (opcional)
      html: html || text // ⬅️ HTML o texto como fallback
    });

  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    throw error; // ⬅️ Importante: lanza el error para manejarlo en el controller
  }
};

module.exports = sendEmail;
