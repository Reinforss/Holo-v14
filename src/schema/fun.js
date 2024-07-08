const mongoose = require('mongoose');

const funSchema = mongoose.Schema({
	username: { type: String, default: '' },
	userID: { unique: true, required: true, type: String },
	triviaWin: { type: Number, default: 0 },
	reputation: { type: Number, default: 0 },

	dailyCooldown: { type: Number, default: 0 },
});

module.exports = mongoose.model('fun', funSchema);
