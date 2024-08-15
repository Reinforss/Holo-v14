/* eslint-disable no-unused-vars */
const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');

const reminderModel = require('../../schema/reminder');

module.exports = class Reminder extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('reminder')
				.setDescription('[Holo|Utility] Remind you for specific time')
				.setDMPermission(true)
				.addIntegerOption(option => option
					.setName('number')
					.setDescription('duration you want to input for reminding')
					.setRequired(true))
				.addStringOption(option => option
					.setName('format')
					.setDescription('Format you want to put the duration')
					.setRequired(true)
					.addChoices(
						{
							name: 'day',
							value: 'd',
						},
						{
							name: 'hour',
							value: 'h',
						},
						{
							name: 'minute',
							value: 'm',
						},
						{
							name: 'second',
							value: 's',
						},
					))
				.addStringOption(option => option
					.setName('reason')
					.setDescription('Reason you put this reminder.')
					.setRequired(false)),
			usage: 'reminder <number>[s/m/h/d] [reason]',
			category: 'Utility',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const duration = interaction.options.getInteger('number');
		const reason = interaction.options.getString('reason');
		const format = interaction.options.getString('format');

		let timems;
		switch (format) {
		case 's': {
			timems = duration * 1000;
			break;
		}
		case 'm': {
			timems = duration * 60 * 1000;
			break;
		}
		case 'h': {
			timems = duration * 60 * 60 * 1000;
			break;
		}
		case 'd': {
			timems = duration * 24 * 60 * 60 * 1000;
			break;
		}
		default: {
			return interaction.reply({ content: '⚠ | Available formats: `d` (days), `h` (hours), `m` (minutes), `s` (seconds)', ephemeral: true });
		}
		}

		const reminderData = new reminderModel({
			userID: interaction.user.id,
			reminderDuration: duration,
			reminderFormat: format,
			reminderReason: reason || 'None',
			reminderDate: new Date(new Date().getTime() + timems),
			reminderMsgID: interaction.id,
		});

		await reminderData.save();

		await reminderModel.findOneAndUpdate({ _id: reminderData._id }, { reminderMsgID: interaction.id }, { useFindAndModify: false });

		await interaction.reply({ content: `⏰ | **Alright, I will remind you in** \`${duration}${format}\`, **about:** \`${reason || 'No reason specified'}\`\nPlease make sure your DMs are open so the bot can send a message to your DM.`, ephemeral: true });

		setTimeout(async () => {
			const storedData = await reminderModel.findOne({ reminderMsgID: interaction.id });

			if (storedData) {
				interaction.user.send({ embeds: [client.embeds.reminderEmbed('Reminder', `${storedData.reminderReason}`)] }).catch(_ => interaction.channel.send({ embeds: client.embeds.remiderEmbed('Reminder', `${storedData.reminderReason}\nYour DMs are closed so I'm unable to send the reminder to you directly`), ephemeral: true }));

				await reminderModel.findOneAndDelete({ reminderMsgID: interaction.id }, { useFindAndModify: false });
			}
		}, timems);
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
