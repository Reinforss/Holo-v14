module.exports.run = async (client, player) => {
	// console.log(`[DEBUG] Player Destroyed from (${player.guildId})`);

	const channel = client.channels.cache.get(player.textChannel);
	if (!channel) return;

	// if (player.message) await player.message.delete().catch((e) => {console.log(e);});
};