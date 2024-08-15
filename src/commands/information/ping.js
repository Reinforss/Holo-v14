const Command = require('../../structures/CommandClass');

const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');

module.exports = class Ping extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('ping')
				.setDescription('[Holo: Information] Returns the bot ping.')
				.setDMPermission(true),
			usage: 'ping',
			category: 'Information',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const now = Date.now();
		const pingEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${client.user.username}'s Ping`,
				iconURL: client.user.displayAvatarURL({ size: 2048 }),
			})
			.setColor('#fee75c')
			.setDescription(stripIndents`
            **⏱ Roundtrip:** ${Math.round(Date.now() - now)} ms
            **💓 API:** ${Math.round(client.ws.ping)} ms
            `);

		return await interaction.reply({ embeds: [pingEmbed] });
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
