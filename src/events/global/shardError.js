const Event = require('../../structures/EventClass');

module.exports = class ShardError extends Event {
	constructor(client) {
		super(client, {
			name: 'shardError',
			category: 'shard',
		});
	}

	async run() {
		const client = this.client;
		console.log(`[SHARD] Shard ${client.cluster.id} encountered error!`);
	}
};