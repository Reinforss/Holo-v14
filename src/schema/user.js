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
	globalLevel: {
		experience: { type: Number, default: 0 },
		level: { type: Number, default: 1 },
		titles: [{
			title: { type: String, required: true },
			dateAchieved: { type: Date, default: Date.now },
		}],
	},
	localLevels: [{
		serverID: { type: String, required: true },
		experience: { type: Number, default: 0 },
		level: { type: Number, default: 1 },
	}],
	lastXPTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', userSchema);
