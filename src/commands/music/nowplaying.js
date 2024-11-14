/* eslint-disable no-mixed-spaces-and-tabs */
const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

const formatDuration = require('../../util/FormatDuration');
const capital = require('node-capitalize');

module.exports = class NowPlaying extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('nowplaying')
				.setDescription('[Holo | Music] Show the current playing song')
				.setDMPermission(true),
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


		if (!player) {
			const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song are currently being played.');

			return interaction.reply({ embeds: [noPlayer], ephemeral: true });
		}

		try {
			const Titles =
                player.currentTrack.info.title.length > 40
                	? player.currentTrack.info.title.substr(0, 40) + '...'
                	: player.currentTrack.info.title;
			const Author =
                player.currentTrack.info.author.length > 40
                	? player.currentTrack.info.author.substr(0, 40) + '...'
                	: player.currentTrack.info.author;
			const currentPosition = formatDuration(player.position);
			const trackDuration = formatDuration(player.currentTrack.info.length);
			const playerDuration = player.currentTrack.info.isStream ? 'LIVE' : trackDuration;
			const currentAuthor = player.currentTrack.info.author ? Author : 'Unknown';
			const currentTitle = player.currentTrack.info.title ? Titles : 'Unknown';
			const Part = Math.floor((player.position / player.currentTrack.info.length) * 30);
			const Emoji = player.isPlaying ? '🕒 |' : '⏸ |';

			const embed = new EmbedBuilder()
				.setAuthor({
					name: player.isPlaying ? 'Now Playing' : 'Song Paused',
					iconURL: 'https://cdn.discordapp.com/attachments/1107701463947419658/1254688088941264906/music-disc.gif?ex=667a66d7&is=66791557&hm=f70af6acef89c310a36f603d6e05c89dbd35070bfa8e30b694c5aa91be9c8398&',
				})
				.setThumbnail(player.currentTrack.info.image)
				.setDescription(`**[${currentTitle}](${player.currentTrack.info.uri})**`)
				.addFields([
					{ name: 'Author:', value: `${currentAuthor}`, inline: true },
					{ name: 'Requested By:', value: `${player.currentTrack.info.requester}`, inline: true },
					{ name: 'Duration:', value: `${playerDuration}`, inline: true },
					{ name: 'Volume:', value: `${player.volume}%`, inline: true },
					{ name: 'Loop Mode:', value: `${capital(player.loop)}`, inline: true },
					{ name: 'Queue Left:', value: `${player.queue.length}`, inline: true },
					{
						name: `Song Progress: \`[${currentPosition}]\``,
						value: `\`\`\`${Emoji} ${'─'.repeat(Part) + '🔵' + '─'.repeat(30 - Part)}\`\`\``,
						inline: false,
					},
				])
				.setColor('Random')
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
		catch (error) {
			console.log(error);
			return interaction.reply({ content: '`❌` | Nothing is playing or song has been ended!', ephemeral: true });
		}
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};