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

	leveling: {
		status: { type: Boolean, default: false },
		levelupmessage: { type: String, default: null },
	},

	welcome: {
		status: { type: Boolean, default: false },
		channel: { type: String, default: null },
		message: { type: String, default: null },
		background: { type: String, default: null },
	},

	goodbye: {
		status: { type: Boolean, default: false },
		channel: { type: String, default: null },
		message: { type: String, default: null },
		background: { type: String, default: null },
	},

});

module.exports = mongoose.model('Guild', serverSchema);
