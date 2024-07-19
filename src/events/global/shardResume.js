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
		console.log(`[${new Date().toString().split(' ', 5).join(' ')}][SHARD] Shard ${client.cluster.id} Resumed!`);
	}
};