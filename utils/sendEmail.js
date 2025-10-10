const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text = "", html = "") => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MusicApp" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html, // ahora html está definido
    });

    console.log(`Correo enviado a ${to}`);
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
};

module.exports = sendEmail;
