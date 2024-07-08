/* eslint-disable func-names */
const serverSchema = require('../schema/server');
const userSchema = require('../schema/user');

async function fetchDocument(schema, key, newDocFields) {
	try {
		let doc = await schema.findOne({ key });
		if (!doc) {
			doc = new schema(newDocFields);
			await doc.save();
		}
		return doc;
	}
	catch (error) {
		console.error(`Failed to fetch document for key ${key}:`, error);
		throw error;
	}
}

module.exports = {
	async fetchServer(key) {
		return fetchDocument(serverSchema, key, { Id: key });
	},

	async fetchUser(key) {
		return fetchDocument(userSchema, key, { userID: key });
	},
};
