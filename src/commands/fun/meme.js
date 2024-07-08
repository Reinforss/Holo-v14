const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');
const { get } = require('node-superfetch');

module.exports = class Meme extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('meme')
				.setDescription('[Holo | Fun] Get a meme!')
				.setDMPermission(true),
			usage: 'meme',
			category: 'Fun',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
        await interaction.deferReply();
        const { body } = await get('https://apis.duncte123.me/meme');

        const embed = new EmbedBuilder()
            .setTitle(body.data.title)
            .setURL(body.data.url)
            .setImage(body.data.image)
            .setColor('Random')
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
	}
};
