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
		defaultPlatform: 'ytsearch' || 'dzsearch' || 'spsearch',
		reconnectTries: Infinity,
		reconnectTimeout: 10000,
	},
	restnode: {
		// host: 'lava-v4.ajieblogs.eu.org',
		// port: 443,
		// password: 'https://dsc.gg/ajidevserver',
		// secure: true,
		host: process.env.MUSICHOST,
		port: 2333,
		password: process.env.MUSICPASSWORD,
	},
	nodes: [
		// { name: process.env.NODE_NAME || 'Astera', host: 'lava-v4.ajieblogs.eu.org', port: 443, region: 'asia', password: 'https://dsc.gg/ajidevserver', secure: true },
		{ name: process.env.NODE_NAME || 'Astera', host: process.env.MUSICHOST, port: 2333, region: 'asia', password: process.env.MUSICPASSWORD },
	],
};
