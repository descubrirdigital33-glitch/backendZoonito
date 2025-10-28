// models/Radio.js
const mongoose = require("mongoose");

const radioSchema = new mongoose.Schema({
  idMusico: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usuario", 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  logo: { 
    type: String  // URL: /api/radio/image/:fileId
  },
  logoFileId: { 
    type: mongoose.Schema.Types.ObjectId  // ⭐ NUEVO - ID del archivo en GridFS
  },
  streamUrl: { 
    type: String 
  },
  icecastMount: { 
    type: String, 
    unique: true 
  },
  isLive: { 
    type: Boolean, 
    default: false 
  },

activeListeners: [{
  userId: String,
  lastPing: Date
}],
  isAutomated: { 
    type: Boolean, 
    default: false 
  },
  autoPlaylist: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Track" 
  }],
  listeners: { 
    type: Number, 
    default: 0 
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  likedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usuario" 
  }],
  guestCode: { 
    type: String 
  },
  allowGuests: { 
    type: Boolean, 
    default: true 
  },
  activeGuests: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    connectedAt: Date,
    isMuted: { type: Boolean, default: false }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  currentTrack: {
    trackId: String,
    title: String,
    artist: String,
    url: String,
    startedAt: Date,
    isPlaying: Boolean
  }
});

module.exports = mongoose.model("Radio", radioSchema);