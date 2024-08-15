const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

const votes = new Set();

module.exports = class Skip extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('skip')
				.setDescription('[Holo | Music] Skip a music')
				.setDMPermission(true),
			usage: 'skip',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const player = client.poru.players.get(interaction.guild.id);

		const voiceChannel = interaction.member.voice.channel;

		if (!player) {
			const embed = new EmbedBuilder().setDescription('`❌` | No song are currently being played').setColor('Red');
			return interaction.editReply({ embeds: [embed], ephemeral: true });
		}

		if (!interaction.member.voice.channel) {
			const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on voice channel to use this command!');

			return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
		}

		if (player && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on the same voice channel as mine to use this command.');

			return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
		}

		else {
			const requester = player.currentTrack.info.requester;
			const memberCount = voiceChannel ? voiceChannel.members.size : 1;

			if (interaction.user.id == requester) {
				await player.skip();
				const embed = new EmbedBuilder().setColor('Green').setDescription('`⏭️` | Song has been: `Skipped`');
				votes.clear();
				return interaction.editReply({ embeds: [embed] });
			}

			if (!votes.has(interaction.user.id)) {
				votes.add(interaction.user.id);

				// Calculate required majority
				const majority = Math.ceil(memberCount / 2);

				const embed = new EmbedBuilder()
					.setColor('Yellow')
					.setDescription(`\`🗳️\` | ${interaction.user} has voted to skip the song. \`${votes.size}/${majority}\` votes needed to skip.`);

				interaction.editReply({ embeds: [embed], ephemeral: false });

				// Check if the number of votes reaches the majority
				if (votes.size >= majority) {
					await player.skip();
					const skipEmbed = new EmbedBuilder()
						.setColor('Green')
						.setDescription(`\`⏭️\` | Song has been skipped by vote. \`${votes.size}/${majority}\` votes received.`);

					votes.clear();

					return interaction.editReply({ embeds: [skipEmbed] });
				}
			}
			else {
				const embed = new EmbedBuilder()
					.setColor('Yellow')
					.setDescription('`🗳️` | You already voted to skip!');

				interaction.editReply({ embeds: [embed], ephemeral: true });
			}
		}
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
