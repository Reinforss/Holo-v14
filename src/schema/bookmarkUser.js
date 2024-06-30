const mongoose = require('mongoose');

const bookmarkUserSchema = mongoose.Schema({
	userID: String,
	bookmarks: [{
		id: String,
		name: String,
		content: String,
		hidden: Boolean,
		createdAt: { type: Date, default: Date.now },
	}],
});
module.exports = mongoose.model('bookmarkUser', bookmarkUserSchema);
