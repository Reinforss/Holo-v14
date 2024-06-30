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
		const player = client.poru.players.get(interaction.guild.id);

		if (!player) {
			const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song are currently being played.');

			return interaction.reply({ embeds: [noPlayer] });
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
};