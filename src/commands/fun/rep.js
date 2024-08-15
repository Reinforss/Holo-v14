const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');
const funModel = require('../../schema/fun');

const dailyCooldown = 24 * 60 * 60 * 1000;

module.exports = class Reputation extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('rep')
				.setDescription('[Holo | Fun] Give user a reputation')
				.setDMPermission(true)
				.addUserOption(option => option
					.setName('user')
					.setDescription('The user you want to give reputation')
					.setRequired(true),
				),
			usage: 'rep <@user>',
			category: 'Fun',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		await interaction.deferReply();
		try {
			const user = interaction.options.getUser('user');

			if (user.id == interaction.user.id) return interaction.editReply({ content: '`❌` | You cannot give yourself a reputation.' });
			if (user.bot) return interaction.editReply({ content: '`❌` | You cannot give bot reputation!' });

			let repFromUser = await funModel.findOne({ userID: interaction.user.id });
			let repToUser = await funModel.findOne({ userID: user.id });

			if (!repFromUser) {
				repFromUser = new funModel({
					userID: interaction.user.id,
					triviaWin: 0,
					dailyCooldown: null,
				});
			}

			if (!repToUser) {
				repToUser = new funModel({
					userID: user.id,
					triviaWin: 0,
					dailyCooldown: null,
				});
			}

			const now = new Date().getTime();
			const lastClaimedDate = repFromUser.dailyCooldown;

			if (lastClaimedDate && now - lastClaimedDate < dailyCooldown) {
				const remainingCooldown = dailyCooldown - (now - lastClaimedDate);
				const hoursRemaining = Math.floor(remainingCooldown / (1000 * 60 * 60));
				const minutesRemaining = Math.floor((remainingCooldown % (1000 * 60 * 60)) / (1000 * 60));
				const secondsRemaining = Math.floor((remainingCooldown % (1000 * 60)) / 1000);

				const remainingTime = [];
				if (hoursRemaining > 0) {
					remainingTime.push(`${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`);
				}
				if (minutesRemaining > 0) {
					remainingTime.push(`${minutesRemaining} minute${hoursRemaining > 1 ? 's' : ''}`);
				}
				if (secondsRemaining > 0) {
					remainingTime.push(`${secondsRemaining} seconds${hoursRemaining > 1 ? 's' : ''}`);
				}

				const remainingTimeStr = remainingTime.join(' ');

				return interaction.editReply({ content: `You can give more reputation in **${remainingTimeStr}**` });

			}

			repToUser.reputation += 1;
			repFromUser.dailyCooldown = now;

			await repToUser.save();
			await repFromUser.save();

			return interaction.editReply({ content: `You have given your reputation to **${user.username}**` });

		}
		catch (e) {
			await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
			return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
		}
	}
};
