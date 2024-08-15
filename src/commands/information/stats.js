const Command = require('../../structures/CommandClass');

const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
const { version } = require('../../../package.json');

const { getInfo } = require('discord-hybrid-sharding');

module.exports = class Stats extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('stats')
				.setDescription('[Holo: Information] Check statistics of the bot')
				.setDMPermission(true),
			usage: 'stats',
			category: 'Information',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
		const serverEval = await client.cluster.broadcastEval('this.guilds.cache.size');

		const serverCount = serverEval.reduce((prev, val) => prev + val, 0);

		const embed = new EmbedBuilder()
			.setColor('Aqua')
			.addFields({
				name: 'System',
				value: client.util.codeBlock('css', stripIndents`
                Memory Usage : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100} MB
                Guilds       : ${serverCount}
                Users        : ${client.users.cache.size}
                Node         : ${process.version}
                Client       : ${version}
                Uptime       : ${client.util.timeString(process.uptime())}
                Shards       : ${client.cluster.id}/${getInfo().TOTAL_SHARDS}`),
			});

		interaction.reply({ embeds: [embed] });
	}
	catch (e) {
		await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
		return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
	}
}
};
