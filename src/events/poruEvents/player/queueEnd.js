const { EmbedBuilder } = require('discord.js');

module.exports.run = async (client, player) => {
	const channel = client.channels.cache.get(player.textChannel);
	if (!channel) return;

	if (player.queue.length) return;

	if (player.message) await player.message.delete().catch((e) => {e.delete;});

	await player.destroy();

	const embed = new EmbedBuilder()
		.setDescription('`👋` | Leaving voice channel due to empty queue.')
		.setColor('Red');

	return channel.send({ embeds: [embed] });
};