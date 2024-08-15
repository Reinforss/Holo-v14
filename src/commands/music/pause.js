const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

module.exports = class Pause extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('pause')
				.setDescription('[Holo | Music] pause a music')
				.setDMPermission(true),
			usage: 'pause',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const player = client.poru.players.get(interaction.guild.id);

		if (!player) {
			const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song are currently being played.');

			return interaction.reply({ embeds: [noPlayer] });
		}

		if (!interaction.member.voice.channel) {
			const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on voice channel to use this command!');

			return interaction.editReply({ embeds: [errorEmbed] });
		}

		if (player && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on the same voice channel as me to use this command.');

			return interaction.editReply({ embeds: [errorEmbed] });
		}


		if (interaction.user.id !== player.currentTrack.info.requester) {
			const embed = new EmbedBuilder()
				.setColor('Red')
				.setDescription('Only the song requester can pause!');

			return interaction.reply({ embeds: [embed] });
		}

		if (player.isPaused) {
			const embed = new EmbedBuilder()
				.setColor('White')
				.setDescription('Player is already paused');

			return interaction.reply({ embeds: [embed] });
		}

		player.pause(true);

		const embed = new EmbedBuilder()
			.setColor('White')
			.setDescription('Paused the player');

		return interaction.reply({ embeds: [embed] });
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};