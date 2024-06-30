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
		const player = client.poru.players.get(interaction.guild.id);

		await interaction.deferReply();

		const voiceChannel = interaction.member.voice.channel;
		const requester = player.currentTrack.info.requester;
		const memberCount = voiceChannel ? voiceChannel.members.size : 1;
		const majority = Math.ceil(memberCount / 2);

		if (!player) {
			const noPlayer = new EmbedBuilder().setColor('Red').setDescription('`❌` | No song is currently being played.');
			return interaction.editReply({ embeds: [noPlayer], ephemeral: true });
		}

		if (interaction.user.id === requester) {
			this.toggleLoopMode(player);
			const requestEmbed = new EmbedBuilder()
				.setColor('Green')
				.setDescription(`\`✅\` | Loop mode: ${capital(player.loop)}`);
			return interaction.editReply({ embeds: [requestEmbed] });
		}

		if (votes.has(interaction.user.id)) {
			return interaction.editReply({ content: 'You have already voted to change the loop mode.', ephemeral: true });
		}

		votes.add(interaction.user.id);

		const voteEmbed = new EmbedBuilder()
			.setColor('Yellow')
			.setDescription(`\`🗳️\` | ${interaction.user} has voted to change the loop mode. \`${votes.size}/${majority}\` votes needed.`);

		await interaction.editReply({ embeds: [voteEmbed] });

		if (votes.size >= majority) {
			this.toggleLoopMode(player);
			const successEmbed = new EmbedBuilder()
				.setColor('Green')
				.setDescription(`\`✅\` | Loop mode has been changed to **${capital(player.loop)}** by vote.`);
			this.resetVotes();
			return interaction.editReply({ embeds: [successEmbed] });
		}
	}

	toggleLoopMode(player) {
		if (player.loop === 'NONE') {
			player.setLoop('TRACK');
		}
        else if (player.loop === 'TRACK') {
            player.setLoop('QUEUE');
        }
        else if (player.loop === 'QUEUE') {
			player.setLoop('NONE');
		}
	}

	resetVotes() {
		votes.clear();
	}
};
