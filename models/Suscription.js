const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['free', 'premium'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
