const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

module.exports = class Volume extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('volume')
				.setDescription('[Holo | Music] Change music volume')
				.setDMPermission(true)
				.addNumberOption(option => option
					.setName('volume')
					.setDescription('Change the music volume')
					.setRequired(true),
				),
			usage: 'volume <number>',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const player = client.poru.players.get(interaction.guild.id);

		// if (interaction.user.id !== '519521318719324181') return interaction.reply('`❌` | The music system is currently under maintenance. We apologize for the inconvenience and expect it to be back soon!');

		const embed = new EmbedBuilder();

		const volume = interaction.options.getNumber('volume');
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

		if (interaction.user.id != player.currentTrack.info.requester) {
			embed.setColor('Red');
			embed.setDescription('Only the song requester can change volume!');

			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (volume > 100) return interaction.reply('Volume can\'t exceed 100');
		player.setVolume(volume);

		embed.setColor('Green');
		embed.setDescription(`Volume has been set to **${volume}%**`);

		return interaction.reply({ embeds: [embed] });
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};