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
		host: '185.201.8.39',
		port: 2333,
		password: 'youshallnotpass',
	},
	nodes: [
		{ name: process.env.NODE_NAME || 'Astera', host: '185.201.8.39', port: 2333, region: 'asia', password: 'youshallnotpass' },
	],
};
