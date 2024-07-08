const mongoose = require('mongoose');

const economySchema = mongoose.Schema({
	username: { unique: true, type: String, default: '' },
	userID: { unique: true, type: String, required: true },
	balance: { type: Number, default: 0 },
	reputation: { type: Number, default: 0 },

	dailyStreak: { type: Number, default: 1 },
	dailyLastClaimed: { type: Number },
});

module.exports = mongoose.model('economy', economySchema);
