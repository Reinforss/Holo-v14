const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

const funModel = require('../../schema/fun');
const ecoModel = require('../../schema/economy');
const userModel = require('../../schema/user');

module.exports = class Profile extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('profile')
				.setDescription('[Holo | Economy] View you or someone profile.')
				.setDMPermission(true)
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('The user you want to check its profile.'),
                ),
			usage: 'profile [@user]',
			category: 'Economy',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
        await interaction.deferReply();

		const user = interaction.options.getUser('user') || interaction.user;

        const economyData = await ecoModel.findOne({ userID: user.id });
        const funData = await funModel.findOne({ userID: user.id });
        const userData = await userModel.findOne({ userID: user.id });

        if (!economyData) {
			new ecoModel({
				username: user.username,
				userID: user.id,
				balance: 0,
				dailyStreak: 1,
			});

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s profile`)
            .setThumbnail(user.displayAvatarURL({ dynamic:true }))
            .addFields(
                { name: '💰 Balance', value: `${economyData.balance || 0}`, inline: true },
                { name: '✅ Reputation', value: `${funData.reputation || 0}`, inline: true },
                { name: '⚙️ Command Run', value: `${userData.commandRun || 0}`, inline: true },
            )
            .setColor('Random');

        return interaction.editReply({ embeds: [embed] });
	}
}
};
