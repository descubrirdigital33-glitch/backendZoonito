const Subscription = require('../models/Suscription');
const User = require('../models/Usuario');

exports.subscribe = async (req, res) => {
    const { userId, type } = req.body;
    try {
        const sub = await Subscription.create({ user: userId, type });
        if(type === 'premium') await User.findByIdAndUpdate(userId, { isPremium: true });
        res.status(201).json(sub);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}
