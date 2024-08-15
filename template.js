const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Example extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('')
				.setDescription('')
				.setDMPermission(true),
			usage: '',
			category: '',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client) {
		try {
		if (!this.run) throw new RangeError('Expected a run method');
		}
		catch (e) {
			await client.hook.sendError('An error occurred', `**${e.stack.split('\n')[0]}**\n${e.stack.split('\n').slice(1).join('\n')}`);
		}
	}
};
