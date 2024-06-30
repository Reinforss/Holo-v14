const Event = require('../../structures/EventClass');

module.exports = class ShardReady extends Event {
	constructor(client) {
		super(client, {
			name: 'shardReady',
			category: 'shard',
		});
	}

	async run() {
		const client = this.client;
		console.log(`[SHARD] Shard ${client.cluster.id} Ready!`);
	}
};