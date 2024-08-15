/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable no-const-assign */
const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');

const ecoModel = require('../../schema/economy');
module.exports = class Balance extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('balance')
				.setDescription('[Holo|Economy] See specified user balance')
				.setDMPermission(true)
				.addUserOption(option => option
					.setName('user')
					.setDescription('User you want to check their balance'),
				),
			usage: 'balance [@user]',
			category: 'Economy',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		if (!this.run) throw new RangeError('Expected a run method');
		try {

		const user = interaction.options.getUser('user') || interaction.user;
		if (user.bot) return interaction.reply('Bots cannot have a money!');

		const economy = await ecoModel.findOne({ userID: user.id });

		if (!economy) {
			let economy = new ecoModel({
				username: user.username,
				userID: user.id,
				balance: 0,
				dailyStreak: 1,
			});

			await economy.save();

			return interaction.reply(`**${user.username}** apparently doesn't have balance. Try other person?`);
		}

		if (user.id === interaction.user.id) {
			return interaction.reply(`Your balance is **${economy.balance} credits.**`);
		}
		else {
			return interaction.reply(`**${user.username}** credits is **${economy.balance} credits.**`);
		}
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
