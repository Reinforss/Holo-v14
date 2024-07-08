const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');

const { version } = require('../../../package.json');

const { EmbedBuilder } = require('discord.js');
const { get } = require('node-superfetch');

module.exports = class Ship extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('ship')
				.setDescription('[Holo | Fun] Ship People with other people!')
				.setDMPermission(true)
                .addUserOption(option => option
                    .setName('user1')
                    .setDescription('The first user you want to ship')
                    .setRequired(true),
                )
                .addUserOption(option => option
                    .setName('user2')
                    .setDescription('The second user you want to ship with first user')
                    .setRequired(true),
                ),
			usage: 'ship <@user1> <@user2>',
			category: 'Fun',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
        await interaction.deferReply();

		const shipped = interaction.options.getUser('user1');
        const shipper = interaction.options.getUser('user2');

        const { body } = await get(`https://nekobot.xyz/api/imagegen?type=ship&user1=${shipper.displayAvatarURL({ dynamic: false, extension: 'png' })}&user2=${shipped.displayAvatarURL({ dynamic: false, extension: 'png' })}`);

        const first_length = Math.round(shipper.displayName.length / 2);
        const first_half = shipper.displayName.slice(0, first_length);
        const second_length = Math.round(shipped.displayName.length / 2);
        const second_half = shipped.displayName.slice(second_length);
        const final_name = first_half + second_half;
        const score = Math.random() * (0, 100);
        const prog_bar = Math.ceil(Math.round(score) / 100 * 10);
        const counter = '▰'.repeat(prog_bar) + '▱'.repeat(10 - prog_bar);

        const embed = new EmbedBuilder()
            .setTitle(`${shipper.displayName} ❤ ${shipped.displayName}`)
            .setDescription(`**Love ${score.toFixed(0)}%**\n${counter}\n\n${final_name}`)
            .setURL(body.message)
            .setColor('Random')
            .setImage(body.message)
            .setFooter({ text: `Requested by ${interaction.user.username} | ${client.user.username} v${version}` });

        return interaction.editReply({ embeds: [embed] });
	}
};
