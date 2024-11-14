const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

module.exports = class Play extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('skipto')
				.setDescription('[Holo | Music] Skip current played song to specific queue position.')
				.setDMPermission(true)
				.addIntegerOption(option => option
					.setName('position')
					.setDescription('Provide queue position.')
					.setRequired(true),
				),
			usage: 'skipto <position>',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const player = client.poru.players.get(interaction.guild.id);

		await interaction.deferReply();

		// if (interaction.user.id !== '519521318719324181') return interaction.editReply('`❌` | The music system is currently under maintenance. We apologize for the inconvenience and expect it to be back soon!');

		const value = interaction.options.getInteger('position');

		if (!player) {
			const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song are currently being played.');

			return interaction.editReply({ embeds: [noPlayer] });
		}

		if (!interaction.member.voice.channel) {
			const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on voice channel to use this command!');

			return interaction.editReply({ embeds: [errorEmbed] });
		}

		if (player && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on the same voice channel as me to use this command.');

			return interaction.editReply({ embeds: [errorEmbed] });
		}

		if (interaction.user.id != player.currentTrack.info.requester) {
			const embed = new EmbedBuilder()
				.setColor('Red')
				.setDescription('Only the song requester can skip to specific position of the queue');

			return interaction.editReply({ embeds: [embed], ephemeral: true });
		}

		if (value > player.queue.length) {
			const embed = new EmbedBuilder()
				.setDescription('`❌` | Song position was: `Not found`')
				.setColor('Red');
			return interaction.editReply({ embeds: [embed] });
		}

		if (value === 1) {
			await player.skip();

			const embed = new EmbedBuilder()
				.setDescription(`\`⏭️\` | Song skipped to position: \`${value}\``)
				.setColor('Green');

			return interaction.editReply({ embeds: [embed] });
		}

		await player.queue.splice(0, value - 1);
		await player.skip();

		const embed = new EmbedBuilder()
			.setDescription(`\`⏭️\` | Song skipped to position: \`${value}\``)
			.setColor('Green');

		return interaction.editReply({ embeds: [embed] });

	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};