/* eslint-disable no-case-declarations */
const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { get } = require('node-superfetch');

module.exports = class Image extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('image')
				.setDescription('[Holo | Fun] Tell Holo to retrieve specified image.')
				.setDMPermission(true)
				.addSubcommand(subcommand => subcommand
					.setName('kemonomimi')
					.setDescription('[Holo | Fun | Image] Get a kemonomimi image.'),
				)
				.addSubcommand(subcommand => subcommand
					.setName('holo')
					.setDescription('[Holo | Fun | Image] Get a holo image.'),
				)
				.addSubcommand(subcommand => subcommand
					.setName('captcha')
					.setDescription('[Holo | Fun | Image] Set someone as captcha!')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to turn into captcha'),
					),
				),
			usage: 'image <option>',
			category: 'Fun',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		await interaction.deferReply();

		const subcommand = interaction.options.getSubcommand();

		const user = interaction.options.getUser('user') || interaction.user;
		switch (subcommand) {
		case 'kemonomimi': {
			const { body } = await get('https://nekobot.xyz/api/image?type=kemonomimi');

			const embed = new EmbedBuilder()
				.setTitle('**Kemonomimi**')
				.setImage(body.message)
				.setColor('Random')
				.setTimestamp();

			interaction.editReply({ embeds: [embed] });
			break;
		}
		case 'holo': {
			const { body } = await get('https://nekobot.xyz/api/image?type=holo');

			const embed = new EmbedBuilder()
				.setTitle('**Holo**')
				.setImage(body.message)
				.setColor('Random')
				.setTimestamp();

			interaction.editReply({ embeds: [embed] });
			break;
		}
		case 'captcha': {
			const { body } = await get(`https://nekobot.xyz/api/imagegen?type=captcha&url=${user.avatarURL({ dynamic: false, extension: 'png' })}&username=${user.username}`);
			const embed = new EmbedBuilder()
				.setImage(body.message)
				.setColor('Random')
				.setTimestamp();

			interaction.editReply({ embeds: [embed] });
			break;
		}
		}
	}
};