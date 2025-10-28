require("dotenv").config();
const mongoose = require("mongoose");
const Radio = require("../models/Radio");
const User = require("../models/Usuario");

async function seedRadio() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Conectado a MongoDB");

    // Buscar un usuario existente o crear uno de prueba
    let user = await User.findOne({ email: "test@test.com" });
    
    if (!user) {
      user = new User({
        name: "Usuario Test",
        email: "test@test.com",
        password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456", // Password hasheado (no importa para pruebas)
        isPremium: true
      });
      await user.save();
      console.log("✅ Usuario de prueba creado");
    }

    // Crear radio de prueba
    const radio = new Radio({
      idMusico: user._id,
      name: "Radio Test",
      description: "Radio de prueba para desarrollo",
      streamUrl: "http://localhost:3000/test",
      icecastMount: "/test",
      isLive: false,
      isAutomated: false,
      allowGuests: true,
      listeners: 0,
      likes: 0
    });

    await radio.save();
    
    console.log("✅ Radio creada exitosamente");
    console.log("📋 ID de la radio:", radio._id.toString());
    console.log("📋 Copia este ID y úsalo en tu frontend");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedRadio();