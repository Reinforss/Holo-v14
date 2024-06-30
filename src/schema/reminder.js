const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema({
	userID: String,

	reminderDuration: Number,
	reminderReason: String,
	reminderStart: Date,
	reminderMsgID: Number,
	reminderFormat: String,
});

module.exports = mongoose.model('reminder', reminderSchema);
