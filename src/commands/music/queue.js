const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const lodash = require('lodash');
const formatDuration = require('../../util/FormatDuration');

module.exports = class Example extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('queue')
				.setDescription('[Holo | Music] Show current player queue.')
				.setDMPermission(true),
			usage: 'queue',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const player = client.poru.players.get(interaction.guild.id);

		await interaction.deferReply({ ephemeral: false });

		if (!player || player.queue.size == 0) {
			const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song are currently being played.');

			return interaction.editReply({ embeds: [noPlayer] });
		}

		const emoji = client.emoji.queue;
		const npSong = player.currentTrack.info;
		const currentDuration = formatDuration(npSong.length);
		const currentTitle = npSong.title.length > 40 ? npSong.title.substr(0, 40) + '...' : npSong.title;
		const npDuration = npSong.isStream ? 'LIVE' : currentDuration;
		const npTitle = npSong.title ? currentTitle : 'Unknown';

		const queue = player.queue.map(
			(track, index) =>
				`**${index + 1}. [${
					track.info.title
						? track.info.title.length > 40
							? track.info.title.substr(0, 40) + '...'
							: track.info.title
						: 'Unknown'
				}](${track.info.uri})** • \`${track.info.isStream ? 'LIVE' : formatDuration(track.info.length)}\` • ${
					track.info.requester
				}`,
		);

		const pages = lodash.chunk(queue, 10).map((x) => x.join('\n'));

		let page = 0;

		const embed = new EmbedBuilder()
			.setAuthor({ name: 'Queue List', iconURL: interaction.guild.iconURL({ dynamic: true }) })
			.setColor('Random')
			.setThumbnail(npSong.image)
			.setDescription(
				`**__Now Playing__**\n**[${npTitle}](${npSong.uri})** • \`${npDuration}\` • ${npSong.requester}\n\n**__Up Next__**\n${
					pages[page] ? pages[page] : 'Queue is empty'
				}`,
			)
			.setFooter({
				text: `Total Queued • ${player.queue.length} tracks`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
			})
			.setTimestamp();

		const back = new ButtonBuilder().setCustomId('back').setEmoji(emoji.back).setStyle(ButtonStyle.Secondary);
		const cancel = new ButtonBuilder().setCustomId('cancel').setEmoji(emoji.cancel).setStyle(ButtonStyle.Danger);
		const next = new ButtonBuilder().setCustomId('next').setEmoji(emoji.next).setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder().addComponents(back, cancel, next);

		if (pages.length <= 1) {
			return interaction.editReply({ embeds: [embed] });
		}
		else {
			await interaction.editReply({ embeds: [embed], components: [row] }).then((msg) => {
				const collector = msg.createMessageComponentCollector({ time: 60000 });

				collector.on('collect', async (message) => {
					if (message.customId === 'back') {
						message.deferUpdate();

						page = page - 1 < 0 ? pages.length - 1 : --page;

						embed.setDescription(
							`**__Now Playing__**\n**[${npTitle}](${npSong.uri})** • \`${npDuration}\` • ${npSong.requester}\n\n**__Up Next__**\n${pages[page]}`,
						);

						return msg.edit({ embeds: [embed], components: [row] });
					}
					else if (message.customId === 'cancel') {
						message.deferUpdate();

						await msg.edit({ embeds: [embed], components: [] });

						return collector.stop();
					}
					else if (message.customId === 'next') {
						message.deferUpdate();

						page = page + 1 >= pages.length ? 0 : ++page;

						embed.setDescription(
							`**__Now Playing__**\n**[${npTitle}](${npSong.uri})** • \`${npDuration}\` • ${npSong.requester}\n\n**__Up Next__**\n${pages[page]}`,
						);

						return msg.edit({ embeds: [embed], components: [row] });
					}
				});

				collector.on('end', async (collected, reason) => {
					if (reason === 'time' || !collected.size) {
						return msg.edit({ embeds: [embed], components: [] });
					}
				});
			});
		}
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
