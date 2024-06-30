const mongoose = require('mongoose');

const bookmarkGuildSchema = mongoose.Schema({
	guildID: String,
	bookmarks: [{
		id: String,
		name: String,
		content: String,
		hidden: Boolean,
		author: String,
		createdAt: { type: Date, default: Date.now },
	}],
});
module.exports = mongoose.model('bookmarkGuild', bookmarkGuildSchema);
