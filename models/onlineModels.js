// models/onlineModels.js
const mongoose = require('mongoose');

const streamingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trackQueue: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  currentTrackIndex: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  listeners: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  liveAudioEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StreamingSession', streamingSessionSchema);




// // models/onlineModels.js
// import mongoose from 'mongoose';

// const streamingSessionSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   trackQueue: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Track'
//   }],
//   currentTrackIndex: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   listeners: {
//     type: Number,
//     default: 0
//   },
//   startedAt: {
//     type: Date,
//     default: Date.now
//   },
//   endedAt: {
//     type: Date
//   },
//   // Para el micrófono en vivo
//   liveAudioEnabled: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });


// export default mongoose.model('StreamingSession', streamingSessionSchema);
