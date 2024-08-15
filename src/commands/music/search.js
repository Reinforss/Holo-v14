/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const formatDuration = require('../../util/FormatDuration');

module.exports = class Search extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('search')
				.setDescription('[Holo | Music] Search a music')
				.setDMPermission(true)
				.addStringOption(option => option
					.setName('query')
					.setDescription('The music title')
					.setRequired(true),
				),
			usage: 'search <music>',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		let player = client.poru.players.get(interaction.guild.id);

		const query = interaction.options.getString('query');

		if (!interaction.member.voice.channel) {
			const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on voice channel to use this command!');

			return interaction.reply({ embeds: [errorEmbed] });
		}

		if (player && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			const warning = new EmbedBuilder()
				.setColor('Random')
				.setDescription('`❌` | You must be on the same voice channel as me to use this command.')
				.setTimestamp();

			return interaction.reply({ embeds: [warning] });
		}

		if (/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(query)) {
			const embed = new EmbedBuilder()
				.setDescription('`❌` | Please use `/play` command for url search query.')
				.setColor('Random');

			return interaction.reply({ embeds: [embed] });
		}

		await interaction.deferReply({ ephemeral: false });

		const res = await client.poru.resolve({ query: query, requester: interaction.user });
		const { tracks } = res;

		const results = tracks.slice(0, 10);

		let n = 0;

		const str = tracks
			.slice(0, 10)
			.map(
				(r) =>
					`\`${++n}.\` **${r.info.title.length > 40 ? r.info.title.substr(0, 40) + '...' : r.info.title}** • ${
						r.info.author
					}`,
			)
			.join('\n');

		const selectMenuArray = [];

		for (let i = 0; i < results.length; i++) {
			const track = results[i];

			let label = `${i + 1}. ${track.info.title}`;

			if (label.length > 50) label = label.substring(0, 47) + '...';

			selectMenuArray.push({
				label: label,
				description: track.info.author,
				value: i.toString(),
			});
		}

		const selection = new ActionRowBuilder().addComponents([
			new StringSelectMenuBuilder()
				.setCustomId('search')
				.setPlaceholder('Please select your song here')
				.setMinValues(1)
				.setMaxValues(1)
				.addOptions(selectMenuArray),
		]);

		const embed = new EmbedBuilder()
			.setAuthor({ name: 'Seach Selection Menu', iconURL: interaction.member.displayAvatarURL({}) })
			.setDescription(str)
			.setColor('Random')
			.setFooter({ text: 'You have 30 seconds to make your selection through the dropdown menu.' });

		await interaction.editReply({ embeds: [embed], components: [selection] }).then((message) => {
			let count = 0;

			const selectMenuCollector = message.createMessageComponentCollector({ time: 30000 });
			const toAdd = [];

			try {
				selectMenuCollector.on('collect', async (menu) => {
					if (menu.user.id !== interaction.member.id) {
						const unused = new EmbedBuilder().setColor('Random').setDescription('`❌` | This menu is not for you!');

						return menu.reply({ embeds: [unused], ephemeral: true });
					}

					menu.deferUpdate();

					if (!player) {
						player = await client.poru.createConnection({
							guildId: interaction.guild.id,
							voiceChannel: interaction.member.voice.channel.id,
							textChannel: interaction.channel.id,
							deaf: true,
						});
					}

					if (player.state !== 'CONNECTED') player.connect();

					for (const value of menu.values) {
						toAdd.push(tracks[value]);
						count++;
					}

					for (const track of toAdd) {
						player.queue.add(track);
					}

					const track = toAdd.shift();
					const trackTitle = track.info.title.length > 15 ? track.info.title.substr(0, 15) + '...' : track.info.title;

					const tplay = new EmbedBuilder()
						.setColor('Random')
						.setDescription(
							`\`➕\` | **[${trackTitle ? trackTitle : 'Unknown'}](${track.info.uri})** • \`${
								track.info.isStream ? 'LIVE' : formatDuration(track.info.length)
							}\` • ${interaction.user}`,
						);

					await message.edit({ embeds: [tplay], components: [] });
					if (!player.isPlaying && !player.isPaused) return player.play();
				});

				selectMenuCollector.on('end', async (collected) => {
					if (!collected.size) {
						const timed = new EmbedBuilder().setColor('Random').setDescription('`❌` | Search was time out.');

						return message.edit({ embeds: [timed], components: [] });
					}
				});
			}
			catch (e) {
				console.log(e);
			}
		});
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
