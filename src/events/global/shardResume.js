const Event = require('../../structures/EventClass');

module.exports = class ShardResume extends Event {
	constructor(client) {
		super(client, {
			name: 'shardResume',
			category: 'shard',
		});
	}

	async run() {
		const client = this.client;
		console.log(`[SHARD] Shard ${client.cluster.id} Resumed!`);
	}
};