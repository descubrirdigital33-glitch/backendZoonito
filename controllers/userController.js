const User = require("../models/Usuario");
const Music = require("../models/Music");

exports.updateProfile = async (req, res) => {
  try {

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const { name, role } = req.body;

    // 🔹 Si viene un archivo, tomamos su URL directamente
    const avatarUrl = req.file?.path;

    // Actualizar Usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name, 
        role, 
        ...(avatarUrl && { avatar: avatarUrl }) // solo si hay avatar
      },
      { new: true }
    );

    // Actualizar Music (avatarArtist) si se cambió avatar
    if (avatarUrl) {
      await Music.updateMany(
        { idMusico: userId },
        { $set: { avatarArtist: avatarUrl } }
      );
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error backend updateProfile:", err);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};
