const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const formatDuration = require('../../util/FormatDuration');

const { EmbedBuilder } = require('discord.js');

module.exports = class Play extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('play')
				.setDescription('[Holo | Music] Play a music')
				.setDMPermission(true)
				.addStringOption(option => option
					.setName('query')
					.setDescription('Provide song name/url.')
					.setRequired(true),
				),
			usage: 'play <music>',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction, player) {

		await interaction.deferReply();

		const song = interaction.options.getString('query');

		const embed = new EmbedBuilder()
			.setColor('Aqua');

		if (!interaction.member.voice.channel) {
			embed.setDescription('`❌` | You must be on voice channel to use this command!');

			return interaction.editReply({ embeds: [embed] });
		}

		if (player && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			embed.setDescription('`❌` | You must be on the same voice channel as me to use this command.');

			return interaction.editReply({ embeds: [embed] });
		}

		const res = await client.poru.resolve({ query: song, requester: interaction.user });
		const { loadType, tracks, playlistInfo } = res;

		if (loadType === 'error' || loadType === 'empty') {
			embed.setDescription('`❌` | Song was no found or Failed to load song!');

			return interaction.editReply({ embeds: [embed] });
		}

		if (!player) {
			player = await client.poru.createConnection({
				guildId: interaction.guild.id,
				voiceChannel: interaction.member.voice.channel.id,
				textChannel: interaction.channel.id,
				deaf: true,
			});
			// player.setVolume(15);
			// console.log(`Volume: ${player.volume}`);
		}

		if (player.state !== 'CONNECTED') player.connect();

		if (loadType === 'playlist') {
			for (const track of tracks) {
				player.queue.add(track);
			}

			embed.setDescription(`\`☑️\` | **[${playlistInfo.name}](${song})** • \`${tracks.length}\` tracks • ${interaction.user}`);

			if (!player.isPlaying && !player.isPaused) player.play();
		}
		else if (loadType === 'search' || loadType === 'track') {
			const track = tracks[0];

			player.queue.add(track);

			embed.setDescription(
				`\`☑️\` | **[${track.info.title ? track.info.title : 'Unknown'}]** • \`${
					track.info.isStream ? 'LIVE' : formatDuration(track.info.length)
				}\` • ${interaction.user}`,
			);

			if (!player.isPlaying && !player.isPaused) player.play();
		}

		await interaction.editReply({ embeds: [embed] });
	}
};
