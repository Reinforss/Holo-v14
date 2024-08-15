const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const capital = require('node-capitalize');

const votes = new Set();

module.exports = class Loop extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('loop')
				.setDescription('[Holo | Music] Loop the current played track / queue!')
				.setDMPermission(true),
			usage: 'loop',
			category: 'Music',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
			const player = client.poru.players.get(interaction.guild.id);

			const voiceChannel = interaction.member.voice.channel;
			const memberCount = voiceChannel ? voiceChannel.members.size : 1;
			const majority = Math.ceil(memberCount / 2);

			if (!player) {
				const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song is currently being played.');
				return interaction.editReply({ embeds: [noPlayer], ephemeral: true });
			}

			if (!interaction.member.voice.channel) {
				const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on voice channel to use this command!');

				return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
			}

			if (player && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
				const errorEmbed = new EmbedBuilder().setColor('Red').setDescription('`❌` | You must be on the same voice channel as me to use this command.');

				return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
			}
			else {
				const requester = player.currentTrack.info.requester;

			if (interaction.user.id == requester) {
				toggleLoopMode(player);
				votes.clear();
				const requestEmbed = new EmbedBuilder()
					.setColor('Green')
					.setDescription(`\`✅\` | Loop mode: **${capital(player.loop)}**`);
				return interaction.editReply({ embeds: [requestEmbed] });
			}

			if (!votes.has(interaction.user.id)) {
				votes.add(interaction.user.id);
			const voteEmbed = new EmbedBuilder()
				.setColor('Yellow')
				.setDescription(`\`🗳️\` | ${interaction.user} has voted to change the loop mode. \`${votes.size}/${majority}\` votes needed.`);

			await interaction.editReply({ embeds: [voteEmbed] });

			if (votes.size >= majority) {
				toggleLoopMode(player);
				const successEmbed = new EmbedBuilder()
					.setColor('Green')
					.setDescription(`\`✅\` | Loop mode has been changed to **${capital(player.loop)}** by vote.`);

				votes.clear();
				return interaction.editReply({ embeds: [successEmbed] });
			}
		}
		else {
				return interaction.editReply({ content: 'You have already voted to change the loop mode.', ephemeral: true });
		}
		}
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
	}
};

async function toggleLoopMode(player) {
	if (player.loop === 'NONE') {
		await player.setLoop('TRACK');
	}
	else if (player.loop === 'TRACK') {
		await player.setLoop('QUEUE');
	}
	else if (player.loop === 'QUEUE') {
		await player.setLoop('NONE');
	}
}
