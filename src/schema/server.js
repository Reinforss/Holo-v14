const mongoose = require('mongoose');

const serverSchema = mongoose.Schema({
	serverID: {
		unique: true,
		type: String,
		required: true,
	},
	playerControl: { type: String, default: 'enable' },
	reconnect: {
		status: { type: Boolean, default: false },
		text: { type: String, default: null },
		voice: { type: String, default: null },
	},

	prefix: {
		default: 'z!',
		type: String,
	},
	LoggingEnabled: {
		default: false,
		type: Boolean,
	},
	LoggingChannel: {
		default: '',
		type: String,
	},

	LevelingEnabled: {
		default: false,
		type: Boolean,
	},
	LevelingMessage: {
		default: 'Congralutions {{user}} you have leveled up to {{level}}',
		type: String,
	},
});

module.exports = mongoose.model('Guild', serverSchema);
