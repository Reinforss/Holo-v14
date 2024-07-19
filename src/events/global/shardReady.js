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
		console.log(`[${new Date().toString().split(' ', 5).join(' ')}][SHARD] Shard ${client.cluster.id} Ready!`);
	}
};