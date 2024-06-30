const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

const votes = new Set();

module.exports = class Stop extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('stop')
				.setDescription('[Holo | Music] Stop a music')
				.setDMPermission(true),
			usage: 'Stop',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const player = client.poru.players.get(interaction.guild.id);

		const voiceChannel = interaction.member.voice.channel;
		const requester = player.currentTrack.info.requester;
		const memberCount = voiceChannel ? voiceChannel.members.size : 1;

		if (!player) {
			const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song are currently being played.');

			return interaction.reply({ embeds: [noPlayer] });
		}

		if (interaction.user.id == requester) {
			await player.destroy();
			const embed = new EmbedBuilder().setColor('Green').setDescription('`👋` | Player has been: `Disconnected`.');
			votes.clear();
			return interaction.reply({ embeds: [embed] });
		}

		if (!votes.has(interaction.user.id)) {
			votes.add(interaction.user.id);

			// Calculate required majority
			const majority = Math.ceil(memberCount / 2);

			const embed = new EmbedBuilder()
				.setColor('Yellow')
				.setDescription(`\`🗳️\` | ${interaction.user} has voted to stop the music. \`${votes.size}/${majority}\` votes needed to skip.`);

			interaction.reply({ embeds: [embed], ephemeral: false });

			// Check if the number of votes reaches the majority
			if (votes.size >= majority) {
				await player.destroy();
				const skipEmbed = new EmbedBuilder()
					.setColor('Green')
					.setDescription(`\`👋\` | Player has been: \`Disconnected\`. \`${votes.size}/${majority}\` votes received.`);

				votes.clear();

				return interaction.reply({ embeds: [skipEmbed] });
			}
		}
		else {
			const embed = new EmbedBuilder()
				.setColor('Yellow')
				.setDescription('`🗳️` | You already voted to stop!');

			interaction.reply({ embeds: [embed] });
		}


	}
};
