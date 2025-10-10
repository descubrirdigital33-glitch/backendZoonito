const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  avance: { type: Boolean, required: false },
  album: { type: String },
  genre: { type: String },
  soloist: { type: Boolean, default: false },
  audioUrl: { type: String, required: true },
  coverUrl: { type: String },
  audioPublicId: { type: String },
  coverPublicId: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], // 🆕 Array de usuarios que dieron like
  rating: { type: Number, default: 0 },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      value: { type: Number, min: 1, max: 5 }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  idMusico: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  avatarArtist: { type: String }
});

// Método para actualizar el rating promedio
musicSchema.methods.updateRating = function() {
  if (this.ratings.length === 0) {
    this.rating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
    this.rating = sum / this.ratings.length;
  }
  return this.save();
};

module.exports = mongoose.model('Music', musicSchema);