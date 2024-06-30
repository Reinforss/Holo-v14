const mongoose = require('mongoose');
const Client = require('./src/structures/Client.js');
require('dotenv').config();

const connectToDatabase = () => new Promise((resolve, reject) => {
	mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	mongoose.connection.once('open', () => {
		console.log(
			`[${new Date().toString().split(' ', 5)
				.join(' ')}] Database connected successfully.`,
		);
		resolve();
	});
	mongoose.connection.on('error', error => {
		console.error(`[${new Date().toString().split(' ', 5)
			.join(' ')}] Database connection error:`, error);
		reject(error);
	});
});

connectToDatabase()
	.then(() => {
		const client = new Client();
		client.login();

		process.on('unhandledRejection', e => console.error(e)).on('uncaughtException', e => console.error(e));
	})
	.catch(error => {
		console.error('Failed to connect to the database:', error);
	});
