const Command = require('../../structures/CommandClass');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Avatar extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('avatar')
				.setDescription('[Holo|Utility] Show your or others avatar')
				.setDMPermission(true)
				.addUserOption(option => option.setName('user')
					.setDescription('The user you want to view its avatar')
					.setRequired(false)),
			usage: 'avatar [@user]',
			category: 'Utility',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const user = interaction.options.getUser('user') || interaction.user;
		const embed = new EmbedBuilder()
			.setTitle(`${user.tag} Avatar`)
			.setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))
			.setColor('Random');

		interaction.reply({ embeds: [embed] });
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
