const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
	userID: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		default: '',
	},
	reminderDuration: {
		type: Number,
		required: true,
		default: 60,
	},
	reminderReason: {
		type: String,
		required: true,
		default: 'General Reminder',
	},
	reminderStart: {
		type: Date,
		required: true,
		default: Date.now,
	},
	reminderMsgID: {
		type: Number,
		required: true,
		default: 1,
	},
	reminderFormat: {
		type: String,
		required: true,
		default: 'text',
	},
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
