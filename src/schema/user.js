const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	userID: {
		unique: true,
		type: String,
	},
	afk: {
		default: '',
		type: String,
	},
	commandRun: {
		default: 0,
		type: Number,
	},
	experience: {
		default: 0,
		type: Number,
	},
	level: {
		type: Number,
		default: 1,
	},
});

module.exports = mongoose.model('user', userSchema);
