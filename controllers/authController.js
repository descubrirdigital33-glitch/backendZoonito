const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Generar código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Registro de usuario
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await Usuario.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email ya registrado" });

    const verificationCode = generateVerificationCode();

    const user = await Usuario.create({
      name,
      email,
      password,
      role,
      verificationCode,
    });

    // Enviar email de verificación
    await sendEmail(
      user.email,
      "Código de verificación MusicApp",
      `Hola ${user.name}, tu código de verificación es: ${verificationCode}`
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: "Se envió un código de verificación a tu correo",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verificación de email con código
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await Usuario.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.verified)
      return res.status(400).json({ message: "Usuario ya verificado" });
    if (user.verificationCode !== code)
      return res.status(400).json({ message: "Código inválido" });

    user.verified = true;
    user.verificationCode = undefined; // limpiar código
    await user.save();

    res.json({ message: "Usuario verificado correctamente" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reenviar código de verificación
exports.resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Usuario.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.verified)
      return res.status(400).json({ message: "Usuario ya verificado" });

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    await sendEmail(
      user.email,
      "Nuevo código de verificación MusicApp",
      `Hola ${user.name}, tu nuevo código de verificación es: ${verificationCode}`
    );

    res.json({ message: "Se envió un nuevo código de verificación" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Usuario.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (!user.verified)
        return res.status(401).json({ message: "Usuario no verificado" });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        token: generateToken(user._id),
        avatar: user.avatar,
      });
    } else {
      res.status(401).json({ message: "Credenciales inválidas" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Tomamos el token de la cabecera Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          message:
            "Usuario no autenticado sto que seria de la parte del backend por que no se si es asi",
        });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Decodificamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // 3️⃣ Buscamos el usuario en la DB
    const user = await Usuario.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "Usuario no encontrado" });

    // 4️⃣ Guardamos el usuario en req.user
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Usuario no autenticado" });
  }
};
