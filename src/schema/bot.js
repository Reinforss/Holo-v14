const mongoose = require('mongoose');

const botSchema = mongoose.Schema({
	botID: { type: Number, unique: true },
});

module.exports = mongoose.model('bot', botSchema);
