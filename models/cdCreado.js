const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: String,
  url: String,
  duration: Number,
  order: Number
});

const cdSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  genre: { type: String, required: true },
  coverImage: String,
  tracks: [trackSchema],
  duration: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  plays: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

// Métodos opcionales para likes
cdSchema.methods.hasLikedBy = function(userId) {
  return this.likes.includes(userId);
};
cdSchema.methods.addLike = function(userId) {
  this.likes.push(userId);
  this.likesCount = this.likes.length;
  return this.save();
};
cdSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
  this.likesCount = this.likes.length;
  return this.save();
};

module.exports = mongoose.model('cdCreado', cdSchema);
