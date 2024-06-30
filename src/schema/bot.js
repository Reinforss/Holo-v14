const mongoose = require('mongoose');

const botSchema = mongoose.Schema({
	botID: Number,
});

module.exports = mongoose.model('bot', botSchema);
