const Event = require('../../structures/EventClass');

module.exports = class ShardRReconnect extends Event {
	constructor(client) {
		super(client, {
			name: 'shardReconnect',
			category: 'shard',
		});
	}

	async run() {
		const client = this.client;
		console.log(`[SHARD] Shard ${client.cluster.id} reconnected!`);
	}
};