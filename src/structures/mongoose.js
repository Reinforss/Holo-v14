/* eslint-disable func-names */
const serverSchema = require('../schema/server');
const userSchema = require('../schema/user');

module.exports.fetchServer = async function(key) {
	try {
		let serverData = await serverSchema.findOne({ key });
		if (serverData) {
			return serverData;
		}
		serverData = new serverSchema({ Id: key });
		await serverData.save().catch(err => console.log(err));
		return serverData;
	}
	catch (error) {
		console.log('Failed', error);
	}

	// eslint-disable-next-line no-shadow
	module.exports.fetchUser = async function(key) {
		let userData = await userSchema.findOne({ key });
		if (userData) {
			return userData;
		}
		userData = new userSchema({ userID: key });
		await userData.save().catch(err => console.log(err));
		return userData;
	};
};
