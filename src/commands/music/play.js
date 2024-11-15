/* eslint-disable no-useless-escape */
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
					.setDescription('Provide song name.')
					.setRequired(true),
				),
			usage: 'play <music>',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction, player) {
		try {

		await interaction.deferReply();

		// if (interaction.user.id !== '519521318719324181') return interaction.editReply('`❌` | The music system is currently under maintenance. We apologize for the inconvenience and expect it to be back soon!');

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

		const urlPattern = /^(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+|\S+)|youtu\.be\/[A-Za-z0-9_-]+)(?:[^\s]*)?)$/;
		if (urlPattern.test(song)) {
			embed.setDescription('`❌` | YouTube links are disabled. Please provide a song name instead!');
			return interaction.editReply({ embeds: [embed] });
		}

		let src;
		const res = await client.poru.resolve({ query: song, source:src || 'dzsearch', requester: interaction.user });
		const { loadType, tracks, playlistInfo } = res;

		console.log(loadType);

		switch (loadType) {
			case 'empty':
					if (src === 'dzsearch') {
						src = 'spsearch';
						const spRes = await client.poru.resolve({ query: song, source: src, requester: interaction.user });
						const { loadType: spLoadType, tracks: spTracks } = spRes;

						if (spLoadType === 'empty') {
							src = 'ytmsearch';
							const ytmRes = await client.poru.resolve({ query: song, source: src, requester: interaction.user });
							const { loadType: ytmLoadType, tracks: ytmTracks } = ytmRes;

							if (ytmLoadType === 'empty' || ytmTracks.length === 0) {
								embed.setDescription('`❌` | No results found on Deezer, Spotify, or YouTube Music!');
								return interaction.editReply({ embeds: [embed] });
							}
							tracks.push(...ytmTracks);
						}
						else {
							tracks.push(...spTracks);
						}
					}
				break;
			case 'error':
				embed.setDescription('`❌` | Song was no found or Failed to load song!');

				interaction.editReply({ embeds: [embed] });
			break;
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
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
