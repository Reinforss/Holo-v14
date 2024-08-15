const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');
const ecoModel = require('../../schema/economy');

const maxMissedDays = 3;
const dailyCooldown = 24 * 60 * 60 * 1000;

module.exports = class Daily extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('daily')
				.setDescription('[Holo|Economy] Give you some credits per day and a reward for claiming it every day')
				.setDMPermission(true)
				.addUserOption(option => option
					.setName('user')
					.setDescription('The user you want to give daily to (optional)'),
				),
			usage: '/daily [user]',
			category: 'Economy',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		if (!this.run) throw new RangeError('Expected a run method');
		try {

		const user = interaction.options.getUser('user') || interaction.user;
		if (user.bot) return interaction.reply('You can\'t give daily to a bot!');

		let giverEconomy = await ecoModel.findOne({ userID: interaction.user.id });
		let receiverEconomy = await ecoModel.findOne({ userID: user.id });

		if (!giverEconomy) {
			giverEconomy = new ecoModel({
				username: interaction.user.username,
				userID: interaction.user.id,
				balance: 0,
				dailyStreak: 1,
				dailyLastClaimed: null,
			});
		}

		if (!receiverEconomy) {
			receiverEconomy = new ecoModel({
				username: user.username,
				userID: user.id,
				balance: 0,
				dailyStreak: 1,
				dailyLastClaimed: null,
			});
		}

		const maxReward = 2000;
		const minReward = 250;
		const baseReward = Math.min(maxReward, minReward * giverEconomy.dailyStreak);

		const now = new Date().getTime();
		const lastClaimedDate = giverEconomy.dailyLastClaimed;

		const daysDifference = Math.floor((now - lastClaimedDate) / (1000 * 60 * 60 * 24));
		if (daysDifference > maxMissedDays) {
			giverEconomy.dailyStreak = 1;
		}
		else {
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
					remainingTime.push(`${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`);
				}
				if (secondsRemaining > 0) {
					remainingTime.push(`${secondsRemaining} second${secondsRemaining > 1 ? 's' : ''}`);
				}

				const remainingTimeStr = remainingTime.join(' ');

				return interaction.reply(`You can claim your daily reward in **${remainingTimeStr}**.`);
			}


			if (giverEconomy.dailyStreak % 7 === 0) {
				const bonus = 3000;
				giverEconomy.balance += bonus;
				giverEconomy.dailyStreak += 1;
				giverEconomy.dailyLastClaimed = now;
				return interaction.reply(`You have claimed your daily reward of **${baseReward} credits**.\nCongratulations! You've reached a streak of **${giverEconomy.dailyStreak} days** and received a bonus of **${bonus} credits!**.`);
			}
			else {
				giverEconomy.balance += baseReward;
				giverEconomy.dailyStreak += 1;
				giverEconomy.dailyLastClaimed = now;
			}
		}

		receiverEconomy.balance += baseReward;
		giverEconomy.dailyLastClaimed = now;

		await giverEconomy.save();
		await receiverEconomy.save();

		if (user.id === interaction.user.id) {
			return interaction.reply(`You have claimed your daily reward of **${baseReward} credits**!\nCurrent Daily Streak: **${giverEconomy.dailyStreak} days**`);
		}
		else {
			return interaction.reply(`You have given your daily reward of **${baseReward} credits** to **${user.username}**.\nYour Current Daily Streak: **${giverEconomy.dailyStreak} days**`);
		}
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
