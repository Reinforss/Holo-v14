const mongoose = require('mongoose');

const funSchema = mongoose.Schema({
	userID: String,
	triviaWin: { type: Number, default: 0 },
});
module.exports = mongoose.model('fun', funSchema);
