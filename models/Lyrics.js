const mongoose = require("mongoose");

const lyricLineSchema = new mongoose.Schema({
  time: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
});

const lyricsSchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Music",
    required: true,
    unique: true, // ✅ Una canción solo puede tener un documento de letras
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  lines: [lyricLineSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model("Lyrics", lyricsSchema);