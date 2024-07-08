const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	userID: {
		unique: true,
		required: true,
		type: String,
	},
	username: {
		type: String,
		default: '',
	},
	afk: {
		default: '',
		type: String,
	},
	commandRun: {
		default: 0,
		type: Number,
	},

	mostUsedCommand: {
		default: '',
		type: String,
	},
	commands: {
		type: Map,
		of: Number,
		default: {},
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
