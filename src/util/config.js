require('dotenv').config();
const { customFilter } = require('poru');

module.exports = {
	clientConfig: {
		token: process.env.TOKEN,
		clientId: process.env.CLIENTID,
	},
	poruOptions: {
		customFilter,
		library: 'discord.js',
		defaultPlatform: process.env.DEFAULT_PLATFORM || ' ',
		reconnectTries: Infinity,
		reconnectTimeout: 10000,
	},
	restnode: {
		host: process.env.MUSICHOST,
		port: 2333,
		password: process.env.MUSICPASSWORD,
	},
	nodes: [
		{ name: process.env.NODE_NAME || 'Astera', host: process.env.MUSICHOST, port: 2333, region: 'asia', password: process.env.MUSICPASSWORD },
	],
};
