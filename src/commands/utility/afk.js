/* eslint-disable no-undef */
const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');
const userModel = require('../../schema/user');

module.exports = class Afk extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('afk')
				.setDescription('[Holo|Utility] Set your status as AFK, when people mention you. They will know you\'re not around.')
				.setDMPermission(true)
				.addStringOption(option => option
					.setName('reason')
					.setDescription('Reason you set your afk. You can leave this blank.')
					.setRequired(false),
				),
			usage: 'afk [reason]',
			category: 'Utility',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		if (!this.run) throw new RangeError('Expected a run method');

		let reason = interaction.options.getString('reason');
		if (!reason) reason = 'AFK';
		const userID = interaction.user.id;

		await userModel.findOneAndUpdate(
			{ userID },
			{ afk: reason },
			{ upsert: true, new: true },
		);

		await interaction.reply(`AFK status set: ${reason}`);
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}

};
