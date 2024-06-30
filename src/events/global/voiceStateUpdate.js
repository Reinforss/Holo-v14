const Event = require('../../structures/EventClass');

const { EmbedBuilder } = require('discord.js');

module.exports = class VoiceStateUpdate extends Event {
	constructor(client) {
		super(client, {
			name: 'voiceStateUpdate',
			category: 'voice',
		});
	}

	async run(oldState, newState) {
		const client = this.client;

		const player = client.poru.players.get(oldState.guild.id);
		if (!player) return;

		const newChannel = newState.guild.members.me.voice.channel;

		// Check if the bot is not in any voice channel, destroy player
		if (!newChannel) return player.destroy();

		// Exclude bot from member count
		const membersWithoutBots = newChannel.members.filter(m => !m.user.bot);

		// Check if no non-bot members are in the channel
		if (membersWithoutBots.size === 0 && player.queue.length > 0) {
			// Schedule inactivity check after 3 minutes
			setTimeout(async () => {
				// Check voice channel state again after 3 minutes
				const updatedChannel = newState.guild.members.me.voice.channel;
				const updatedMembersWithoutBots = updatedChannel.members.filter(m => !m.user.bot);

				// If still no non-bot members after 3 minutes, send embed and destroy player
				if (updatedMembersWithoutBots.size === 0) {
					const embed = new EmbedBuilder()
						.setDescription('`👋` | Left channel due to inactivity.')
						.setColor('Red');
					const textChannel = client.channels.cache.get(player.textChannel);
					if (textChannel) {
						await textChannel.send({ embeds: [embed] });
					}
					player ? await player.destroy() : oldState.guild.members.me.voice.channel.leave();
				}
			}, 180000);
		}
	}
};
