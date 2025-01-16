const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('bookmark', bookmarkSchema);
