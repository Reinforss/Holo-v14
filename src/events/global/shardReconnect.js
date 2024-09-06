const Event = require('../../structures/EventClass');

module.exports = class ShardReconnect extends Event {
	constructor(client) {
		super(client, {
			name: 'shardReconnect', // Or 'shardResumed', depending on the event
			category: 'shard',
		});
		// Cooldown tracking for each shard
		this.shardCooldowns = new Map(); // Track last reconnect times per shard
		this.cooldown = 5 * 60 * 1000; // Set a 5-minute cooldown (adjustable)
	}

	async run() { // 'id' is the shard id
		const client = this.client;
		const id = client.cluster.id;
		const now = Date.now();

		// Get the last reconnect time for this specific shard
		const lastReconnect = this.shardCooldowns.get(id) || 0;

		// Check if the cooldown has passed for this shard
		if (now - lastReconnect > this.cooldown) {
			// Log the shard reconnect event
			console.log(`[${new Date().toString().split(' ', 5).join(' ')}][SHARD] Shard ${id} reconnected!`);

			// Update the last reconnect time for this shard
			this.shardCooldowns.set(id, now);
		}
		else {
			// Optional: Suppress repeated logs within the cooldown period
			console.log(`[${new Date().toString().split(' ', 5).join(' ')}][SHARD] Shard ${id} reconnect suppressed due to cooldown.`);
		}
	}
};
