const mongoose = require('mongoose');

const economySchema = mongoose.Schema({
	username: { unique: true, type: String },
	userID: { unique: true, type: String },
	balance: { type: Number, default: 0 },
	reputation: { type: Number, default: 0 },

	dailyStreak: { type: Number, default: 1 },
	dailyLastClaimed: { type: Number },
});

module.exports = mongoose.model('economy', economySchema);
