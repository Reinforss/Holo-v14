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
        // await interaction.deferReply();
		try {

		const user = interaction.options.getUser('user') || interaction.user;

        let economyData = await ecoModel.findOne({ userID: user.id });
        let funData = await funModel.findOne({ userID: user.id });
        let userData = await userModel.findOne({ userID: user.id });

        if (!economyData) {
			economyData = new ecoModel({ userID: user.id });
			await economyData.save();
		}

		if (!userData) {
			userData = new userModel({ userID: user.id });
			await userData.save();
		}

		if (!funData) {
			funData = new funModel({ userID: user.id });
			await funData.save();
		}

		const currentLevel = userData.level || 0;
		const currentXP = userData.experience || 0;
		const nextLevelXP = 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100;

		const progress = Math.min((currentXP / nextLevelXP) * 10, 10);
		const progressBar = '▰'.repeat(Math.floor(progress)) + '▱'.repeat(10 - Math.floor(progress));

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s profile`)
            .setThumbnail(user.displayAvatarURL({ dynamic:true }))
            .addFields(
				{ name: '**__Leveling__**', value: `Level: **\`${currentLevel}\`**\nExperience: **\`${currentXP}/${nextLevelXP}\`**\n${progressBar}` },
                { name: '**__Balance__**', value: `${economyData.balance || 0}`, inline: true },
                { name: '**__Reputation__**', value: `${funData.reputation || 0}`, inline: true },
                { name: '**__Commands__**', value: `Total: **\`${userData.commandRun || 0}\`**\nMost Used: **\`${userData.mostUsedCommand || 'None'}\`**`, inline: true },
            )
            .setColor('Random');

        return interaction.reply({ embeds: [embed] });
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};